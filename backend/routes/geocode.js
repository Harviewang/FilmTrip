const express = require('express');
const router = express.Router();
const https = require('https');
const { translateAddress, getCountryTranslation } = require('./geocode-translations');

// 清理中英文混合文本，提取中文或保留翻译结果
function cleanBilingualText(text) {
  if (!text) return text;
  
  // 如果包含中文，提取所有中文部分（移除所有英文）
  const chineseMatch = text.match(/[\u4e00-\u9fa5]+/g);
  if (chineseMatch) {
    return chineseMatch.join('');
  }
  
  // 如果不包含中文，尝试移除重复的英文（如 "Hong Kong Hong Kong"）
  return text.replace(/\b([a-zA-Z\s]+)\s+\1\b/gi, '$1').trim();
}

// 清理特殊格式文本
function cleanSpecialFormat(text) {
  if (!text) return text;
  
  // 处理 "Alba / Scotland" 或 "Inbhir Nis / Inverness" 等双语格式
  if (text.includes(' / ')) {
    const parts = text.split(' / ').map(p => p.trim()).filter(p => p);
    
    if (parts.length === 0) return text;
    
    // 策略1：优先检查最后一段是否在翻译表中（如果能查到说明是标准英文名）
    // 因为MapTiler通常把英文放在后面，且翻译表包含的是标准英文名
    const { translations } = require('./geocode-translations');
    const lastPart = parts[parts.length - 1];
    
    // 检查英国地区翻译表和城市翻译表（包括省份和城市）
    if (translations.ukRegions && translations.ukRegions[lastPart]) {
      return lastPart;
    }
    if (translations.ukCities && translations.ukCities[lastPart]) {
      return lastPart;
    }
    
    // 策略2：检查所有部分是否在翻译表中（优先返回能在翻译表中找到的）
    // 先从后往前检查（优先匹配后面的，因为MapTiler常把英文放后）
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      if (translations.ukRegions && translations.ukRegions[part]) {
        return part;
      }
      if (translations.ukCities && translations.ukCities[part]) {
        return part;
      }
    }
    
    // 策略3：如果都是ASCII字符，需要更智能的判断
    const allAscii = parts.every(p => /^[\x00-\x7F]+$/.test(p));
    if (allAscii) {
      // 检查是否有部分在翻译表中（优先返回更标准的名）
      let foundInTranslation = null;
      for (const part of parts) {
        if ((translations.ukRegions && translations.ukRegions[part]) ||
            (translations.ukCities && translations.ukCities[part])) {
          foundInTranslation = part;
          break; // 优先选择第一个在翻译表中的
        }
      }
      if (foundInTranslation) {
        return foundInTranslation;
      }
      
      // 如果都不在翻译表中，计算每个部分的"英文可能性"分数
      // 得分因素：1) 有英文后缀 +3分  2) 常见英文地名后缀 +2分  3) 单词且首字母大写 +1分
      // 4) 常见英文单词组合 +1分  5) 长度较短（英文地名通常更短，但不够可靠，暂不使用）
      const scoreEnglish = (str) => {
        let score = 0;
        
        // 常见英文地名后缀（相对可靠）
        const commonSuffixes = ['shire', 'ton', 'ham', 'ford', 'bridge', 'port', 'mouth', 'borough', 'city', 'town'];
        if (commonSuffixes.some(suffix => str.toLowerCase().endsWith(suffix))) {
          score += 3;
        }
        
        // 其他英文后缀
        const otherSuffixes = ['land', 'side', 'vale', 'wood', 'field', 'hill', 'bay', 'isle', 'sea'];
        if (otherSuffixes.some(suffix => str.toLowerCase().endsWith(suffix))) {
          score += 2;
        }
        
        // 单词且首字母大写（可能是地名，但不够可靠）
        if (/^[A-Z][a-z]+$/.test(str)) {
          score += 1;
        }
        
        // 常见英文单词组合（如"New York"、"Great Britain"等）
        const commonEnglishWords = ['new', 'old', 'great', 'little', 'north', 'south', 'east', 'west', 'upper', 'lower', 'royal'];
        const words = str.toLowerCase().split(/\s+/);
        if (words.some(word => commonEnglishWords.includes(word))) {
          score += 1;
        }
        
        return score;
      };
      
      // 如果有部分明显更可能是英文（得分更高），优先返回
      const scores = parts.map(p => ({ part: p, score: scoreEnglish(p) }));
      const maxScore = Math.max(...scores.map(s => s.score));
      if (maxScore > 0) {
        // 如果只有一个最高分，直接返回
        const maxScoreParts = scores.filter(s => s.score === maxScore);
        if (maxScoreParts.length === 1) {
          return maxScoreParts[0].part;
        }
        // 如果有多个相同最高分，优先返回最后一段（MapTiler通常把英文放在后面）
        // 例如："Roma / Rome"、"Milano / Milan"，两个都是1分，应该返回"Rome"、"Milan"
        return lastPart;
      }
      
      // 如果得分都为0，优先返回最后一段（MapTiler通常把英文放在后面）
      // 这是基于MapTiler实际行为："本地语 / 英文"的格式更常见
      // 例如："Roma / Rome"、"Milano / Milan"、"Alba / Scotland"
      return lastPart;
    }
    
    // 策略4：优先选择纯ASCII字符的部分（如果混有非ASCII）
    const asciiOnly = parts.find(p => /^[\x00-\x7F]+$/.test(p));
    if (asciiOnly) {
      return asciiOnly;
    }
    
    // 兜底：返回最后一段（MapTiler常把英文放后）
    return lastPart;
  }
  
  // 处理 "City of Edinburgh" -> "Edinburgh"
  // 使用 \s+ 匹配多个空格，确保能处理 "City  of   Edinburgh" 等情况
  const cityOfMatch = text.match(/^City\s+of\s+/i);
  if (cityOfMatch) {
    return text.replace(/^City\s+of\s+/i, '').trim();
  }
  
  return text.trim();
}

// 统一解析MapTiler返回的context
function parseMapTilerContext(context) {
  let country = '';
  let province = '';
  let city = '';
  let district = '';
  let township = '';
  
  if (!context || context.length === 0) {
    return { country, province, city, district, township };
  }
  
  // 先提取country_code
  let countryCode = '';
  context.forEach(item => {
    if (item.country_code) {
      countryCode = item.country_code.toLowerCase();
    }
  });
  
  // 按国家代码分别适配解析策略
  const tempData = {
    country: '',
    province: '',
    city: '',
    district: '',
    township: '',
    // 临时存储字段
    region: '',
    subregion: '',
    county: '',
    municipality: '',
    jointMunicipality: '',
    jointSubmunicipality: '',
    municipalDistrict: '',
    locality: '',
    place: ''
  };
  
  // 遍历context，提取所有可能的字段
  context.forEach(item => {
    const text = item.text || '';
    const id = item.id || '';
    const designation = item.place_designation || '';
    const kind = item.kind || '';
    
    // 国家
    if (id.includes('country.') || designation === 'country') {
      tempData.country = text;
    }
    // 区域/省份
    else if (id.includes('region.')) {
      tempData.region = text;
    }
    // 子区域
    else if (id.includes('subregion.')) {
      tempData.subregion = text;
    }
    // 县/郡
    else if (id.includes('county.')) {
      tempData.county = text;
    }
    // 市政区
    else if (id.includes('municipality.')) {
      tempData.municipality = text;
    }
    // 联合市政区
    else if (id.includes('joint_municipality.')) {
      tempData.jointMunicipality = text;
    }
    // 联合子市政区
    else if (id.includes('joint_submunicipality.')) {
      tempData.jointSubmunicipality = text;
    }
    // 市政区（区级）
    else if (id.includes('municipal_district.')) {
      tempData.municipalDistrict = text;
    }
    // 地方/区域
    else if (id.includes('locality.')) {
      tempData.locality = text;
    }
    // 地点/街区
    else if (id.includes('place.') || id.includes('neighbourhood.')) {
      if (designation === 'quarter' || designation === 'neighbourhood' || kind === 'place') {
        tempData.place = text;
      }
    }
  });
  
  // 按国家代码适配解析策略
  switch (countryCode) {
    case 'gb': // 英国
    case 'uk':
      // 英国结构：region (state) -> county/joint_municipality (city) -> joint_submunicipality (district) -> municipality (township)
      province = cleanSpecialFormat(tempData.region || tempData.subregion || '');
      city = cleanSpecialFormat(tempData.county || tempData.jointMunicipality || '');
      district = cleanSpecialFormat(tempData.jointSubmunicipality || '');
      township = tempData.municipality || tempData.place || '';
      break;
      
    case 'de': // 德国
      // 德国结构：region (city) -> municipal_district (district) -> locality (suburb)
      city = tempData.region || '';
      district = tempData.municipalDistrict || tempData.locality || '';
      township = tempData.place || '';
      break;
      
    case 'es': // 西班牙
      // 西班牙结构：region/subregion (province) -> municipality (city) -> municipal_district (district) -> locality (quarter) -> place (neighbourhood)
      province = tempData.region || tempData.subregion || '';
      city = tempData.municipality || '';
      district = tempData.municipalDistrict || tempData.locality || '';
      township = tempData.place || '';
      break;
      
    case 'it': // 意大利
      // 意大利结构：region (state) -> municipality (city) -> locality (district) -> place (quarter)
      province = tempData.region || '';
      city = tempData.municipality || tempData.county || '';
      district = tempData.locality || '';
      township = tempData.place || '';
      break;
      
    case 'ph': // 菲律宾
      // 菲律宾结构：region (province) -> municipality (city) -> locality (suburb) -> municipal_district (district) -> place (quarter)
      province = tempData.region || '';
      city = tempData.municipality || '';
      district = tempData.municipalDistrict || tempData.locality || '';
      township = tempData.place || '';
      break;
      
    case 'mx': // 墨西哥
      // 墨西哥结构：region/locality (city) -> municipality (borough) -> place (neighbourhood)
      city = tempData.region || tempData.locality || '';
      district = tempData.municipality || '';
      township = tempData.place || '';
      break;
      
    case 'br': // 巴西
      // 巴西结构：region (state) -> municipality (city) -> locality (district)
      province = tempData.region || tempData.subregion || '';
      city = tempData.municipality || '';
      district = tempData.locality || '';
      township = tempData.place || '';
      break;
      
    default:
      // 通用策略：尝试推断
      province = tempData.region || tempData.subregion || '';
      city = tempData.county || tempData.jointMunicipality || tempData.municipality || tempData.locality || '';
      district = tempData.jointSubmunicipality || tempData.municipalDistrict || '';
      township = tempData.place || '';
      
      // 如果只有township（景点/街区）但没有city，尝试从更大的层级推断
      if (township && !city) {
        if (province) {
          const provinceLower = province.toLowerCase();
          if (provinceLower.includes('manila') || provinceLower.includes('metro manila')) {
            city = 'Manila';
          }
        }
      }
      break;
  }
  
  country = tempData.country || '';
  
  // 清理空值
  if (!province || province === '') province = '';
  if (!city || city === '') city = '';
  if (!district || district === '') district = '';
  if (!township || township === '') township = '';
  
  // 特殊处理：中国地区的港澳台地址（country_code是"cn"但实际是港澳台）
  if (countryCode && countryCode.toLowerCase() === 'cn') {
    // 检查原始的text字段是否包含香港、澳门、台湾关键词
    let isHKMOTW = false;
    let regionCode = '';
    
    context.forEach(item => {
      const text = (item.text || '').toLowerCase();
      if (text.includes('hong kong') || text.includes('香港')) {
        isHKMOTW = true;
        regionCode = 'hk';
      } else if (text.includes('macau') || text.includes('macao') || text.includes('澳门')) {
        isHKMOTW = true;
        regionCode = 'mo';
      } else if (text.includes('taiwan') || text.includes('台湾')) {
        isHKMOTW = true;
        regionCode = 'tw';
      }
    });
    
    if (isHKMOTW) {
      // 清理中英文混合
      country = cleanBilingualText(country);
      province = cleanBilingualText(province);
      city = cleanBilingualText(city);
      district = cleanBilingualText(district);
      
      // 应用地区翻译
      if (district) {
        district = translateAddress(regionCode, district, 'district');
      }
      if (city) {
        city = translateAddress(regionCode, city, 'city');
      }
    }
  }
  
  // 处理中国省份翻译（包括新疆等）
  if (countryCode && countryCode.toLowerCase() === 'cn') {
    const { getChinaProvinceTranslation } = require('./geocode-translations');
    if (province) {
      province = getChinaProvinceTranslation(province);
    }
  }
  
  // 翻译国外地址和中国特别行政区（香港、澳门、台湾）
  if (countryCode && countryCode.toLowerCase() !== 'cn') {
    // 清理港澳台地区的中英文混合文本（在翻译之前）
    if (['hk', 'mo', 'tw'].includes(countryCode.toLowerCase())) {
      country = cleanBilingualText(country);
      province = cleanBilingualText(province);
      city = cleanBilingualText(city);
      district = cleanBilingualText(district);
    }
    
    // 翻译国家名（先尝试使用countryCode，如果失败则尝试使用country名称）
    let countryTranslated = getCountryTranslation(countryCode.toLowerCase());
    if (!countryTranslated && country) {
      // 如果使用countryCode没有找到翻译，尝试使用country名称
      countryTranslated = getCountryTranslation(country);
    }
    if (countryTranslated) {
      country = countryTranslated;
    }
    
    // 翻译省份/州
    if (province) {
      province = translateAddress(countryCode, province, 'province');
    }
    
    // 翻译城市（city需要补充到映射表）
    if (city && countryCode.toLowerCase() === 'au') {
      const cityTranslations = {
        'Sydney': '悉尼',
        'Melbourne': '墨尔本',
        'Brisbane': '布里斯班',
        'Perth': '珀斯',
        'Adelaide': '阿德莱德',
        'Canberra': '堪培拉',
        'Hobart': '霍巴特',
        'Darwin': '达尔文'
      };
      city = cityTranslations[city] || city;
    }
    
    // 翻译各国城市（包括：香港、澳门、台湾、泰国、菲律宾、新加坡、韩国、澳大利亚、越南、马来西亚、印度尼西亚、英国、法国、美国、德国、西班牙、意大利、墨西哥）
    if (city && ['hk', 'mo', 'tw', 'th', 'ph', 'sg', 'kr', 'au', 'vn', 'my', 'id', 'gb', 'uk', 'fr', 'us', 'de', 'es', 'it', 'mx'].includes(countryCode.toLowerCase())) {
      city = translateAddress(countryCode, city, 'city');
    }
    
    // 翻译区/区域
    if (district && countryCode.toLowerCase() === 'au') {
      const districtTranslations = {
        'Surry Hills': '萨里山',
        'CBD': '中央商务区',
        'Bondi': '邦迪',
        'Kings Cross': '国王十字',
        'Paddington': '帕丁顿'
      };
      district = districtTranslations[district] || district;
    }
    
    // 翻译香港、澳门、台湾的区域
    if (district && ['hk', 'mo', 'tw'].includes(countryCode.toLowerCase())) {
      district = translateAddress(countryCode, district, 'district');
    }
  }
  
  return { country, province, city, district, township };
}

// POST /api/geocode/reverse
// 反向地理编码：坐标 → 地址
router.post('/reverse', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '缺少坐标参数'
      });
    }
    
        // 统一使用MapTiler API（支持全球）
    // ⚠️ 安全：使用环境变量，不要硬编码密钥
    const MAPTILER_KEY = process.env.MAPTILER_KEY || process.env.VITE_MAPTILER_KEY;
    if (!MAPTILER_KEY) {
      console.error('MAPTILER_KEY is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: '地图服务配置错误'
      });
    }
    const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAPTILER_KEY}`;
    
    let result = null;
    
    try {
      const maptilerResponse = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const jsonResult = JSON.parse(data);
              resolve(jsonResult);
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });
      
      if (!maptilerResponse.features || maptilerResponse.features.length === 0) {
        return res.json({
          success: true,
          data: {
            country: '',
            province: '',
            city: '',
            district: '',
            township: '',
            formatted_address: '',
            message: '无法解析该坐标'
          }
        });
      }
      
      // 解析context
      const firstFeature = maptilerResponse.features[0];
      const context = firstFeature.context || [];
      const parsed = parseMapTilerContext(context);
      
      result = {
        ...parsed,
        formatted_address: maptilerResponse.features[0]?.place_name || ''
      };
      
    } catch (error) {
      console.error('MapTiler API调用失败:', error.message);
      return res.status(500).json({
        success: false,
        message: '地址解析失败',
        error: error.message
      });
    }
    
    // 返回结果
    res.json({
      success: true,
      data: {
        ...result,
        latitude,
        longitude,
        source: 'maptiler'
      }
    });
    
  } catch (error) {
    console.error('逆地理编码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// POST /api/geocode/reverse-maptiler (已废弃，统一使用/reverse)
// MapTiler反向地理编码：坐标 → 地址（支持国内外）
router.post('/reverse-maptiler', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '缺少坐标参数'
      });
    }
    
    // ⚠️ 安全：使用环境变量，不要硬编码密钥
    const MAPTILER_KEY = process.env.MAPTILER_KEY || process.env.VITE_MAPTILER_KEY;
    if (!MAPTILER_KEY) {
      console.error('MAPTILER_KEY is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: '地图服务配置错误'
      });
    }
    const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAPTILER_KEY}`;
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
    
    if (!response.features || response.features.length === 0) {
      return res.json({
        success: true,
        data: {
          country: '',
          province: '',
          city: '',
          district: '',
          township: '',
          formatted_address: '',
          message: '无法解析该坐标'
        }
      });
    }
    
    // 解析MapTiler返回的context数组
    const parseMaptilerContext = (features) => {
      let country = '';
      let province = '';
      let city = '';
      let district = '';
      let township = '';
      
      // 从第一个feature的context中提取信息
      const firstFeature = features[0];
      const context = firstFeature.context || [];
      
      context.forEach(item => {
        const text = item.text || '';
        const placeType = item.place_type?.[0] || '';
        const placeDesignation = item.place_designation || '';
        const id = item.id || '';
        
        // 根据id前缀和designation综合判断
        if (id.startsWith('country.') || placeDesignation === 'country') {
          country = text;
        } else if (id.startsWith('region.') || placeDesignation === 'state') {
          province = text;
        } else if (id.startsWith('subregion.') && placeDesignation === 'state' && !province) {
          province = text;
        } else if (id.startsWith('joint_municipality.') || id.startsWith('joint_submunicipality.')) {
          // 这里可能是district或city
          if (!district && (placeDesignation === 'city' || id.includes('joint_municipality'))) {
            // 如果是designation='city'，可能是district级别
            const prevItem = context[context.indexOf(item) - 1];
            if (prevItem && prevItem.id?.startsWith('municipality.')) {
              district = prevItem.text;
            }
          }
        } else if (id.startsWith('municipality.') && !city) {
          // municipality可能是城市或区域
          if (placeDesignation === 'city') {
            city = text;
          } else if (placeDesignation === 'suburb') {
            district = text;
          }
        } else if (id.startsWith('county.') && !city && !district) {
          district = text;
        }
      });
      
      return { country, province, city, district, township };
    };
    
    const { country, province, city, district, township } = parseMaptilerContext(response.features);
    const formatted_address = response.features[0]?.place_name || '';
    
    res.json({
      success: true,
      data: {
        country,
        province,
        city,
        district,
        township,
        formatted_address,
        latitude,
        longitude,
        source: 'maptiler'
      }
    });
    
  } catch (error) {
    console.error('MapTiler逆地理编码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 导出 cleanSpecialFormat 用于单元测试
module.exports = router;
module.exports.cleanSpecialFormat = cleanSpecialFormat;

