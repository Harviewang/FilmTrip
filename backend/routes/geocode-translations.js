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
  },
  
  // 日本主要城市翻译
  japanCities: {
    'Tokyo': '东京',
    'Osaka': '大阪',
    'Kyoto': '京都',
    'Yokohama': '横滨',
    'Sapporo': '札幌',
    'Fukuoka': '福冈',
    'Nagoya': '名古屋',
    'Hiroshima': '广岛',
    'Sendai': '仙台',
    'Nara': '奈良',
    'Kamakura': '镰仓',
    'Nikko': '日光',
    'Hakone': '箱根',
    'Kobe': '神户',
    'Nagasaki': '长崎',
    'Okinawa': '冲绳',
    'Shinjuku': '新宿',
    'Shibuya': '涩谷',
    'Harajuku': '原宿',
    'Ginza': '银座',
    'Asakusa': '浅草',
    'Akihabara': '秋叶原',
    'Ikebukuro': '池袋',
    'Ueno': '上野',
    'Tsukiji': '筑地',
    'Roppongi': '六本木',
    'Yokosuka': '横须贺',
    'Kamakura': '镰仓',
    'Enoshima': '江之岛',
    'Fuji': '富士山',
    'Hakodate': '函馆',
    'Otaru': '小樽',
    'Takayama': '高山',
    'Kanazawa': '金泽',
    'Matsumoto': '松本',
    'Nikko': '日光',
    'Kawagoe': '川越',
    'Mount Fuji': '富士山'
  },
  
  // 泰国主要城市翻译
  thailandCities: {
    'Bangkok': '曼谷',
    'Chiang Mai': '清迈',
    'Phuket': '普吉岛',
    'Pattaya': '芭堤雅',
    'Ayutthaya': '大城',
    'Sukhothai': '素可泰',
    'Kanchanaburi': '北碧',
    'Hua Hin': '华欣',
    'Chiang Rai': '清莱',
    'Krabi': '甲米'
  },
  
  // 菲律宾主要城市翻译
  philippinesCities: {
    'Manila': '马尼拉',
    'Cebu': '宿务',
    'Boracay': '长滩岛',
    'Davao': '达沃',
    'Palawan': '巴拉望',
    'Bohol': '薄荷岛',
    'Siargao': '锡亚尔高',
    'Coron': '科隆',
    'El Nido': '爱妮岛',
    'Baguio': '碧瑶',
    'Tagaytay': '大雅台',
    'Puerto Princesa': '普林塞萨港',
    'Batangas': '八打雁',
    'Iloilo': '伊洛伊洛',
    'Bacolod': '巴科洛德',
    'Cagayan de Oro': '卡加延德奥罗',
    'Zamboanga': '三宝颜',
    'Legazpi': '黎牙实比',
    'Vigan': '维甘',
    'Panglao': '邦劳岛',
    'Moalboal': '莫阿尔博阿尔',
    'Oslob': '奥斯洛布',
    'Siquijor': '锡基霍尔岛',
    'Camiguin': '卡米金岛'
  },
  
  // 新加坡行政区翻译
  singaporeRegions: {
    'Singapore': '新加坡',
    'Central Region': '中央区',
    'East Region': '东区',
    'North Region': '北区',
    'North-East Region': '东北区',
    'West Region': '西区'
  },
  
  // 韩国主要城市翻译
  koreaCities: {
    'Seoul': '首尔',
    'Busan': '釜山',
    'Jeju': '济州岛',
    'Incheon': '仁川',
    'Daegu': '大邱',
    'Gwangju': '光州',
    'Daejeon': '大田',
    'Ulsan': '蔚山',
    'Suwon': '水原',
    'Gyeongju': '庆州',
    'Gangnam': '江南',
    'Myeongdong': '明洞',
    'Hongdae': '弘大',
    'Itaewon': '梨泰院',
    'Insadong': '仁寺洞',
    'Bukchon': '北村',
    'Jongno': '钟路',
    'Dongdaemun': '东大门',
    'Namdaemun': '南大门',
    'Seongbuk': '城北',
    'Haeundae': '海云台',
    'Gwangalli': '广安里',
    'Songdo': '松岛',
    'Yeouido': '汝矣岛',
    'Namsan': '南山',
    'Jeonju': '全州',
    'Andong': '安东',
    'Tongyeong': '统营',
    'Boseong': '宝城',
    'Jinju': '晋州'
  },
  
  // 澳大利亚主要城市翻译
  australiaCities: {
    'Sydney': '悉尼',
    'Melbourne': '墨尔本',
    'Brisbane': '布里斯班',
    'Perth': '珀斯',
    'Adelaide': '阿德莱德',
    'Canberra': '堪培拉',
    'Hobart': '霍巴特',
    'Darwin': '达尔文',
    'Gold Coast': '黄金海岸',
    'Newcastle': '纽卡斯尔',
    'Wollongong': '卧龙岗',
    'Geelong': '吉朗',
    'Townsville': '汤斯维尔',
    'Cairns': '凯恩斯',
    'Toowoomba': '图文巴',
    'Ballarat': '巴拉瑞特',
    'Bendigo': '本迪戈',
    'Albury': '奥尔伯里',
    'Launceston': '朗塞斯顿',
    'Mackay': '麦凯',
    'Rockhampton': '罗克汉普顿',
    'Bunbury': '班伯里',
    'Coffs Harbour': '科夫斯港',
    'Wagga Wagga': '瓦加瓦加',
    'Hervey Bay': '赫维湾',
    'Port Macquarie': '麦夸里港',
    'Shepparton': '谢珀顿',
    'Gladstone': '格拉德斯通',
    'Mildura': '米尔杜拉',
    'Bundaberg': '班达伯格'
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

// 获取日本城市中文名
function getJapanCityTranslation(cityName) {
  return translations.japanCities[cityName] || cityName;
}

// 通用的城市名标准化和模糊匹配函数
function normalizeCityName(cityName, cityMap) {
  if (!cityName || !cityMap) return cityName;
  
  // 标准化城市名（去除常见后缀，统一大小写）
  const normalizedName = cityName
    .trim()
    .replace(/ Province$/, '')
    .replace(/ Metropolitan$/, '')
    .replace(/ Municipality$/, '')
    .replace(/ City$/, '')
    .replace(/ Town$/, '');
  
  // 精确匹配
  if (cityMap[normalizedName]) {
    return cityMap[normalizedName];
  }
  
  // 尝试匹配MapTiler可能返回的变体
  const possibleMatches = Object.keys(cityMap).filter(key => 
    normalizedName.toLowerCase().includes(key.toLowerCase()) || 
    key.toLowerCase().includes(normalizedName.toLowerCase())
  );
  
  if (possibleMatches.length > 0) {
    return cityMap[possibleMatches[0]];
  }
  
  return cityName;
}

// 获取泰国城市中文名
function getThailandCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.thailandCities);
}

// 获取日本城市中文名（增强版，支持标准化和模糊匹配）
function getJapanCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.japanCities);
}

// 获取菲律宾城市中文名（增强版）
function getPhilippinesCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.philippinesCities);
}

// 获取新加坡地区中文名
function getSingaporeRegionTranslation(regionName) {
  return translations.singaporeRegions[regionName] || regionName;
}

// 获取韩国城市中文名（增强版）
function getKoreaCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.koreaCities);
}

// 获取澳大利亚城市中文名（增强版）
function getAustraliaCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.australiaCities);
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
  
  const country = countryCode.toLowerCase();
  
  // 根据level判断使用城市翻译还是地区翻译
  if (level === 'city' || level === 'City') {
    switch (country) {
      case 'jp':
        return getJapanCityTranslation(regionName);
      case 'th':
        return getThailandCityTranslation(regionName);
      case 'ph':
        return getPhilippinesCityTranslation(regionName);
      case 'sg':
        return getSingaporeRegionTranslation(regionName);
      case 'kr':
        return getKoreaCityTranslation(regionName);
      case 'au':
        return getAustraliaCityTranslation(regionName);
      default:
        return regionName;
    }
  }
  
  // 省份/州级别的翻译
  switch (country) {
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
    case 'th':
      return getThailandCityTranslation(regionName);
    case 'ph':
      return getPhilippinesCityTranslation(regionName);
    case 'sg':
      return getSingaporeRegionTranslation(regionName);
      case 'kr':
        return getKoreaCityTranslation(regionName);
      case 'au':
        return getAustraliaCityTranslation(regionName);
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
  getJapanCityTranslation,
  getThailandCityTranslation,
  getPhilippinesCityTranslation,
  getSingaporeRegionTranslation,
  getKoreaCityTranslation,
  getAustraliaCityTranslation,
  translations
};

