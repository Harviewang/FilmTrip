const express = require('express');
const router = express.Router();
const https = require('https');
const { translateAddress, getCountryTranslation } = require('./geocode-translations');

// API密钥
const API_KEYS = {
  amap: 'f82dbd3f01c1f3622f964dd2deb99ccc',
  tencent: 'UYFBZ-FPQKL-YSAPN-MGEZB-RQ3AF-Q7BSW'
};

// 判断是否为国内坐标
function isChinaCoordinate(lat, lng) {
  return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135;
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
  
  // MapTiler的context是倒序的（从详细到宏观）
  // 顺序通常是：postal_code -> neighbourhood -> municipality -> county -> subregion -> region -> country
  // 但需要注意：对于中国，county可能是市（如深圳市），joint_municipality可能是区（如南山区）
  
  // 按顺序遍历context（从详细到宏观）
  const tempData = {};
  
  context.forEach(item => {
    const text = item.text || '';
    const id = item.id || '';
    const designation = item.place_designation || '';
    
    // 存储所有可能的数据
    if (id.includes('country.') || designation === 'country') {
      tempData.country = text;
    } else if (id.includes('region.') && designation === 'state') {
      tempData.province = text;
    } else if (id.includes('subregion.')) {
      if (!tempData.province) {
        tempData.province = text;
      }
    } else if (id.includes('county.') && designation === 'city' && !tempData.city) {
      tempData.city = text;  // 深圳市
    } else if (id.includes('joint_municipality.') && !tempData.jointMunicipality) {
      tempData.jointMunicipality = text;  // 可能是区（南山区）或直辖市区（东城区）
    } else if (id.includes('municipality.') && designation === 'suburb') {
      tempData.township = text;  // 粤海街道
    } else if (id.includes('neighbourhood.')) {
      tempData.township = text;
    }
  });
  
  // 判断层级结构
  // 深圳：county=深圳市(city), joint_municipality=南山区(district)
  // 北京：subregion=北京市(province), joint_municipality=东城区(city)
  
  if (tempData.city && tempData.jointMunicipality) {
    // 有county和joint_municipality → 多层结构（省/市/区）
    city = tempData.city;
    district = tempData.jointMunicipality;
  } else if (tempData.jointMunicipality && !tempData.city) {
    // 只有joint_municipality → 直辖市结构（市/区）
    city = tempData.jointMunicipality;
  } else {
    // 其他情况
    city = tempData.city || '';
    district = tempData.jointMunicipality || '';
  }
  
  country = tempData.country || '';
  province = tempData.province || '';
  township = tempData.township || '';
  
  return { country, province, city, district, township };
}

// 查询高德API
function queryAmap(lat, lng) {
  return new Promise((resolve, reject) => {
    const url = `https://restapi.amap.com/v3/geocode/regeo?key=${API_KEYS.amap}&location=${lng},${lat}&output=json`;
    
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
}

// 查询腾讯API
function queryTencent(lat, lng) {
  return new Promise((resolve, reject) => {
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${API_KEYS.tencent}&get_poi=0`;
    
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
}

// 解析高德返回结果
function parseAmapResult(result) {
  if (!result.status || result.status !== '1') {
    return null;
  }
  
  const addrComp = result.regeocode.addressComponent;
  
  // 处理city字段可能为空数组的问题
  let city = addrComp.city || '';
  if (Array.isArray(city)) {
    city = '';
  }
  
  // 如果city为空，且province包含"市"，则从province提取
  if (!city && addrComp.province) {
    if (addrComp.province.includes('市')) {
      city = addrComp.province;
    } else if (addrComp.province.includes('省')) {
      // 省级城市在district中
      city = addrComp.district || '';
    }
  }
  
  // 处理district和township可能为空数组的问题
  let district = addrComp.district || '';
  if (Array.isArray(district)) {
    district = '';
  }
  
  let township = addrComp.township || '';
  if (Array.isArray(township)) {
    township = '';
  }
  
  return {
    country: addrComp.country || '',
    province: addrComp.province || '',
    city: city,
    district: district,
    township: township,
    formatted_address: result.regeocode.formatted_address || ''
  };
}

// 解析腾讯返回结果
function parseTencentResult(result) {
  if (result.status !== 0) {
    return null;
  }
  
  const addrComp = result.result.address_component;
  const formatted_addresses = result.result.formatted_addresses;
  
  return {
    country: addrComp.nation || '',
    province: addrComp.province || '',
    city: addrComp.city || '',
    district: addrComp.district || '',
    township: addrComp.street || '',
    formatted_address: formatted_addresses ? (formatted_addresses.recommend || formatted_addresses.rough || '') : ''
  };
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
    const MAPTILER_KEY = 'DKuhLqblnLLkKdQ88ScQ';
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

// POST /api/geocode/reverse-maptiler
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
    
    const MAPTILER_KEY = 'DKuhLqblnLLkKdQ88ScQ';
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

module.exports = router;

