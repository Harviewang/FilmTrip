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
    'St. Andrew's Cathedral': '圣安德烈座堂'
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
  getVietnamCityTranslation,
  getMalaysiaCityTranslation,
  getIndonesiaCityTranslation,
  translations
};

