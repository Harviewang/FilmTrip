// MapTiler地址翻译映射表
// 用于将国外地址翻译为中文

const translations = {
  // 国家翻译
  country: {
    'us': '美国',
    'gb': '英国',
    'uk': '英国',
    'jp': '日本',
    'fr': '法国',
    'de': '德国',
    'au': '澳大利亚',
    'br': '巴西',
    'za': '南非',
    'ca': '加拿大',
    'in': '印度',
    'kr': '韩国',
    'sg': '新加坡',
    'my': '马来西亚',
    'th': '泰国',
    'ph': '菲律宾',
    'vn': '越南',
    'id': '印度尼西亚',
    'nl': '荷兰',
    'it': '意大利',
    'es': '西班牙',
    'ru': '俄罗斯',
    'mx': '墨西哥',
    'ar': '阿根廷',
    'ch': '瑞士',
    'at': '奥地利',
    'be': '比利时',
    'dk': '丹麦',
    'se': '瑞典',
    'no': '挪威',
    'fi': '芬兰',
    'pl': '波兰',
    'cz': '捷克',
    'gr': '希腊',
    'pt': '葡萄牙',
    'tr': '土耳其',
    'eg': '埃及',
    'sa': '沙特阿拉伯',
    'ae': '阿联酋',
    'nz': '新西兰',
    'ie': '爱尔兰',
    'cn': '中国',
    'hk': '中国香港',
    'mo': '中国澳门',
    'tw': '中国台湾'
  },
  
  // 香港地区翻译
  hkRegions: {
    'Hong Kong Island': '香港岛',
    'Kowloon': '九龙',
    'New Territories': '新界',
    'Central and Western District': '中西区',
    'Wan Chai District': '湾仔区',
    'Eastern District': '东区',
    'Southern District': '南区',
    'Yau Tsim Mong District': '油尖旺区',
    'Sham Shui Po District': '深水埗区',
    'Kowloon City District': '九龙城区',
    'Wong Tai Sin District': '黄大仙区',
    'Kwun Tong District': '观塘区',
    'Kwai Tsing District': '葵青区',
    'Tsuen Wan District': '荃湾区',
    'Tuen Mun District': '屯门区',
    'Yuen Long District': '元朗区',
    'North District': '北区',
    'Tai Po District': '大埔区',
    'Sha Tin District': '沙田区',
    'Sai Kung District': '西贡区',
    'Islands District': '离岛区'
  },
  
  // 澳门地区翻译
  moRegions: {
    'Macau Peninsula': '澳门半岛',
    'Taipa': '氹仔',
    'Coloane': '路环',
    'Cotai': '路氹'
  },
  
  // 台湾地区翻译
  twRegions: {
    'Taipei City': '台北市',
    'New Taipei City': '新北市',
    'Taoyuan City': '桃园市',
    'Taichung City': '台中市',
    'Tainan City': '台南市',
    'Kaohsiung City': '高雄市',
    'Hsinchu County': '新竹县',
    'Miaoli County': '苗栗县',
    'Changhua County': '彰化县',
    'Nantou County': '南投县',
    'Yunlin County': '云林县',
    'Chiayi County': '嘉义县',
    'Pingtung County': '屏东县',
    'Yilan County': '宜兰县',
    'Hualien County': '花莲县',
    'Taitung County': '台东县',
    'Penghu County': '澎湖县',
    'Keelung City': '基隆市',
    'Hsinchu City': '新竹市',
    'Chiayi City': '嘉义市'
  },
  
  // 美国州翻译
  usStates: {
    'New York': '纽约州',
    'California': '加利福尼亚州',
    'Texas': '德克萨斯州',
    'Florida': '佛罗里达州',
    'Illinois': '伊利诺伊州',
    'Pennsylvania': '宾夕法尼亚州',
    'Ohio': '俄亥俄州',
    'Georgia': '佐治亚州',
    'North Carolina': '北卡罗来纳州',
    'Michigan': '密歇根州',
    'New Jersey': '新泽西州',
    'Virginia': '弗吉尼亚州',
    'Washington': '华盛顿州',
    'Arizona': '亚利桑那州',
    'Massachusetts': '马萨诸塞州',
    'Tennessee': '田纳西州',
    'Indiana': '印第安纳州',
    'Missouri': '密苏里州',
    'Maryland': '马里兰州',
    'Wisconsin': '威斯康星州',
    'Colorado': '科罗拉多州',
    'Minnesota': '明尼苏达州',
    'South Carolina': '南卡罗来纳州',
    'Alabama': '阿拉巴马州',
    'Louisiana': '路易斯安那州',
    'Kentucky': '肯塔基州',
    'Oregon': '俄勒冈州',
    'Oklahoma': '俄克拉荷马州',
    'Connecticut': '康涅狄格州',
    'Utah': '犹他州'
  },
  
  // 英国地区翻译
  ukRegions: {
    'England': '英格兰',
    'Scotland': '苏格兰',
    'Wales': '威尔士',
    'Northern Ireland': '北爱尔兰',
    'Greater London': '大伦敦',
    'West Midlands': '西米德兰兹',
    'Greater Manchester': '大曼彻斯特'
  },
  
  // 日本都道府县翻译（部分）
  jpRegions: {
    '東京都': '东京都',
    '大阪府': '大阪府',
    '京都府': '京都府',
    '北海道': '北海道',
    '神奈川県': '神奈川县',
    '埼玉県': '埼玉县',
    '千葉県': '千叶县',
    '兵庫県': '兵库县',
    '福岡県': '福冈县',
    '愛知県': '爱知县'
  },
  
  // 澳大利亚州翻译
  auStates: {
    'New South Wales': '新南威尔士州',
    'Victoria': '维多利亚州',
    'Queensland': '昆士兰州',
    'Western Australia': '西澳大利亚州',
    'South Australia': '南澳大利亚州',
    'Tasmania': '塔斯马尼亚州',
    'Northern Territory': '北领地',
    'Australian Capital Territory': '澳大利亚首都领地'
  }
};

// 获取国家中文名
function getCountryTranslation(countryCode) {
  return translations.country[countryCode] || null;
}

// 获取美国州中文名
function getUSStateTranslation(stateName) {
  return translations.usStates[stateName] || stateName;
}

// 获取英国地区中文名
function getUKRegionTranslation(regionName) {
  return translations.ukRegions[regionName] || regionName;
}

// 获取日本都道府县中文名
function getJPRegionTranslation(regionName) {
  return translations.jpRegions[regionName] || regionName;
}

// 获取澳大利亚州中文名
function getAUStateTranslation(stateName) {
  return translations.auStates[stateName] || stateName;
}

// 获取香港地区中文名
function getHKRegionTranslation(regionName) {
  return translations.hkRegions[regionName] || regionName;
}

// 获取澳门地区中文名
function getMORegionTranslation(regionName) {
  return translations.moRegions[regionName] || regionName;
}

// 获取台湾地区中文名
function getTWRegionTranslation(regionName) {
  return translations.twRegions[regionName] || regionName;
}

// 根据国家代码和地区名获取翻译
function translateAddress(countryCode, regionName, level) {
  if (!countryCode || !regionName) return regionName;
  
  // 移除常见的行政级别后缀
  const cleanName = regionName
    .replace(/ Province$/, '')
    .replace(/ State$/, '')
    .replace(/ Prefecture$/, '')
    .replace(/ County$/, '')
    .trim();
  
  switch (countryCode.toLowerCase()) {
    case 'us':
      return getUSStateTranslation(cleanName);
    case 'gb':
    case 'uk':
      return getUKRegionTranslation(cleanName);
    case 'jp':
      return getJPRegionTranslation(regionName);
    case 'au':
      return getAUStateTranslation(cleanName);
    case 'hk':
      return getHKRegionTranslation(regionName);
    case 'mo':
      return getMORegionTranslation(regionName);
    case 'tw':
      return getTWRegionTranslation(regionName);
    default:
      return regionName;
  }
}

module.exports = {
  translateAddress,
  getCountryTranslation,
  getUSStateTranslation,
  getUKRegionTranslation,
  getJPRegionTranslation,
  getAUStateTranslation,
  getHKRegionTranslation,
  getMORegionTranslation,
  getTWRegionTranslation,
  translations
};

