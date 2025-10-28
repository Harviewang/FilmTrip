const https = require('https');

const MAPTILER_KEY = 'DKuhLqblnLLkKdQ88ScQ';

// 10个全球不同地点
const testLocations = [
  { name: '深圳（中国）', lat: 22.5431, lng: 113.9344 },
  { name: '北京（中国）', lat: 39.9042, lng: 116.4074 },
  { name: '纽约（美国）', lat: 40.7128, lng: -74.0060 },
  { name: '东京（日本）', lat: 35.6762, lng: 139.6503 },
  { name: '伦敦（英国）', lat: 51.5074, lng: -0.1278 },
  { name: '巴黎（法国）', lat: 48.8566, lng: 2.3522 },
  { name: '里约热内卢（巴西）', lat: -22.9068, lng: -43.1729 },
  { name: '开普敦（南非）', lat: -33.9249, lng: 18.4241 },
  { name: '悉尼（澳大利亚）', lat: -33.8688, lng: 151.2093 },
  { name: '新德里（印度）', lat: 28.6139, lng: 77.2090 }
];

function queryMapTiler(lat, lng) {
  return new Promise((resolve, reject) => {
    const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}`;
    
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

function parseContext(features) {
  let country = '';
  let province = '';
  let city = '';
  let district = '';
  
  if (!features || features.length === 0) {
    return { country, province, city, district };
  }
  
  const firstFeature = features[0];
  const context = firstFeature.context || [];
  
  context.forEach(item => {
    const text = item.text || '';
    const placeType = item.place_type?.[0] || '';
    const placeDesignation = item.place_designation || '';
    const id = item.id || '';
    
    // 打印调试信息
    console.log(`  - id: ${id}, type: ${placeType}, designation: ${placeDesignation}, text: ${text}`);
    
    if (placeDesignation === 'country') {
      country = text;
    } else if (placeDesignation === 'state') {
      province = text;
    } else if (placeDesignation === 'city' && !city) {
      city = text;
    } else if (placeType === 'county' && placeDesignation === 'city' && !city) {
      city = text;
    } else if (placeType === 'joint_municipality') {
      district = text;
    } else if (placeType === 'municipality' && !district) {
      district = text;
    }
  });
  
  return { country, province, city, district };
}

async function runTests() {
  console.log('开始测试10个全球地点...\n');
  
  for (let i = 0; i < testLocations.length; i++) {
    const location = testLocations[i];
    console.log(`${i + 1}. ${location.name}`);
    console.log(`   坐标: ${location.lat}, ${location.lng}`);
    
    try {
      const result = await queryMapTiler(location.lat, location.lng);
      const formatted_address = result.features[0]?.place_name || '';
      
      console.log(`   完整地址: ${formatted_address}`);
      console.log(`   解析context:`);
      
      const { country, province, city, district } = parseContext(result.features);
      
      console.log(`   → 4级映射结果:`);
      console.log(`     country: ${country || '(空)'}`);
      console.log(`     province: ${province || '(空)'}`);
      console.log(`     city: ${city || '(空)'}`);
      console.log(`     district: ${district || '(空)'}`);
      
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}`);
    }
    
    console.log(''); // 空行
  }
  
  console.log('\n测试完成！');
}

runTests();

