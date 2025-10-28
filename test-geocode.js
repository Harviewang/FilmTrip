// 地图API验证测试脚本
const https = require('https');

// API密钥
const KEYS = {
  amap: 'f82dbd3f01c1f3622f964dd2deb99ccc',
  tencent: 'UYFBZ-FPQKL-YSAPN-MGEZB-RQ3AF-Q7BSW'
};

// 测试坐标
const TEST_CASES = [
  {
    name: '深圳市南山区',
    lat: 22.5431,
    lng: 113.9344,
    expected: { country: '中国', province: '广东省', city: '深圳市', district: '南山区' }
  },
  {
    name: '北京市海淀区',
    lat: 39.9042,
    lng: 116.4074,
    expected: { country: '中国', province: '北京市', city: '北京市', district: '海淀区' }
  },
  {
    name: '广州市天河区',
    lat: 23.1291,
    lng: 113.2644,
    expected: { country: '中国', province: '广东省', city: '广州市', district: '天河区' }
  },
  {
    name: '上海市黄浦区',
    lat: 31.2304,
    lng: 121.4737,
    expected: { country: '中国', province: '上海市', city: '上海市', district: '黄浦区' }
  },
  // 国外测试点
  {
    name: '纽约曼哈顿',
    lat: 40.7128,
    lng: -74.0060,
    expected: { country: '美国', province: '纽约州', city: '纽约市', district: '曼哈顿' }
  },
  {
    name: '东京',
    lat: 35.6762,
    lng: 139.6503,
    expected: { country: '日本', province: '东京都', city: '东京', district: '' }
  },
  {
    name: '伦敦',
    lat: 51.5074,
    lng: -0.1278,
    expected: { country: '英国', province: '英格兰', city: '伦敦', district: '' }
  },
  {
    name: '巴黎',
    lat: 48.8566,
    lng: 2.3522,
    expected: { country: '法国', province: '', city: '巴黎', district: '' }
  }
];

// 高德API调用
function queryAmap(lat, lng, callback) {
  const url = `https://restapi.amap.com/v3/geocode/regeo?key=${KEYS.amap}&location=${lng},${lat}&output=json`;
  
  console.log(`  调用URL: ${url}`);
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        callback(null, result);
      } catch (e) {
        callback(e, null);
      }
    });
  }).on('error', callback);
}

// 腾讯API调用
function queryTencent(lat, lng, callback) {
  const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${KEYS.tencent}&get_poi=0`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        callback(null, result);
      } catch (e) {
        callback(e, null);
      }
    });
  }).on('error', callback);
}

// 解析高德返回结果
function parseAmapResult(result) {
  if (!result.status || result.status !== '1') {
    return { error: result.info || '解析失败' };
  }
  
  const addrComp = result.regeocode.addressComponent;
  return {
    country: addrComp.country || '',
    province: addrComp.province || '',
    city: addrComp.city || '',
    district: addrComp.district || '',
    township: addrComp.township || '',
    formatted_address: result.regeocode.formatted_address
  };
}

// 解析腾讯返回结果
function parseTencentResult(result) {
  if (result.status !== 0) {
    return { error: result.message || '解析失败' };
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

// 测试主函数
async function runTests() {
  console.log('开始测试地图API...\n');
  
  for (const testCase of TEST_CASES) {
    console.log(`\n测试点: ${testCase.name} (${testCase.lat}, ${testCase.lng})`);
    console.log('-'.repeat(60));
    
    // 测试高德
    console.log('\n【高德API】');
    await new Promise((resolve) => {
      queryAmap(testCase.lat, testCase.lng, (err, result) => {
        if (err) {
          console.log('❌ 调用失败:', err.message);
        } else {
          const parsed = parseAmapResult(result);
          if (parsed.error) {
            console.log('❌', parsed.error);
          } else {
            console.log('✅ 成功');
            console.log('  国家:', parsed.country);
            console.log('  省份:', parsed.province);
            console.log('  城市:', parsed.city);
            console.log('  区县:', parsed.district);
            console.log('  街道:', parsed.township);
            console.log('  完整地址:', parsed.formatted_address);
          }
        }
        resolve();
      });
    });
    
    // 测试腾讯
    console.log('\n【腾讯API】');
    await new Promise((resolve) => {
      queryTencent(testCase.lat, testCase.lng, (err, result) => {
        if (err) {
          console.log('❌ 调用失败:', err.message);
        } else {
          const parsed = parseTencentResult(result);
          if (parsed.error) {
            console.log('❌', parsed.error);
          } else {
            console.log('✅ 成功');
            console.log('  国家:', parsed.country);
            console.log('  省份:', parsed.province);
            console.log('  城市:', parsed.city);
            console.log('  区县:', parsed.district);
            console.log('  街道:', parsed.township);
            console.log('  完整地址:', parsed.formatted_address);
          }
        }
        resolve();
      });
    });
    
    // 等待1秒避免频率限制（已优化，国外无需等待）
    if (testCase.lat > 18 && testCase.lat < 54 && testCase.lng > 73 && testCase.lng < 135) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  console.log('\n\n✅ 测试完成！');
}

// 运行测试
runTests().catch(console.error);

