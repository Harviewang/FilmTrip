const { query, update } = require('../models/db');

const fixPhotoCoordinates = async () => {
  try {
    console.log('🔄 开始修复照片坐标分布...');
    
    // 获取所有照片数据
    const photos = query('SELECT id, film_roll_id, photo_number FROM photos ORDER BY film_roll_id, photo_number');
    
    console.log(`📸 找到 ${photos.length} 张照片需要修复坐标`);
    
    // 定义不同胶卷的坐标范围（模拟真实拍摄分布）
    const coordinateRanges = {
      'roll-001': { // 1030 彩负 - 北京
        base: { lat: 39.9042, lng: 116.4074 },
        spread: { lat: 0.01, lng: 0.01 } // 约1km范围
      },
      'roll-002': { // 20231218 - 上海
        base: { lat: 31.2304, lng: 121.4737 },
        spread: { lat: 0.01, lng: 0.01 }
      },
      'roll-003': { // 230907 PAN100 - 深圳
        base: { lat: 22.5431, lng: 114.0579 },
        spread: { lat: 0.01, lng: 0.01 }
      },
      'roll-004': { // 240217 Thailand - 泰国
        base: { lat: 13.7563, lng: 100.5018 },
        spread: { lat: 0.02, lng: 0.02 }
      },
      'roll-005': { // Harvie 彩负二 - 北京
        base: { lat: 39.9042, lng: 116.4074 },
        spread: { lat: 0.01, lng: 0.01 }
      },
      'roll-006': { // Harvie 海伟 彩负四 - 杭州
        base: { lat: 30.2741, lng: 120.1551 },
        spread: { lat: 0.01, lng: 0.01 }
      },
      'roll-007': { // Harvie海伟 彩负三 - 广州
        base: { lat: 23.1291, lng: 113.2644 },
        spread: { lat: 0.01, lng: 0.01 }
      },
      'roll-008': { // Harvie，彩负三 - 成都
        base: { lat: 30.5728, lng: 104.0668 },
        spread: { lat: 0.01, lng: 0.01 }
      },
      'roll-009': { // 彩负二 黑白一 - 西安
        base: { lat: 34.3416, lng: 108.9398 },
        spread: { lat: 0.01, lng: 0.01 }
      }
    };
    
    let successCount = 0;
    
    for (const photo of photos) {
      try {
        const range = coordinateRanges[photo.film_roll_id];
        if (!range) {
          console.log(`⚠️ 胶卷 ${photo.film_roll_id} 没有坐标范围配置`);
          continue;
        }
        
        // 在基础坐标周围随机分布，避免重叠
        const randomLat = range.base.lat + (Math.random() - 0.5) * range.spread.lat;
        const randomLng = range.base.lng + (Math.random() - 0.5) * range.spread.lng;
        
        // 更新照片坐标
        const sql = 'UPDATE photos SET latitude = ?, longitude = ? WHERE id = ?';
        update(sql, [randomLat, randomLng, photo.id]);
        
        successCount++;
        
        if (successCount % 36 === 0) {
          console.log(`✅ 已完成 ${successCount} 张照片坐标修复`);
        }
        
      } catch (error) {
        console.error(`❌ 修复照片坐标失败 ${photo.id}:`, error.message);
      }
    }
    
    console.log(`\n📊 坐标修复完成:`);
    console.log(`✅ 成功: ${successCount} 张`);
    
    // 显示修复后的坐标分布
    console.log('\n📍 修复后的坐标分布:');
    const distribution = query(`
      SELECT 
        film_roll_id,
        COUNT(*) as count,
        MIN(latitude) as min_lat,
        MAX(latitude) as max_lat,
        MIN(longitude) as min_lng,
        MAX(longitude) as max_lng
      FROM photos 
      WHERE latitude IS NOT NULL 
      GROUP BY film_roll_id
      ORDER BY film_roll_id
    `);
    
    distribution.forEach(item => {
      console.log(`胶卷 ${item.film_roll_id}: ${item.count}张照片, 纬度范围: ${item.min_lat.toFixed(4)}-${item.max_lat.toFixed(4)}, 经度范围: ${item.min_lng.toFixed(4)}-${item.max_lng.toFixed(4)}`);
    });
    
  } catch (error) {
    console.error('❌ 修复照片坐标过程出错:', error);
  } finally {
    process.exit(0);
  }
};

fixPhotoCoordinates();
