const Database = require('better-sqlite3');
const path = require('path');
const https = require('https');

// 城市名称到坐标的映射表
const cityCoordinates = {
  // 中国城市
  '北京': { lat: 39.9042, lng: 116.4074 },
  '北京市': { lat: 39.9042, lng: 116.4074 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  '上海市': { lat: 31.2304, lng: 121.4737 },
  '深圳': { lat: 22.5431, lng: 114.0579 },
  '深圳市': { lat: 22.5431, lng: 114.0579 },
  '广州': { lat: 23.1291, lng: 113.2644 },
  '广州市': { lat: 23.1291, lng: 113.2644 },
  '成都': { lat: 30.5728, lng: 104.0668 },
  '成都市': { lat: 30.5728, lng: 104.0668 },
  '杭州': { lat: 30.2741, lng: 120.1551 },
  '杭州市': { lat: 30.2741, lng: 120.1551 },
  '西安': { lat: 34.3416, lng: 108.9398 },
  '西安市': { lat: 34.3416, lng: 108.9398 },
  '武汉': { lat: 30.5928, lng: 114.3055 },
  '武汉市': { lat: 30.5928, lng: 114.3055 },
  '重庆': { lat: 29.5630, lng: 106.5516 },
  '重庆市': { lat: 29.5630, lng: 106.5516 },
  '青岛': { lat: 36.0671, lng: 120.3826 },
  '青岛市': { lat: 36.0671, lng: 120.3826 },
  
  // 日本城市
  '东京': { lat: 35.6895, lng: 139.6917 },
  '東京': { lat: 35.6895, lng: 139.6917 },
  '東京都': { lat: 35.6895, lng: 139.6917 },
  '东京都': { lat: 35.6895, lng: 139.6917 },
  '大阪': { lat: 34.6937, lng: 135.5023 },
  '大阪市': { lat: 34.6937, lng: 135.5023 },
  '京都': { lat: 35.0116, lng: 135.7681 },
  '京都市': { lat: 35.0116, lng: 135.7681 },
  '横滨': { lat: 35.4437, lng: 139.6380 },
  '横浜': { lat: 35.4437, lng: 139.6380 },
  '横浜市': { lat: 35.4437, lng: 139.6380 },
  
  // 泰国城市
  '曼谷': { lat: 13.7563, lng: 100.5018 },
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  '清迈': { lat: 18.7883, lng: 98.9853 },
  'Chiang Mai': { lat: 18.7883, lng: 98.9853 },
  
  // 新加坡
  '新加坡': { lat: 1.3521, lng: 103.8198 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  
  // 韩国城市
  '首尔': { lat: 37.5665, lng: 126.9780 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  
  // 其他国际城市
  '悉尼': { lat: -33.8688, lng: 151.2093 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  '伦敦': { lat: 51.5074, lng: -0.1278 },
  'London': { lat: 51.5074, lng: -0.1278 },
  '巴黎': { lat: 48.8566, lng: 2.3522 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  '纽约': { lat: 40.7128, lng: -74.0060 },
  'New York': { lat: 40.7128, lng: -74.0060 },
};

// 根据城市名称获取坐标
function getCoordinatesFromCity(cityName, country, province) {
  if (!cityName) return null;
  
  // 直接匹配城市名
  if (cityCoordinates[cityName]) {
    return cityCoordinates[cityName];
  }
  
  // 尝试匹配带"市"后缀的
  if (cityCoordinates[cityName + '市']) {
    return cityCoordinates[cityName + '市'];
  }
  
  // 对于日本城市，尝试匹配都府县
  if (country === '日本' || country === 'Japan') {
    if (province && cityCoordinates[province]) {
      return cityCoordinates[province];
    }
  }
  
  return null;
}

// 使用MapTiler Geocoding API根据地址查找坐标
function geocodeAddress(country, province, city, callback) {
  const query = [country, province, city].filter(Boolean).join(',');
  if (!query) {
    callback(null);
    return;
  }
  
  const maptilerKey = process.env.VITE_MAPTILER_KEY || process.env.MAPTILER_KEY;
  if (!maptilerKey) {
    console.error('MapTiler API key not found');
    callback(null);
    return;
  }
  
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${maptilerKey}&limit=1`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.features && result.features.length > 0) {
          const [lng, lat] = result.features[0].geometry.coordinates;
          callback({ lat, lng });
        } else {
          callback(null);
        }
      } catch (err) {
        console.error('Geocoding parse error:', err);
        callback(null);
      }
    });
  }).on('error', (err) => {
    console.error('Geocoding request error:', err);
    callback(null);
  });
}

async function addCoordinatesFromAddress() {
  const dbPath = path.join(__dirname, '../data/filmtrip.db');
  const db = new Database(dbPath);
  
  console.log('🔄 开始根据地址信息补充坐标...');
  
  // 查找有地址但缺少坐标的照片
  const photos = db.prepare(`
    SELECT id, country, province, city, district
    FROM photos
    WHERE (latitude IS NULL OR longitude IS NULL)
      AND (country IS NOT NULL OR city IS NOT NULL)
  `).all();
  
  console.log(`📸 找到 ${photos.length} 张照片需要补充坐标`);
  
  if (photos.length === 0) {
    console.log('✅ 所有照片都已包含坐标信息');
    db.close();
    return;
  }
  
  const updateStmt = db.prepare(`
    UPDATE photos
    SET latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const photo of photos) {
    let coords = null;
    
    // 首先尝试从本地映射表获取
    if (photo.city) {
      coords = getCoordinatesFromCity(photo.city, photo.country, photo.province);
    }
    
    // 如果本地映射失败，尝试使用Geocoding API
    if (!coords) {
      console.log(`📍 尝试查询坐标: ${photo.country}, ${photo.province}, ${photo.city}`);
      await new Promise((resolve) => {
        geocodeAddress(photo.country, photo.province, photo.city, (result) => {
          coords = result;
          resolve();
        });
      });
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (coords) {
      updateStmt.run(coords.lat, coords.lng, photo.id);
      successCount++;
      console.log(`✅ ${photo.id.substring(0, 8)}: ${coords.lat}, ${coords.lng} (${photo.city || photo.province || photo.country})`);
    } else {
      failCount++;
      console.log(`❌ ${photo.id.substring(0, 8)}: 无法找到坐标 (${photo.city || photo.province || photo.country})`);
    }
  }
  
  console.log(`\n✅ 完成！成功: ${successCount}, 失败: ${failCount}`);
  db.close();
}

// 执行
addCoordinatesFromAddress().catch(console.error);

