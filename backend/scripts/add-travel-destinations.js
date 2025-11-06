// 为新上传的照片添加主要旅行目的地的随机坐标和中文地址
// 使用方法：node backend/scripts/add-travel-destinations.js [--roll-id=xxx] [--limit=N]
// 
// 参数说明：
//   --roll-id=xxx: 指定要处理的胶卷ID（可选，默认处理最新的胶卷）
//   --limit=N: 限制处理数量（可选，默认处理所有）

const http = require('http');
const { query, update } = require('../models/db');

// 主要旅行目的地列表（全球热门旅游城市）
const TRAVEL_DESTINATIONS = [
  // 中国城市
  { lat: 39.9042, lng: 116.4074, name: '北京', country: '中国' },
  { lat: 31.2304, lng: 121.4737, name: '上海', country: '中国' },
  { lat: 22.5431, lng: 114.0579, name: '深圳', country: '中国' },
  { lat: 23.1291, lng: 113.2644, name: '广州', country: '中国' },
  { lat: 30.2741, lng: 120.1551, name: '杭州', country: '中国' },
  { lat: 30.5728, lng: 104.0668, name: '成都', country: '中国' },
  { lat: 34.3416, lng: 108.9398, name: '西安', country: '中国' },
  { lat: 22.3193, lng: 114.1694, name: '香港', country: '中国香港' },
  { lat: 24.4547, lng: 118.0819, name: '厦门', country: '中国' },
  { lat: 32.0603, lng: 118.7969, name: '南京', country: '中国' },
  { lat: 38.0428, lng: 114.5149, name: '石家庄', country: '中国' },
  { lat: 45.7736, lng: 126.6228, name: '哈尔滨', country: '中国' },
  { lat: 29.4316, lng: 106.9123, name: '重庆', country: '中国' },
  { lat: 28.2282, lng: 112.9388, name: '长沙', country: '中国' },
  { lat: 25.0389, lng: 102.7183, name: '昆明', country: '中国' },
  { lat: 38.8833, lng: 121.6333, name: '大连', country: '中国' },
  { lat: 36.6512, lng: 117.1201, name: '济南', country: '中国' },
  { lat: 26.0745, lng: 119.2965, name: '福州', country: '中国' },
  { lat: 43.8171, lng: 87.6168, name: '乌鲁木齐', country: '中国' },
  
  // 亚洲热门城市
  { lat: 35.6762, lng: 139.6503, name: '东京', country: '日本' },
  { lat: 34.6937, lng: 135.5023, name: '大阪', country: '日本' },
  { lat: 37.5665, lng: 126.9780, name: '首尔', country: '韩国' },
  { lat: 13.7563, lng: 100.5018, name: '曼谷', country: '泰国' },
  { lat: 18.7883, lng: 98.9853, name: '清迈', country: '泰国' },
  { lat: 3.1390, lng: 101.6869, name: '吉隆坡', country: '马来西亚' },
  { lat: 1.3521, lng: 103.8198, name: '新加坡', country: '新加坡' },
  { lat: 14.5995, lng: 120.9842, name: '马尼拉', country: '菲律宾' },
  { lat: -6.2088, lng: 106.8456, name: '雅加达', country: '印度尼西亚' },
  { lat: -8.6705, lng: 115.2126, name: '巴厘岛', country: '印度尼西亚' },
  { lat: 10.8231, lng: 106.6297, name: '胡志明市', country: '越南' },
  { lat: 21.0285, lng: 105.8542, name: '河内', country: '越南' },
  { lat: 28.6139, lng: 77.2090, name: '新德里', country: '印度' },
  { lat: 19.0760, lng: 72.8777, name: '孟买', country: '印度' },
  
  // 大洋洲
  { lat: -33.8688, lng: 151.2093, name: '悉尼', country: '澳大利亚' },
  { lat: -37.8136, lng: 144.9631, name: '墨尔本', country: '澳大利亚' },
  { lat: -27.4698, lng: 153.0251, name: '布里斯班', country: '澳大利亚' },
  { lat: -36.8485, lng: 174.7633, name: '奥克兰', country: '新西兰' },
  { lat: -41.2865, lng: 174.7762, name: '惠灵顿', country: '新西兰' },
  
  // 欧洲
  { lat: 51.5074, lng: -0.1278, name: '伦敦', country: '英国' },
  { lat: 48.8566, lng: 2.3522, name: '巴黎', country: '法国' },
  { lat: 52.5200, lng: 13.4050, name: '柏林', country: '德国' },
  { lat: 41.9028, lng: 12.4964, name: '罗马', country: '意大利' },
  { lat: 40.4168, lng: -3.7038, name: '马德里', country: '西班牙' },
  { lat: 41.0082, lng: 28.9784, name: '伊斯坦布尔', country: '土耳其' },
  { lat: 55.7558, lng: 37.6173, name: '莫斯科', country: '俄罗斯' },
  { lat: 59.9343, lng: 30.3351, name: '圣彼得堡', country: '俄罗斯' },
  
  // 美洲
  { lat: 40.7128, lng: -74.0060, name: '纽约', country: '美国' },
  { lat: 34.0522, lng: -118.2437, name: '洛杉矶', country: '美国' },
  { lat: 41.8781, lng: -87.6298, name: '芝加哥', country: '美国' },
  { lat: 37.7749, lng: -122.4194, name: '旧金山', country: '美国' },
  { lat: 25.7617, lng: -80.1918, name: '迈阿密', country: '美国' },
  { lat: 19.4326, lng: -99.1332, name: '墨西哥城', country: '墨西哥' },
  { lat: -22.9068, lng: -43.1729, name: '里约热内卢', country: '巴西' },
  { lat: -34.6037, lng: -58.3816, name: '布宜诺斯艾利斯', country: '阿根廷' },
];

// 检查参数
const args = process.argv.slice(2);
const rollIdArg = args.find(arg => arg.startsWith('--roll-id='));
const rollId = rollIdArg ? rollIdArg.split('=')[1] : null;
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

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
        timeout: 10000
      },
      (res) => {
        let data = '';
        
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
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
            if (json && json.success && json.data) {
              return resolve(json.data);
            }
            return resolve(null);
          } catch (e) {
            return reject(new Error(`解析响应失败: ${e.message}`));
          }
        });
      }
    );
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    req.write(payload);
    req.end();
  });
}

// 生成旅行目的地随机坐标（在城市周围随机偏移）
function randomDestinationCoordinate() {
  const destination = TRAVEL_DESTINATIONS[Math.floor(Math.random() * TRAVEL_DESTINATIONS.length)];
  // 在城市周围随机偏移（约30km范围内）
  const offsetLat = (Math.random() - 0.5) * 0.3; // 约 ±0.27度 ≈ 30km
  const offsetLng = (Math.random() - 0.5) * 0.3;
  return {
    lat: destination.lat + offsetLat,
    lng: destination.lng + offsetLng,
    destinationName: destination.name,
    destinationCountry: destination.country
  };
}

async function main() {
  console.log('🌍 开始为照片添加旅行目的地地理位置...');
  
  // 查找需要处理的照片
  let sql = `
    SELECT id, film_roll_id, latitude, longitude, country, province, city
    FROM photos
    WHERE 1=1
  `;
  
  const params = [];
  
  // 如果指定了胶卷ID，只处理该胶卷
  if (rollId) {
    sql += ` AND film_roll_id = ?`;
    params.push(rollId);
  } else {
    // 否则处理最新的胶卷（没有坐标或坐标无效的照片）
    sql += ` AND (
      latitude IS NULL OR longitude IS NULL OR
      latitude = 0 OR longitude = 0 OR
      latitude NOT BETWEEN -90 AND 90 OR
      longitude NOT BETWEEN -180 AND 180
    )`;
  }
  
  sql += ` ORDER BY id DESC`;
  
  if (limit) {
    sql += ` LIMIT ?`;
    params.push(limit);
  }
  
  const photos = query(sql, params);
  console.log(`📸 找到 ${photos.length} 张照片需要处理\n`);
  
  if (photos.length === 0) {
    console.log('✅ 没有需要处理的照片');
    return;
  }
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const progress = `[${i + 1}/${photos.length}]`;
    
    try {
      // 随机选择一个旅行目的地并生成坐标
      const coord = randomDestinationCoordinate();
      console.log(`${progress} 处理照片 ${photo.id} -> ${coord.destinationName} (${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)})...`);
      
      // 调用反向地理编码API获取中文地址
      const address = await postReverse(coord.lat, coord.lng);
      
      if (address && (address.country || address.province || address.city)) {
        // 更新数据库
        const result = update(
          `UPDATE photos 
           SET latitude = ?, longitude = ?, 
               country = ?, province = ?, city = ?, district = ?, township = ? 
           WHERE id = ?`,
          [
            coord.lat,
            coord.lng,
            address.country || null,
            address.province || null,
            address.city || null,
            address.district || null,
            address.township || null,
            photo.id
          ]
        );
        
        if (result.changes > 0) {
          console.log(`  ✅ 成功: ${address.country || ''} ${address.province || ''} ${address.city || ''}`);
          success++;
        } else {
          console.log(`  ⚠️  未更新`);
          failed++;
        }
      } else {
        console.log(`  ⚠️  无法解析地址`);
        failed++;
      }
      
      // API限速：每次请求间隔120ms
      if (i < photos.length - 1) {
        await new Promise((res) => setTimeout(res, 120));
      }
    } catch (e) {
      console.log(`  ❌ 失败: ${e.message}`);
      failed++;
      
      // 错误后稍等再继续
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  
  console.log(`\n📊 处理完成:`);
  console.log(`  ✅ 成功: ${success} 张`);
  console.log(`  ❌ 失败: ${failed} 张`);
  console.log(`\n💡 提示: 已为照片随机分配了 ${TRAVEL_DESTINATIONS.length} 个旅行目的地的坐标`);
}

main().catch(console.error);

