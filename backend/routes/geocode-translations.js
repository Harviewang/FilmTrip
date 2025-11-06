// MapTiler地址翻译映射表
// 用于将国外地址翻译为中文

const translations = {
  // 国家翻译（使用国家代码）
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
  
  // 国家名称翻译（作为fallback，处理MapTiler返回英文名称的情况）
  countryName: {
    'United States': '美国',
    'United States of America': '美国',
    'USA': '美国',
    'United Kingdom': '英国',
    'UK': '英国',
    'Japan': '日本',
    'France': '法国',
    'Germany': '德国',
    'Australia': '澳大利亚',
    'Brazil': '巴西',
    'South Africa': '南非',
    'Canada': '加拿大',
    'India': '印度',
    'South Korea': '韩国',
    'Korea': '韩国',
    'Republic of Korea': '韩国',
    'Singapore': '新加坡',
    'Malaysia': '马来西亚',
    'Thailand': '泰国',
    'Philippines': '菲律宾',
    'Vietnam': '越南',
    'Indonesia': '印度尼西亚',
    'Netherlands': '荷兰',
    'Italy': '意大利',
    'Spain': '西班牙',
    'Russia': '俄罗斯',
    'Mexico': '墨西哥',
    'Argentina': '阿根廷',
    'Switzerland': '瑞士',
    'Austria': '奥地利',
    'Belgium': '比利时',
    'Denmark': '丹麦',
    'Sweden': '瑞典',
    'Norway': '挪威',
    'Finland': '芬兰',
    'Poland': '波兰',
    'Czech Republic': '捷克',
    'Greece': '希腊',
    'Portugal': '葡萄牙',
    'Turkey': '土耳其',
    'Egypt': '埃及',
    'Saudi Arabia': '沙特阿拉伯',
    'United Arab Emirates': '阿联酋',
    'UAE': '阿联酋',
    'New Zealand': '新西兰',
    'Ireland': '爱尔兰',
    'China': '中国',
    'Hong Kong': '中国香港',
    'Macau': '中国澳门',
    'Macao': '中国澳门',
    'Taiwan': '中国台湾'
  },
  
  // 中国省份翻译
  chinaProvinces: {
    '北京': '北京市',
    'Beijing': '北京市',
    'Peking': '北京市',
    '上海': '上海市',
    'Shanghai': '上海市',
    '天津': '天津市',
    'Tianjin': '天津市',
    '重庆': '重庆市',
    'Chongqing': '重庆市',
    '广东': '广东省',
    'Guangdong': '广东省',
    '广西': '广西壮族自治区',
    'Guangxi': '广西壮族自治区',
    '广西壮族自治区': '广西壮族自治区',
    '浙江': '浙江省',
    'Zhejiang': '浙江省',
    '江苏': '江苏省',
    'Jiangsu': '江苏省',
    '山东': '山东省',
    'Shandong': '山东省',
    '河南': '河南省',
    'Henan': '河南省',
    '河北': '河北省',
    'Hebei': '河北省',
    '湖南': '湖南省',
    'Hunan': '湖南省',
    '湖北': '湖北省',
    'Hubei': '湖北省',
    '四川': '四川省',
    'Sichuan': '四川省',
    '云南': '云南省',
    'Yunnan': '云南省',
    '贵州': '贵州省',
    'Guizhou': '贵州省',
    '陕西': '陕西省',
    'Shaanxi': '陕西省',
    '山西': '山西省',
    'Shanxi': '山西省',
    '安徽': '安徽省',
    'Anhui': '安徽省',
    '江西': '江西省',
    'Jiangxi': '江西省',
    '福建': '福建省',
    'Fujian': '福建省',
    '辽宁': '辽宁省',
    'Liaoning': '辽宁省',
    '吉林': '吉林省',
    'Jilin': '吉林省',
    '黑龙江': '黑龙江省',
    'Heilongjiang': '黑龙江省',
    '内蒙古': '内蒙古自治区',
    'Inner Mongolia': '内蒙古自治区',
    '内蒙古自治区': '内蒙古自治区',
    '新疆': '新疆维吾尔自治区',
    'Xinjiang': '新疆维吾尔自治区',
    'Xinjiang Uygur Autonomous Region': '新疆维吾尔自治区',
    '新疆维吾尔自治区': '新疆维吾尔自治区',
    '西藏': '西藏自治区',
    'Tibet': '西藏自治区',
    'Xizang': '西藏自治区',
    '西藏自治区': '西藏自治区',
    '宁夏': '宁夏回族自治区',
    'Ningxia': '宁夏回族自治区',
    '宁夏回族自治区': '宁夏回族自治区',
    '青海': '青海省',
    'Qinghai': '青海省',
    '甘肃': '甘肃省',
    'Gansu': '甘肃省',
    '海南': '海南省',
    'Hainan': '海南省',
    '台湾': '中国台湾',
    'Taiwan': '中国台湾',
    '香港': '中国香港',
    'Hong Kong': '中国香港',
    '澳门': '中国澳门',
    'Macau': '中国澳门',
    'Macao': '中国澳门'
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
  
  // 英国地区翻译（省份/州）
  ukRegions: {
    'England': '英格兰',
    'Scotland': '苏格兰',
    'Wales': '威尔士',
    'Northern Ireland': '北爱尔兰',
    'Greater London': '大伦敦',
    'West Midlands': '西米德兰兹',
    'Greater Manchester': '大曼彻斯特',
    'Alba': '苏格兰',
    'Alba / Scotland': '苏格兰'
  },
  
  // 德国州翻译
  deStates: {
    'Bavaria': '巴伐利亚州',
    'Bayern': '巴伐利亚州',
    'Baden-Württemberg': '巴登-符腾堡州',
    'Berlin': '柏林',
    'Brandenburg': '勃兰登堡州',
    'Bremen': '不来梅',
    'Hamburg': '汉堡',
    'Hesse': '黑森州',
    'Hessen': '黑森州',
    'Lower Saxony': '下萨克森州',
    'Niedersachsen': '下萨克森州',
    'Mecklenburg-Vorpommern': '梅克伦堡-前波美拉尼亚州',
    'North Rhine-Westphalia': '北莱茵-威斯特法伦州',
    'Nordrhein-Westfalen': '北莱茵-威斯特法伦州',
    'Rhineland-Palatinate': '莱茵兰-普法尔茨州',
    'Rheinland-Pfalz': '莱茵兰-普法尔茨州',
    'Saarland': '萨尔州',
    'Saxony': '萨克森州',
    'Sachsen': '萨克森州',
    'Saxony-Anhalt': '萨克森-安哈尔特州',
    'Sachsen-Anhalt': '萨克森-安哈尔特州',
    'Schleswig-Holstein': '石勒苏益格-荷尔斯泰因州',
    'Thuringia': '图林根州',
    'Thüringen': '图林根州'
  },
  
  // 西班牙自治区翻译
  esRegions: {
    'Andalucía': '安达卢西亚',
    'Aragón': '阿拉贡',
    'Asturias': '阿斯图里亚斯',
    'Balears': '巴利阿里群岛',
    'Canarias': '加那利群岛',
    'Cantabria': '坎塔布里亚',
    'Castilla y León': '卡斯蒂利亚-莱昂',
    'Castilla-La Mancha': '卡斯蒂利亚-拉曼恰',
    'Cataluña': '加泰罗尼亚',
    'Comunidad de Madrid': '马德里自治区',
    'Comunidad Foral de Navarra': '纳瓦拉',
    'Comunidad Valenciana': '瓦伦西亚',
    'Extremadura': '埃斯特雷马杜拉',
    'Galicia': '加利西亚',
    'La Rioja': '拉里奥哈',
    'País Vasco': '巴斯克',
    'Región de Murcia': '穆尔西亚'
  },
  
  // 意大利大区翻译
  itRegions: {
    'Abruzzo': '阿布鲁佐',
    'Basilicata': '巴西利卡塔',
    'Calabria': '卡拉布里亚',
    'Campania': '坎帕尼亚',
    'Emilia-Romagna': '艾米利亚-罗马涅',
    'Friuli-Venezia Giulia': '弗留利-威尼斯朱利亚',
    'Lazio': '拉齐奥',
    'Liguria': '利古里亚',
    'Lombardia': '伦巴第',
    'Lombardy': '伦巴第',
    'Marche': '马尔凯',
    'Molise': '莫利塞',
    'Piemonte': '皮埃蒙特',
    'Piemont': '皮埃蒙特',
    'Puglia': '普利亚',
    'Sardegna': '撒丁岛',
    'Sicilia': '西西里',
    'Sicily': '西西里',
    'Toscana': '托斯卡纳',
    'Tuscany': '托斯卡纳',
    'Trentino-Alto Adige': '特伦蒂诺-上阿迪杰',
    'Umbria': '翁布里亚',
    'Valle d\'Aosta': '瓦莱达奥斯塔',
    'Veneto': '威尼托'
  },
  
  // 墨西哥州翻译
  mxStates: {
    'Aguascalientes': '阿瓜斯卡连特斯州',
    'Baja California': '下加利福尼亚州',
    'Baja California Sur': '南下加利福尼亚州',
    'Campeche': '坎佩切州',
    'Chiapas': '恰帕斯州',
    'Chihuahua': '奇瓦瓦州',
    'Ciudad de México': '墨西哥城',
    'Coahuila': '科阿韦拉州',
    'Colima': '科利马州',
    'Durango': '杜兰戈州',
    'Guanajuato': '瓜纳华托州',
    'Guerrero': '格雷罗州',
    'Hidalgo': '伊达尔戈州',
    'Jalisco': '哈利斯科州',
    'México': '墨西哥州',
    'Michoacán': '米却肯州',
    'Morelos': '莫雷洛斯州',
    'Nayarit': '纳亚里特州',
    'Nuevo León': '新莱昂州',
    'Oaxaca': '瓦哈卡州',
    'Puebla': '普埃布拉州',
    'Querétaro': '克雷塔罗州',
    'Quintana Roo': '金塔纳罗奥州',
    'San Luis Potosí': '圣路易斯波托西州',
    'Sinaloa': '锡那罗亚州',
    'Sonora': '索诺拉州',
    'Tabasco': '塔瓦斯科州',
    'Tamaulipas': '塔毛利帕斯州',
    'Tlaxcala': '特拉斯卡拉州',
    'Veracruz': '韦拉克鲁斯州',
    'Yucatán': '尤卡坦州',
    'Zacatecas': '萨卡特卡斯州'
  },
  
  // 巴西州翻译
  brStates: {
    'Acre': '阿克里州',
    'Alagoas': '阿拉戈斯州',
    'Amapá': '阿马帕州',
    'Amazonas': '亚马逊州',
    'Bahia': '巴伊亚州',
    'Ceará': '塞阿拉州',
    'Distrito Federal': '联邦区',
    'Espírito Santo': '圣埃斯皮里图州',
    'Goiás': '戈亚斯州',
    'Maranhão': '马拉尼昂州',
    'Mato Grosso': '马托格罗索州',
    'Mato Grosso do Sul': '南马托格罗索州',
    'Minas Gerais': '米纳斯吉拉斯州',
    'Pará': '帕拉州',
    'Paraíba': '帕拉伊巴州',
    'Paraná': '巴拉那州',
    'Pernambuco': '伯南布哥州',
    'Piauí': '皮奥伊州',
    'Rio de Janeiro': '里约热内卢州',
    'Rio Grande do Norte': '北大河州',
    'Rio Grande do Sul': '南大河州',
    'Rondônia': '朗多尼亚州',
    'Roraima': '罗赖马州',
    'Santa Catarina': '圣卡塔琳娜州',
    'São Paulo': '圣保罗州',
    'Sergipe': '塞尔希培州',
    'Tocantins': '托坎廷斯州'
  },
  
  // 英国主要城市翻译
  ukCities: {
    'London': '伦敦',
    'Manchester': '曼彻斯特',
    'Birmingham': '伯明翰',
    'Liverpool': '利物浦',
    'Leeds': '利兹',
    'Edinburgh': '爱丁堡',
    'Glasgow': '格拉斯哥',
    'Bristol': '布里斯托',
    'Cardiff': '加的夫',
    'Belfast': '贝尔法斯特',
    'Newcastle': '纽卡斯尔',
    'Nottingham': '诺丁汉',
    'Leicester': '莱斯特',
    'Sheffield': '谢菲尔德',
    'Coventry': '考文垂',
    'Brighton': '布莱顿',
    'Bath': '巴斯',
    'Oxford': '牛津',
    'Cambridge': '剑桥',
    'York': '约克',
    'Canterbury': '坎特伯雷',
    'Stratford-upon-Avon': '斯特拉特福',
    'Stonehenge': '巨石阵'
  },
  
  // 法国主要城市翻译
  franceCities: {
    'Paris': '巴黎',
    'Lyon': '里昂',
    'Marseille': '马赛',
    'Toulouse': '图卢兹',
    'Nice': '尼斯',
    'Nantes': '南特',
    'Strasbourg': '斯特拉斯堡',
    'Montpellier': '蒙彼利埃',
    'Bordeaux': '波尔多',
    'Lille': '里尔',
    'Rennes': '雷恩',
    'Reims': '兰斯',
    'Saint-Étienne': '圣艾蒂安',
    'Toulon': '土伦',
    'Grenoble': '格勒诺布尔',
    'Dijon': '第戎',
    'Angers': '昂热',
    'Nîmes': '尼姆',
    'Villeurbanne': '维勒班',
    'Saint-Denis': '圣但尼',
    'Versailles': '凡尔赛',
    'Avignon': '阿维尼翁',
    'Aix-en-Provence': '普罗旺斯地区艾克斯',
    'Cannes': '戛纳',
    'Monaco': '摩纳哥',
    'Chamonix': '霞慕尼',
    'Annecy': '阿讷西',
    'Colmar': '科尔马'
  },
  
  // 美国主要城市翻译
  usCities: {
    'New York': '纽约',
    'Los Angeles': '洛杉矶',
    'Chicago': '芝加哥',
    'Houston': '休斯顿',
    'Phoenix': '凤凰城',
    'Philadelphia': '费城',
    'San Antonio': '圣安东尼奥',
    'San Diego': '圣地亚哥',
    'Dallas': '达拉斯',
    'San Jose': '圣何塞',
    'Austin': '奥斯汀',
    'Jacksonville': '杰克逊维尔',
    'San Francisco': '旧金山',
    'Indianapolis': '印第安纳波利斯',
    'Columbus': '哥伦布',
    'Fort Worth': '沃思堡',
    'Charlotte': '夏洛特',
    'Seattle': '西雅图',
    'Denver': '丹佛',
    'Boston': '波士顿',
    'El Paso': '埃尔帕索',
    'Nashville': '纳什维尔',
    'Detroit': '底特律',
    'Oklahoma City': '俄克拉荷马城',
    'Portland': '波特兰',
    'Las Vegas': '拉斯维加斯',
    'Memphis': '孟菲斯',
    'Louisville': '路易斯维尔',
    'Baltimore': '巴尔的摩',
    'Milwaukee': '密尔沃基',
    'Albuquerque': '阿尔伯克基',
    'Tucson': '图森',
    'Fresno': '弗雷斯诺',
    'Sacramento': '萨克拉门托',
    'Mesa': '梅萨',
    'Kansas City': '堪萨斯城',
    'Atlanta': '亚特兰大',
    'Omaha': '奥马哈',
    'Colorado Springs': '科罗拉多斯普林斯',
    'Raleigh': '罗利',
    'Virginia Beach': '弗吉尼亚海滩',
    'Miami': '迈阿密',
    'Oakland': '奥克兰',
    'Minneapolis': '明尼阿波利斯',
    'Tulsa': '塔尔萨',
    'Cleveland': '克利夫兰',
    'Wichita': '威奇托',
    'Honolulu': '火奴鲁鲁',
    'Washington': '华盛顿',
    'Orlando': '奥兰多',
    'Tampa': '坦帕',
    'New Orleans': '新奥尔良',
    'Pittsburgh': '匹兹堡'
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
    'Krabi': '甲米',
    'Ko Samui': '苏梅岛',
    'Ko Pha Ngan': '帕岸岛',
    'Ko Tao': '涛岛',
    'Pai': '拜县',
    'Mae Hong Son': '夜丰颂',
    'Sukhothai': '素可泰',
    'Lampang': '南邦',
    'Nakhon Ratchasima': '那空叻差是玛',
    'Udon Thani': '乌隆他尼',
    'Nong Khai': '廊开',
    'Hat Yai': '合艾',
    'Surat Thani': '素叻他尼',
    'Trang': '董里',
    'Chumphon': '春蓬',
    'Rayong': '罗勇',
    'Chonburi': '春武里',
    'Lopburi': '华富里',
    'Kamphaeng Phet': '甘烹碧',
    'Lamphun': '南奔',
    'Nan': '难府',
    'Ubon Ratchathani': '乌汶叻差他尼',
    'Sakon Nakhon': '沙功那空',
    'Maha Sarakham': '玛哈沙拉堪',
    'Khon Kaen': '孔敬',
    'Roi Et': '黎逸',
    'Nong Bua Lamphu': '农布南',
    'Loei': '黎府',
    'Phitsanulok': '彭世洛',
    'Phrae': '帕府',
    'Uttaradit': '程逸',
    'Saraburi': '沙拉武里',
    'Nakhon Sawan': '那空沙旺',
    'Chachoengsao': '差春骚',
    'Rayong': '罗勇',
    'Trat': '达叻',
    'Ko Chang': '象岛',
    'Ko Samet': '沙美岛',
    'Ko Lanta': '兰达岛',
    'Phi Phi Islands': '皮皮岛',
    'Railay': '莱利',
    'Floating Market': '水上市场',
    'Wat Pho': '卧佛寺',
    'Wat Arun': '郑王庙',
    'Grand Palace': '大皇宫',
    'Chatuchak': '乍都乍',
    'Khao San Road': '考山路',
    'Soi Cowboy': '牛仔街',
    'Patpong': '帕蓬',
    'MBK Center': 'MBK购物中心',
    'Siam Paragon': '暹罗百丽宫',
    'CentralWorld': '中央世界购物中心'
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
    'Camiguin': '卡米金岛',
    'Puerto Galera': '加拉港',
    'Anilao': '阿尼劳',
    'Subic': '苏比克',
    'Manila Bay': '马尼拉湾',
    'Intramuros': '王城区',
    'Rizal Park': '黎刹公园',
    'Banaue': '巴纳韦',
    'Sagada': '萨加达',
    'Banaue Rice Terraces': '巴纳韦梯田',
    'Chocolate Hills': '巧克力山',
    'Tarsier Sanctuary': '眼镜猴保护区',
    'Kawasan Falls': '卡瓦桑瀑布',
    'Tumalog Falls': '图马洛格瀑布',
    'Sumilon Island': '苏米龙岛',
    'Apo Island': '阿波岛',
    'Malapascua': '马拉帕斯夸',
    'Bantayan Island': '班塔延岛',
    'Camotes Islands': '卡莫特斯群岛',
    'Siquijor Island': '锡基霍尔岛',
    'Apo Reef': '阿波礁',
    'Tubbataha Reef': '图巴塔哈礁',
    'Fort Santiago': '圣地亚哥堡',
    'Manila Cathedral': '马尼拉大教堂',
    'San Agustin Church': '圣奥古斯丁教堂',
    'National Museum': '国家博物馆',
    'Greenbelt': '绿地购物中心',
    'SM Mall of Asia': 'SM亚洲购物中心',
    'BGC': '博尼法西奥环球城',
    'Makati': '马卡蒂',
    'Ortigas': '奥提加斯',
    'Quezon City': '奎松市',
    'Pasay': '帕赛',
    'Mandaluyong': '曼达卢永',
    'San Juan': '圣胡安',
    'Marikina': '马里基纳',
    'Las Piñas': '拉斯皮尼亚斯',
    'Muntinlupa': '蒙廷卢帕',
    'Parañaque': '帕拉尼亚克'
  },
  
  // 新加坡行政区翻译（包含地区和景点）
  singaporeRegions: {
    'Singapore': '新加坡',
    'Central Region': '中央区',
    'East Region': '东区',
    'North Region': '北区',
    'North-East Region': '东北区',
    'West Region': '西区',
    // 主要地区
    'Marina Bay': '滨海湾',
    'Orchard': '乌节',
    'Sentosa': '圣淘沙',
    'Clarke Quay': '克拉码头',
    'Chinatown': '牛车水',
    'Little India': '小印度',
    'Kampong Glam': '甘榜格南',
    'Tiong Bahru': '中峇鲁',
    'Bugis': '武吉士',
    'Geylang': '芽笼',
    'Jurong': '裕廊',
    'Tampines': '淡滨尼',
    'Woodlands': '兀兰',
    'Yishun': '义顺',
    'Ang Mo Kio': '宏茂桥',
    'Bishan': '碧山',
    'Toa Payoh': '大巴窑',
    'Novena': '诺维娜',
    'Newton': '纽顿',
    'Orchard Road': '乌节路',
    'Raffles Place': '莱佛士坊',
    'City Hall': '市政厅',
    'Dhoby Ghaut': '多美歌',
    'Somerset': '索美塞',
    'Raffles City': '莱佛士城',
    // 景点和地标
    'Merlion Park': '鱼尾狮公园',
    'Gardens by the Bay': '滨海湾花园',
    'Marina Bay Sands': '滨海湾金沙',
    'Singapore Flyer': '新加坡摩天轮',
    'Universal Studios': '环球影城',
    'Sentosa Island': '圣淘沙岛',
    'Singapore Botanic Gardens': '新加坡植物园',
    'Singapore Zoo': '新加坡动物园',
    'Night Safari': '夜间野生动物园',
    'River Safari': '河川生态园',
    'Jurong Bird Park': '裕廊飞禽公园',
    'ArtScience Museum': '艺术科学博物馆',
    'National Gallery': '国家美术馆',
    'Peranakan Museum': '土生华人博物馆',
    'Asian Civilisations Museum': '亚洲文明博物馆',
    'Singapore National Museum': '新加坡国家博物馆',
    'Esplanade': '滨海艺术中心',
    'Clarke Quay': '克拉码头',
    'Geylang Serai': '芽笼士乃',
    'Haji Lane': '哈芝巷',
    'Arab Street': '阿拉伯街',
    'Maxwell Food Centre': '麦士威熟食中心',
    'Lau Pa Sat': '老巴刹',
    'Chinatown Food Street': '牛车水美食街',
    'Orchard Road Shopping': '乌节路购物',
    'VivoCity': '怡丰城',
    'ION Orchard': 'ION购物中心',
    'Takashimaya': '高岛屋',
    'Paragon': '百利宫',
    'Mandarin Gallery': '文华购物廊',
    'The Shoppes at Marina Bay Sands': '金沙购物中心',
    'Resorts World Sentosa': '圣淘沙名胜世界',
    'Fort Canning Park': '福康宁公园',
    'East Coast Park': '东海岸公园',
    'MacRitchie Reservoir': '麦里芝蓄水池',
    'Singapore River': '新加坡河',
    'Helix Bridge': '双螺旋桥',
    'Fullerton Hotel': '富丽敦酒店',
    'Merlion': '鱼尾狮',
    'Sri Mariamman Temple': '马里安曼兴都庙',
    'Thian Hock Keng Temple': '天福宫',
    'Buddha Tooth Relic Temple': '佛牙寺',
    'Sultan Mosque': '苏丹回教堂',
    'St. Andrew\'s Cathedral': '圣安德烈座堂'
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
    'Bundaberg': '班达伯格',
    'Orange': '奥兰治',
    'Dubbo': '达博',
    'Tamworth': '塔姆沃思',
    'Lismore': '利斯莫尔',
    'Coffs Harbour': '科夫斯港',
    'Byron Bay': '拜伦湾',
    'Surfers Paradise': '冲浪者天堂',
    'Noosa': '努萨',
    'Airlie Beach': '艾尔利海滩',
    'Magnetic Island': '磁岛',
    'Hamilton Island': '汉密尔顿岛',
    'Uluru': '乌鲁鲁',
    'Alice Springs': '爱丽斯泉',
    'Kakadu': '卡卡杜',
    'Broome': '布鲁姆',
    'Esperance': '埃斯佩兰斯',
    'Kalgoorlie': '卡尔古利',
    'Margaret River': '玛格丽特河',
    'Albany': '奥尔巴尼',
    'Port Lincoln': '林肯港',
    'Mount Gambier': '甘比尔山',
    'Halls Gap': '霍尔斯峡',
    'Grampians': '格兰坪',
    'Phillip Island': '菲利普岛',
    'Mornington Peninsula': '莫宁顿半岛',
    'Yarra Valley': '雅拉谷',
    'Great Ocean Road': '大洋路',
    'Twelve Apostles': '十二使徒岩',
    'Blue Mountains': '蓝山',
    'Hunter Valley': '猎人谷',
    'Barossa Valley': '巴罗萨谷',
    'Fraser Island': '弗雷泽岛',
    'Whitsunday Islands': '圣灵群岛',
    'Kangaroo Island': '袋鼠岛',
    'Tasmania': '塔斯马尼亚',
    'Hobart': '霍巴特',
    'Launceston': '朗塞斯顿',
    'Strahan': '斯特拉恩',
    'Cradle Mountain': '摇篮山',
    'Wineglass Bay': '酒杯湾',
    'Port Arthur': '亚瑟港',
    'Bondi Beach': '邦迪海滩',
    'Manly': '曼利',
    'Coogee': '库吉',
    'Bronte': '布朗特',
    'Royal National Park': '皇家国家公园',
    'Sydney Harbour Bridge': '悉尼海港大桥',
    'Sydney Opera House': '悉尼歌剧院',
    'Harbour Bridge': '海港大桥',
    'Opera House': '歌剧院',
    'The Rocks': '岩石区',
    'Circular Quay': '环形码头',
    'Darling Harbour': '达令港',
    'Taronga Zoo': '塔朗加动物园',
    'Royal Botanic Gardens': '皇家植物园',
    'Hyde Park': '海德公园',
    'Melbourne Cricket Ground': '墨尔本板球场',
    'Federation Square': '联邦广场',
    'Queen Victoria Market': '维多利亚女王市场',
    'St. Kilda': '圣基尔达',
    'Brighton Beach': '布莱顿海滩',
    'Luna Park': '月亮公园',
    'Eureka Tower': '尤里卡塔',
    'Flinders Street Station': '弗林德斯街火车站',
    'Royal Exhibition Building': '皇家展览馆',
    'Shrine of Remembrance': '战争纪念馆',
    'National Gallery of Victoria': '维多利亚国家美术馆',
    'Royal Melbourne Zoo': '墨尔本皇家动物园',
    'Great Barrier Reef': '大堡礁',
    'Whitehaven Beach': '白天堂海滩',
    'Daintree Rainforest': '戴恩树雨林',
    'Litchfield National Park': '利奇菲尔德国家公园'
  },
  
  // 越南主要城市翻译
  vietnamCities: {
    'Ho Chi Minh City': '胡志明市',
    'Hanoi': '河内',
    'Da Nang': '岘港',
    'Hai Phong': '海防',
    'Can Tho': '芹苴',
    'Nha Trang': '芽庄',
    'Hue': '顺化',
    'Hoi An': '会安',
    'Da Lat': '大叻',
    'Phu Quoc': '富国岛',
    'Ha Long': '下龙',
    'Sa Pa': '沙坝',
    'Mui Ne': '美奈',
    'Vung Tau': '头顿',
    'Quy Nhon': '归仁',
    'Tam Coc': '三谷',
    'My Son': '美山',
    'Ban Gioc': '板约',
    'Mekong Delta': '湄公河三角洲',
    'Sapa': '沙坝',
    'Ha Long Bay': '下龙湾'
  },
  
  // 马来西亚主要城市翻译
  malaysiaCities: {
    'Kuala Lumpur': '吉隆坡',
    'Penang': '槟城',
    'Malacca': '马六甲',
    'Johor Bahru': '新山',
    'Kota Kinabalu': '哥打京那巴鲁',
    'Kuching': '古晋',
    'Ipoh': '怡保',
    'Klang': '巴生',
    'Kuantan': '关丹',
    'Kota Bharu': '哥打巴鲁',
    'Langkawi': '兰卡威',
    'Cameron Highlands': '金马伦高原',
    'Taman Negara': '大汉山国家公园',
    'Perhentian Islands': '停泊岛',
    'Tioman': '刁曼岛',
    'Kuching': '古晋',
    'Sandakan': '山打根',
    'Tawau': '斗湖',
    'Miri': '美里',
    'Semporna': '仙本那',
    'Georgetown': '乔治市',
    'Batu Caves': '黑风洞',
    'Mount Kinabalu': '京那巴鲁山'
  },
  
  // 印度尼西亚主要城市翻译
  indonesiaCities: {
    'Jakarta': '雅加达',
    'Bali': '巴厘岛',
    'Yogyakarta': '日惹',
    'Bandung': '万隆',
    'Surabaya': '泗水',
    'Medan': '棉兰',
    'Makassar': '望加锡',
    'Denpasar': '登巴萨',
    'Semarang': '三宝垄',
    'Padang': '巴东',
    'Balikpapan': '巴厘巴板',
    'Manado': '万鸦老',
    'Ubud': '乌布',
    'Kuta': '库塔',
    'Seminyak': '水明漾',
    'Sanur': '沙努尔',
    'Nusa Dua': '努沙杜瓦',
    'Lombok': '龙目岛',
    'Gili Islands': '吉利群岛',
    'Mount Bromo': '布罗莫火山',
    'Borobudur': '婆罗浮屠',
    'Prambanan': '普兰巴南',
    'Raja Ampat': '四王群岛',
    'Komodo': '科莫多',
    'Flores': '弗洛雷斯',
    'Bintan': '民丹岛',
    'Batam': '巴淡岛',
    'Surakarta': '梭罗',
    'Malang': '玛琅',
    'Bogor': '茂物'
  },
  
  // 马来西亚省份/州翻译
  malaysiaStates: {
    'Selangor': '雪兰莪州',
    'Kuala Lumpur': '吉隆坡',
    'Penang': '槟城州',
    'Johor': '柔佛州',
    'Sabah': '沙巴州',
    'Sarawak': '砂拉越州',
    'Perak': '霹雳州',
    'Kedah': '吉打州',
    'Kelantan': '吉兰丹州',
    'Terengganu': '登嘉楼州',
    'Pahang': '彭亨州',
    'Malacca': '马六甲州',
    'Melaka': '马六甲州',  // MapTiler可能返回Melaka而不是Malacca
    'Negeri Sembilan': '森美兰州',
    'Perlis': '玻璃市州',
    'Labuan': '纳闽',
    'Putrajaya': '布城'
  },
  
  // 印度尼西亚省份翻译
  indonesiaProvinces: {
    'Jakarta': '雅加达',
    'Jakarta Barat': '雅加达西部',
    'Jakarta Timur': '雅加达东部',
    'Jakarta Selatan': '雅加达南部',
    'Jakarta Pusat': '雅加达中部',
    'Jakarta Utara': '雅加达北部',
    'Jawa Barat': '西爪哇省',
    'Jawa Timur': '东爪哇省',
    'Jawa Tengah': '中爪哇省',
    'Bali': '巴厘省',
    'Sumatra Utara': '北苏门答腊省',
    'Sumatra Barat': '西苏门答腊省',
    'Sumatra Selatan': '南苏门答腊省',
    'Kalimantan Barat': '西加里曼丹省',
    'Kalimantan Timur': '东加里曼丹省',
    'Sulawesi Selatan': '南苏拉威西省',
    'Sulawesi Utara': '北苏拉威西省',
    'Yogyakarta': '日惹特区',
    'Papua': '巴布亚省',
    'Papua Barat': '西巴布亚省',
    'Banten': '万丹省',
    'Lampung': '楠榜省',
    'Riau': '廖内省',
    'Kepulauan Riau': '廖内群岛省',
    'Aceh': '亚齐省'
  },
  
  // 泰国省份翻译
  thailandProvinces: {
    'Bangkok': '曼谷',
    'Chiang Mai': '清迈府',
    'Phuket': '普吉府',
    'Krabi': '甲米府',
    'Pattaya': '芭堤雅',
    'Ayutthaya': '大城府',
    'Sukhothai': '素可泰府',
    'Kanchanaburi': '北碧府',
    'Hua Hin': '华欣',
    'Chiang Rai': '清莱府',
    'Pai': '拜县',
    'Koh Samui': '苏梅岛',
    'Koh Phangan': '帕岸岛',
    'Koh Tao': '涛岛',
    'Surat Thani': '素叻他尼府'
  },
  
  // 菲律宾省份翻译
  philippinesProvinces: {
    'Metro Manila': '大马尼拉',
    'National Capital Region': '国家首都区',
    'NCR': '国家首都区',
    'Manila': '马尼拉',
    'Cebu': '宿务省',
    'Davao': '达沃省',
    'Palawan': '巴拉望省',
    'Bohol': '保和省',
    'Laguna': '拉古纳省',
    'Cavite': '甲米地省',
    'Batangas': '八打雁省',
    'Pampanga': '邦板牙省',
    'Ilocos Norte': '北伊罗戈省',
    'Ilocos Sur': '南伊罗戈省',
    'Bicol': '比科尔',
    'Quezon': '奎松省',
    'Rizal': '黎刹省',
    'Bulacan': '布拉干省'
  },
  
  // 越南省份翻译
  vietnamProvinces: {
    'Ho Chi Minh City': '胡志明市',
    'Hanoi': '河内',
    'Da Nang': '岘港',
    'Hai Phong': '海防',
    'Can Tho': '芹苴',
    'Hue': '顺化',
    'Nha Trang': '芽庄',
    'Quang Ninh': '广宁省',
    'Khanh Hoa': '庆和省',
    'Lam Dong': '林同省',
    'Quang Nam': '广南省',
    'Thua Thien Hue': '承天顺化省',
    'An Giang': '安江省',
    'Kien Giang': '坚江省'
  },
  
  // 新加坡地区翻译（作为省份使用）
  singaporeProvinces: {
    'Singapore': '新加坡',
    'Central Region': '中央区',
    'East Region': '东区',
    'North Region': '北区',
    'North-East Region': '东北区',
    'West Region': '西区'
  }
};

// 获取国家中文名（支持国家代码和国家名称）
function getCountryTranslation(countryCodeOrName) {
  if (!countryCodeOrName) return null;
  
  const lower = countryCodeOrName.toLowerCase();
  
  // 先尝试使用国家代码匹配
  if (translations.country[lower]) {
    return translations.country[lower];
  }
  
  // 再尝试使用国家名称匹配（不区分大小写）
  for (const [key, value] of Object.entries(translations.countryName)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }
  
  return null;
}

// 获取中国省份中文名
function getChinaProvinceTranslation(provinceName) {
  if (!provinceName) return provinceName;
  
  // 精确匹配
  if (translations.chinaProvinces[provinceName]) {
    return translations.chinaProvinces[provinceName];
  }
  
  // 模糊匹配（不区分大小写）
  const lower = provinceName.toLowerCase();
  for (const [key, value] of Object.entries(translations.chinaProvinces)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }
  
  return provinceName;
}

// 获取美国州中文名
function getUSStateTranslation(stateName) {
  return translations.usStates[stateName] || stateName;
}

// 获取英国地区中文名
function getUKRegionTranslation(regionName) {
  return translations.ukRegions[regionName] || regionName;
}

// 获取德国州中文名
function getDEStateTranslation(stateName) {
  return translations.deStates[stateName] || stateName;
}

// 获取西班牙自治区中文名
function getESRegionTranslation(regionName) {
  return translations.esRegions[regionName] || regionName;
}

// 获取意大利大区中文名
function getITRegionTranslation(regionName) {
  return translations.itRegions[regionName] || regionName;
}

// 获取墨西哥州中文名
function getMXStateTranslation(stateName) {
  return translations.mxStates[stateName] || stateName;
}

// 获取巴西州中文名
function getBRStateTranslation(stateName) {
  return translations.brStates[stateName] || stateName;
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

// 获取马来西亚省份中文名
function getMalaysiaStateTranslation(stateName) {
  return normalizeCityName(stateName, translations.malaysiaStates);
}

// 获取印度尼西亚省份中文名
function getIndonesiaProvinceTranslation(provinceName) {
  return normalizeCityName(provinceName, translations.indonesiaProvinces);
}

// 获取泰国省份中文名
function getThailandProvinceTranslation(provinceName) {
  return normalizeCityName(provinceName, translations.thailandProvinces);
}

// 获取菲律宾省份中文名
function getPhilippinesProvinceTranslation(provinceName) {
  return normalizeCityName(provinceName, translations.philippinesProvinces);
}

// 获取越南省份中文名
function getVietnamProvinceTranslation(provinceName) {
  return normalizeCityName(provinceName, translations.vietnamProvinces);
}

// 获取新加坡省份中文名
function getSingaporeProvinceTranslation(provinceName) {
  return translations.singaporeProvinces[provinceName] || provinceName;
}

// 获取韩国城市中文名（增强版）
function getKoreaCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.koreaCities);
}

// 获取澳大利亚城市中文名（增强版）
function getAustraliaCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.australiaCities);
}

// 获取英国城市中文名（增强版）
function getUKCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.ukCities);
}

// 获取法国城市中文名（增强版）
function getFranceCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.franceCities);
}

// 获取美国城市中文名（增强版）
function getUSCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.usCities);
}

// 获取越南城市中文名（增强版）
function getVietnamCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.vietnamCities);
}

// 获取马来西亚城市中文名（增强版）
function getMalaysiaCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.malaysiaCities);
}

// 获取印度尼西亚城市中文名（增强版）
function getIndonesiaCityTranslation(cityName) {
  return normalizeCityName(cityName, translations.indonesiaCities);
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
      case 'vn':
        return getVietnamCityTranslation(regionName);
      case 'my':
        return getMalaysiaCityTranslation(regionName);
      case 'id':
        return getIndonesiaCityTranslation(regionName);
      case 'gb':
      case 'uk':
        return getUKCityTranslation(regionName);
      case 'fr':
        return getFranceCityTranslation(regionName);
      case 'us':
        return getUSCityTranslation(regionName);
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
    case 'de':
      return getDEStateTranslation(cleanName);
    case 'es':
      return getESRegionTranslation(cleanName);
    case 'it':
      return getITRegionTranslation(cleanName);
    case 'mx':
      return getMXStateTranslation(cleanName);
    case 'br':
      return getBRStateTranslation(cleanName);
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
      return getThailandProvinceTranslation(cleanName);
    case 'ph':
      return getPhilippinesProvinceTranslation(cleanName);
    case 'sg':
      return getSingaporeProvinceTranslation(cleanName);
    case 'kr':
      return getKoreaCityTranslation(regionName);
    case 'my':
      return getMalaysiaStateTranslation(cleanName);
    case 'id':
      return getIndonesiaProvinceTranslation(cleanName);
    case 'vn':
      return getVietnamProvinceTranslation(cleanName);
    default:
      return regionName;
    }
  }

module.exports = {
  translateAddress,
  getCountryTranslation,
  getChinaProvinceTranslation,
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
  getVietnamCityTranslation,
  getMalaysiaCityTranslation,
  getIndonesiaCityTranslation,
  getUKCityTranslation,
  getFranceCityTranslation,
  getUSCityTranslation,
  getMalaysiaStateTranslation,
  getIndonesiaProvinceTranslation,
  getThailandProvinceTranslation,
  getPhilippinesProvinceTranslation,
  getVietnamProvinceTranslation,
  getSingaporeProvinceTranslation,
  translations
};

