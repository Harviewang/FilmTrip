// 按旅游热度重新分配照片位置，每个知名国家2-3个知名城市
// 使用方法：node backend/scripts/redistribute-photos-by-tourism.js

const http = require('http');
const { query, update } = require('../models/db');

// 按旅游热度排列的热门旅游城市（每个国家2-3个城市）
const TOURISM_HOTSPOTS = [
  // 亚洲
  { lat: 35.6762, lng: 139.6503, name: '东京', country: '日本' }, // 日本
  { lat: 34.6937, lng: 135.5023, name: '大阪', country: '日本' },
  { lat: 36.2048, lng: 138.2529, name: '富士山', country: '日本' },
  
  { lat: 37.5665, lng: 126.9780, name: '首尔', country: '韩国' }, // 韩国
  { lat: 35.1796, lng: 129.0756, name: '釜山', country: '韩国' },
  { lat: 33.4996, lng: 126.5312, name: '济州岛', country: '韩国' },
  
  { lat: 13.7563, lng: 100.5018, name: '曼谷', country: '泰国' }, // 泰国
  { lat: 18.7883, lng: 98.9853, name: '清迈', country: '泰国' },
  { lat: 7.8804, lng: 98.3923, name: '普吉岛', country: '泰国' },
  
  { lat: 1.3521, lng: 103.8198, name: '新加坡', country: '新加坡' }, // 新加坡
  
  { lat: 3.1390, lng: 101.6869, name: '吉隆坡', country: '马来西亚' }, // 马来西亚
  { lat: 5.9804, lng: 116.0735, name: '亚庇', country: '马来西亚' },
  { lat: 2.1896, lng: 102.2501, name: '马六甲', country: '马来西亚' },
  
  { lat: 14.5995, lng: 120.9842, name: '马尼拉', country: '菲律宾' }, // 菲律宾
  { lat: 10.3157, lng: 123.8854, name: '宿务', country: '菲律宾' },
  { lat: 11.9674, lng: 121.9248, name: '长滩岛', country: '菲律宾' },
  
  { lat: -6.2088, lng: 106.8456, name: '雅加达', country: '印度尼西亚' }, // 印度尼西亚
  { lat: -8.6705, lng: 115.2126, name: '巴厘岛', country: '印度尼西亚' },
  { lat: -7.7956, lng: 110.3695, name: '日惹', country: '印度尼西亚' },
  
  { lat: 10.8231, lng: 106.6297, name: '胡志明市', country: '越南' }, // 越南
  { lat: 21.0285, lng: 105.8542, name: '河内', country: '越南' },
  { lat: 10.7769, lng: 106.7009, name: '岘港', country: '越南' },
  
  { lat: -33.8688, lng: 151.2093, name: '悉尼', country: '澳大利亚' }, // 澳大利亚
  { lat: -37.8136, lng: 144.9631, name: '墨尔本', country: '澳大利亚' },
  { lat: -27.4698, lng: 153.0251, name: '布里斯班', country: '澳大利亚' },
  
  // 欧洲
  { lat: 51.5074, lng: -0.1278, name: '伦敦', country: '英国' }, // 英国
  { lat: 55.9533, lng: -3.1883, name: '爱丁堡', country: '英国' },
  { lat: 53.4808, lng: -2.2426, name: '曼彻斯特', country: '英国' },
  
  { lat: 48.8566, lng: 2.3522, name: '巴黎', country: '法国' }, // 法国
  { lat: 45.7640, lng: 4.8357, name: '里昂', country: '法国' },
  { lat: 43.7102, lng: 7.2620, name: '尼斯', country: '法国' },
  
  { lat: 52.5200, lng: 13.4050, name: '柏林', country: '德国' }, // 德国
  { lat: 48.1351, lng: 11.5820, name: '慕尼黑', country: '德国' },
  { lat: 50.1109, lng: 8.6821, name: '法兰克福', country: '德国' },
  
  { lat: 41.9028, lng: 12.4964, name: '罗马', country: '意大利' }, // 意大利
  { lat: 45.4642, lng: 9.1900, name: '米兰', country: '意大利' },
  { lat: 43.7696, lng: 11.2558, name: '佛罗伦萨', country: '意大利' },
  
  { lat: 40.4168, lng: -3.7038, name: '马德里', country: '西班牙' }, // 西班牙
  { lat: 41.3851, lng: 2.1734, name: '巴塞罗那', country: '西班牙' },
  { lat: 37.3891, lng: -5.9845, name: '塞维利亚', country: '西班牙' },
  
  // 美洲
  { lat: 40.7128, lng: -74.0060, name: '纽约', country: '美国' }, // 美国
  { lat: 34.0522, lng: -118.2437, name: '洛杉矶', country: '美国' },
  { lat: 37.7749, lng: -122.4194, name: '旧金山', country: '美国' },
  
  { lat: 19.4326, lng: -99.1332, name: '墨西哥城', country: '墨西哥' }, // 墨西哥
  { lat: 20.6597, lng: -103.3496, name: '瓜达拉哈拉', country: '墨西哥' },
  
  { lat: -22.9068, lng: -43.1729, name: '里约热内卢', country: '巴西' }, // 巴西
  { lat: -23.5505, lng: -46.6333, name: '圣保罗', country: '巴西' },
  
  // 中国（保留一些热门城市）
  { lat: 39.9042, lng: 116.4074, name: '北京', country: '中国' },
  { lat: 31.2304, lng: 121.4737, name: '上海', country: '中国' },
  { lat: 22.5431, lng: 114.0579, name: '深圳', country: '中国' },
];

// 调用反向地理编码API转换为中文地址
function postReverse(lat, lon) {
  return new Promise((resolve, reject) => {
    const numLat = Number(lat);
    const numLon = Number(lon);
    
    if (isNaN(numLat) || isNaN(numLon)) {
      return reject(new Error(`无效的坐标: lat=${lat}, lon=${lon}`));
    }
    
    const payload = JSON.stringify({ latitude: numLat, longitude: numLon });
    
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/geocode/reverse',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000 // 10秒超时
      },
      (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const result = JSON.parse(data);
              if (result.success) {
                resolve(result.data);
              } else {
                reject(new Error(result.message || 'API返回失败'));
              }
            } catch (err) {
              reject(new Error(`解析响应失败: ${err.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    req.write(payload);
    req.end();
  });
}

// 随机选择旅游热点
function getRandomHotspot() {
  return TOURISM_HOTSPOTS[Math.floor(Math.random() * TOURISM_HOTSPOTS.length)];
}

// 在城市范围内添加小范围随机偏移（模拟城市内不同地点）
function addRandomOffset(lat, lng, radius = 0.01) {
  // radius默认0.01度，约1公里
  const randomLat = lat + (Math.random() - 0.5) * radius;
  const randomLng = lng + (Math.random() - 0.5) * radius;
  return { lat: randomLat, lng: randomLng };
}

async function redistributePhotos() {
  try {
    console.log('🔄 开始按旅游热度重新分配照片位置...\n');
    
    // 获取所有照片
    const photos = query(`
      SELECT id, filename, latitude, longitude, country, province, city
      FROM photos
      ORDER BY id
    `);
    
    console.log(`📸 找到 ${photos.length} 张照片需要重新分配位置\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        // 随机选择一个旅游热点
        const hotspot = getRandomHotspot();
        
        // 在城市范围内添加小范围随机偏移
        const { lat, lng } = addRandomOffset(hotspot.lat, hotspot.lng, 0.015);
        
        // 调用反向地理编码API转换为中文地址
        console.log(`📍 [${i + 1}/${photos.length}] 处理照片 ${photo.id} -> ${hotspot.name}, ${hotspot.country}`);
        
        let geocodeResult;
        try {
          geocodeResult = await postReverse(lat, lng);
          
          // 更新照片的坐标和地址信息
          const updateSql = `
            UPDATE photos 
            SET 
              latitude = ?,
              longitude = ?,
              country = ?,
              province = ?,
              city = ?,
              district = ?,
              township = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;
          
          update(updateSql, [
            lat,
            lng,
            geocodeResult.country || null,
            geocodeResult.province || null,
            geocodeResult.city || null,
            geocodeResult.district || null,
            geocodeResult.township || null,
            photo.id
          ]);
          
          successCount++;
          
          // 每10张照片输出一次进度
          if (successCount % 10 === 0) {
            console.log(`✅ 已处理 ${successCount} 张照片\n`);
          }
          
        } catch (geocodeError) {
          console.error(`⚠️  [${i + 1}/${photos.length}] 地理编码失败 (照片 ${photo.id}): ${geocodeError.message}`);
          // 即使地理编码失败，也更新坐标
          const updateSql = `
            UPDATE photos 
            SET 
              latitude = ?,
              longitude = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;
          
          update(updateSql, [lat, lng, photo.id]);
          errorCount++;
        }
        
        // 添加延迟，避免API请求过快
        if (i < photos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms延迟
        }
        
      } catch (error) {
        console.error(`❌ [${i + 1}/${photos.length}] 处理照片 ${photo.id} 失败:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 重新分配完成:`);
    console.log(`✅ 成功: ${successCount} 张`);
    console.log(`⚠️ 地理编码失败但已更新坐标: ${errorCount} 张`);
    console.log(`⏭️ 跳过: ${skippedCount} 张\n`);
    
    // 显示分配后的城市分布
    console.log('📍 照片城市分布:');
    const distribution = query(`
      SELECT 
        country,
        city,
        COUNT(*) as count
      FROM photos 
      WHERE country IS NOT NULL AND city IS NOT NULL
      GROUP BY country, city
      ORDER BY count DESC
      LIMIT 20
    `);
    
    distribution.forEach(item => {
      console.log(`  ${item.country} ${item.city}: ${item.count}张`);
    });
    
  } catch (error) {
    console.error('❌ 重新分配照片位置过程出错:', error);
  } finally {
    process.exit(0);
  }
}

// 运行脚本
if (require.main === module) {
  redistributePhotos();
}

module.exports = { redistributePhotos };

