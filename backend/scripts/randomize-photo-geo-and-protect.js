// 随机为最近3卷胶卷的照片生成坐标与中文地址，并随机加密部分照片
// 使用方法：node backend/scripts/randomize-photo-geo-and-protect.js

const path = require('path');
const http = require('http');
const { query, update } = require('../models/db');

// 陆地城市坐标列表（确保都在陆地上，主要是中国和其他国家的城市）
const LAND_CITIES = [
  // 中国城市
  { lat: 39.9042, lng: 116.4074, name: '北京' },
  { lat: 31.2304, lng: 121.4737, name: '上海' },
  { lat: 22.5431, lng: 114.0579, name: '深圳' },
  { lat: 23.1291, lng: 113.2644, name: '广州' },
  { lat: 30.2741, lng: 120.1551, name: '杭州' },
  { lat: 30.5728, lng: 104.0668, name: '成都' },
  { lat: 34.3416, lng: 108.9398, name: '西安' },
  { lat: 22.3193, lng: 114.1694, name: '香港' },
  { lat: 24.4547, lng: 118.0819, name: '厦门' },
  { lat: 32.0603, lng: 118.7969, name: '南京' },
  { lat: 36.0611, lng: 103.8343, name: '兰州' },
  { lat: 38.0428, lng: 114.5149, name: '石家庄' },
  { lat: 45.7736, lng: 126.6228, name: '哈尔滨' },
  { lat: 29.4316, lng: 106.9123, name: '重庆' },
  { lat: 28.2282, lng: 112.9388, name: '长沙' },
  // 国际城市
  { lat: 35.6762, lng: 139.6503, name: '东京' },
  { lat: 37.5665, lng: 126.9780, name: '首尔' },
  { lat: 13.7563, lng: 100.5018, name: '曼谷' },
  { lat: 3.1390, lng: 101.6869, name: '吉隆坡' },
  { lat: 1.3521, lng: 103.8198, name: '新加坡' },
  { lat: 14.5995, lng: 120.9842, name: '马尼拉' },
  { lat: -6.2088, lng: 106.8456, name: '雅加达' },
  { lat: -33.8688, lng: 151.2093, name: '悉尼' },
  { lat: -37.8136, lng: 144.9631, name: '墨尔本' },
  { lat: 51.5074, lng: -0.1278, name: '伦敦' },
  { lat: 48.8566, lng: 2.3522, name: '巴黎' },
  { lat: 40.7128, lng: -74.0060, name: '纽约' },
  { lat: 34.0522, lng: -118.2437, name: '洛杉矶' },
];

// 生成陆地坐标（在城市周围随机偏移，确保在陆地上）
function randomLandCoordinate() {
  // 随机选择一个城市
  const city = LAND_CITIES[Math.floor(Math.random() * LAND_CITIES.length)];
  // 在城市周围随机偏移（约50km范围内）
  const offsetLat = (Math.random() - 0.5) * 0.5; // 约 ±0.45度 ≈ 50km
  const offsetLng = (Math.random() - 0.5) * 0.5;
  return {
    lat: city.lat + offsetLat,
    lng: city.lng + offsetLng,
    cityName: city.name
  };
}

// 调用反向地理编码API转换为中文地址
function postReverse(lat, lon) {
  return new Promise((resolve, reject) => {
    // 确保坐标是数字类型
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
        timeout: 10000 // 增加超时时间到10秒
      },
      (res) => {
        let data = '';
        
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          // 检查HTTP状态码
          if (res.statusCode !== 200) {
            let errorMsg = `HTTP ${res.statusCode}`;
            try {
              const errorJson = JSON.parse(data);
              errorMsg += `: ${errorJson.message || res.statusMessage || 'Unknown'}`;
            } catch {
              errorMsg += `: ${res.statusMessage || 'Unknown'}`;
            }
            return reject(new Error(errorMsg));
          }
          
          try {
            const json = JSON.parse(data);
            // 检查返回格式：{ success: true, data: {...} }
            if (json && json.success && json.data) {
              return resolve(json.data);
            }
            // 如果返回格式不同，尝试直接返回
            if (json && json.data) {
              return resolve(json.data);
            }
            // 如果 success 为 false，返回 null
            if (json && !json.success) {
              return resolve(null);
            }
            return resolve(null);
          } catch (e) {
            return reject(new Error(`JSON解析失败: ${e.message}, 响应: ${data.substring(0, 100)}`));
          }
        });
      }
    );
    
    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    // 写入请求体
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('🚀 开始处理照片坐标和地址...\n');
  
  // 最近3个胶卷（按 created_at/rowid 降序）
  const rolls = query('SELECT id FROM film_rolls ORDER BY datetime(created_at) DESC, rowid DESC LIMIT 3');
  if (!rolls || rolls.length === 0) {
    console.log('未找到胶卷实例');
    return;
  }

  console.log(`📦 找到 ${rolls.length} 个胶卷实例\n`);

  let totalUpdated = 0;
  let totalProtected = 0;
  let totalGeocoded = 0;
  let totalPhotos = 0;

  for (let i = 0; i < rolls.length; i++) {
    const r = rolls[i];
    const photos = query('SELECT id, latitude, longitude FROM photos WHERE film_roll_id = ?', [r.id]);
    totalPhotos += photos.length;
    
    console.log(`\n📸 处理胶卷 ${i + 1}/${rolls.length} (${photos.length} 张照片)`);
    
    for (let j = 0; j < photos.length; j++) {
      const p = photos[j];
      process.stdout.write(`\r  [${j + 1}/${photos.length}] 处理照片 ${p.id.substring(0, 8)}...`);
      
      // 生成陆地坐标（注意：函数返回的是 lng，不是 lon）
      const { lat, lng, cityName } = randomLandCoordinate();
      
      // 先写入坐标，清空旧的行政区字段
      update(
        `UPDATE photos SET latitude = ?, longitude = ?, country = NULL, province = NULL, city = NULL, district = NULL, township = NULL WHERE id = ?`,
        [lat, lng, p.id]
      );
      totalUpdated++;

      // 尝试转换为中文地址（需要后端服务运行）
      try {
        const geoData = await postReverse(lat, lng);
        if (geoData && geoData.country) {
          update(
            `UPDATE photos SET country = ?, province = ?, city = ?, district = ?, township = ? WHERE id = ?`,
            [
              geoData.country || '',
              geoData.province || '',
              geoData.city || '',
              geoData.district || '',
              geoData.township || '',
              p.id
            ]
          );
          totalGeocoded++;
          // 每转换10张显示一次进度
          if (totalGeocoded % 10 === 0) {
            console.log(`\n  ✅ 已转换地址: ${totalGeocoded}/${totalUpdated} 张`);
          }
        }
        // API限速：每次请求间隔120ms
        await new Promise(resolve => setTimeout(resolve, 120));
      } catch (error) {
        // 只在第一次失败时输出详细错误
        if (totalGeocoded === 0 && j === 0 && i === 0) {
          console.error(`\n⚠️  地址转换API调用失败: ${error.message}`);
          console.error(`   继续处理其他照片（可能部分照片会缺少地址）`);
        }
        // 继续处理，不因单次失败而停止
      }

      // 以25%概率随机加密
      if (Math.random() < 0.25) {
        update(`UPDATE photos SET is_protected = 1, protection_level = 'other' WHERE id = ?`, [p.id]);
        totalProtected++;
      }
    }
    console.log(`\n  ✅ 胶卷 ${i + 1} 处理完成`);
  }

  console.log(`\n\n✅ 全部处理完成:`);
  console.log(`  📍 已更新坐标: ${totalUpdated} 张`);
  console.log(`  🌏 已转换地址: ${totalGeocoded} 张`);
  console.log(`  🔒 随机加密: ${totalProtected} 张`);
  console.log(`  📊 总照片数: ${totalPhotos} 张\n`);
}

main().catch(console.error);


