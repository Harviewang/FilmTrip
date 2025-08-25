const { insert } = require('../models/db');

const createMorePhotos = async () => {
  try {
    console.log('🔄 开始创建更多照片记录...');
    
    // 为roll_006到roll_009创建照片记录
    const newPhotos = [];
    let photoId = 4; // 从photo-004开始
    
    // roll_006: Harvie 海伟 彩负四
    for (let i = 1; i <= 36; i++) {
      newPhotos.push({
        id: `photo-${String(photoId).padStart(3, '0')}`,
        film_roll_id: 'roll-006',
        photo_number: i,
        filename: `roll006_photo_${String(i).padStart(3, '0')}.jpg`,
        original_name: `roll006_photo_${String(i).padStart(3, '0')}.jpg`,
        title: `海伟彩负四 第${i}张`,
        description: 'Harvie海伟拍摄的彩色负片第四卷',
        taken_date: '2025-01-20',
        camera_id: null,
        aperture: 'f/2.8',
        shutter_speed: '1/125',
        focal_length: '50mm',
        iso: 400,
        latitude: 39.9042,
        longitude: 116.4074,
        location_name: '北京',
        rating: 4,
        is_encrypted: 0,
        tags: '海伟,彩负,北京'
      });
      photoId++;
    }
    
    // roll_007: Harvie海伟 ，彩负三
    for (let i = 1; i <= 36; i++) {
      newPhotos.push({
        id: `photo-${String(photoId).padStart(3, '0')}`,
        film_roll_id: 'roll-007',
        photo_number: i,
        filename: `roll007_photo_${String(i).padStart(3, '0')}.jpg`,
        original_name: `roll007_photo_${String(i).padStart(3, '0')}.jpg`,
        title: `海伟彩负三 第${i}张`,
        description: 'Harvie海伟拍摄的彩色负片第三卷',
        taken_date: '2025-01-18',
        camera_id: null,
        aperture: 'f/4.0',
        shutter_speed: '1/60',
        focal_length: '35mm',
        iso: 200,
        latitude: 39.9042,
        longitude: 116.4074,
        location_name: '北京',
        rating: 4,
        is_encrypted: 0,
        tags: '海伟,彩负,北京'
      });
      photoId++;
    }
    
    // roll_008: Harvie，彩负三
    for (let i = 1; i <= 36; i++) {
      newPhotos.push({
        id: `photo-${String(photoId).padStart(3, '0')}`,
        film_roll_id: 'roll-008',
        photo_number: i,
        filename: `roll008_photo_${String(i).padStart(3, '0')}.jpg`,
        original_name: `roll008_photo_${String(i).padStart(3, '0')}.jpg`,
        title: `Harvie彩负三 第${i}张`,
        description: 'Harvie拍摄的彩色负片第三卷',
        taken_date: '2025-01-16',
        camera_id: null,
        aperture: 'f/2.8',
        shutter_speed: '1/125',
        focal_length: '50mm',
        iso: 200,
        latitude: 39.9042,
        longitude: 116.4074,
        location_name: '北京',
        rating: 4,
        is_encrypted: 0,
        tags: 'Harvie,彩负,北京'
      });
      photoId++;
    }
    
    // roll_009: 彩负二 黑白一
    for (let i = 1; i <= 36; i++) {
      newPhotos.push({
        id: `photo-${String(photoId).padStart(3, '0')}`,
        film_roll_id: 'roll-009',
        photo_number: i,
        filename: `roll009_photo_${String(i).padStart(3, '0')}.jpg`,
        original_name: `roll009_photo_${String(i).padStart(3, '0')}.jpg`,
        title: `彩负二黑白一 第${i}张`,
        description: '彩色负片第二卷和黑白第一卷',
        taken_date: '2025-01-14',
        camera_id: null,
        aperture: 'f/5.6',
        shutter_speed: '1/250',
        focal_length: '85mm',
        iso: 100,
        latitude: 39.9042,
        longitude: 116.4074,
        location_name: '北京',
        rating: 4,
        is_encrypted: 0,
        tags: '彩负,黑白,北京'
      });
      photoId++;
    }
    
    console.log(`📸 准备创建 ${newPhotos.length} 张照片记录`);
    
    // 插入照片记录
    let successCount = 0;
    for (const photo of newPhotos) {
      try {
        const sql = `INSERT INTO photos (id, film_roll_id, photo_number, filename, original_name, title, description, taken_date, camera_id, aperture, shutter_speed, focal_length, iso, latitude, longitude, location_name, rating, is_encrypted, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [photo.id, photo.film_roll_id, photo.photo_number, photo.filename, photo.original_name, photo.title, photo.description, photo.taken_date, photo.camera_id, photo.aperture, photo.shutter_speed, photo.focal_length, photo.iso, photo.latitude, photo.longitude, photo.location_name, photo.rating, photo.is_encrypted, photo.tags];
        insert(sql, params);
        successCount++;
        
        if (successCount % 36 === 0) {
          console.log(`✅ 已完成 ${successCount} 张照片`);
        }
      } catch (error) {
        console.error(`❌ 插入照片失败 ${photo.id}:`, error.message);
      }
    }
    
    console.log(`\n📊 照片创建完成:`);
    console.log(`✅ 成功: ${successCount} 张`);
    console.log(`📸 总计: ${successCount + 3} 张照片 (包含之前的3张)`);
    
  } catch (error) {
    console.error('❌ 创建照片记录过程出错:', error);
  } finally {
    process.exit(0);
  }
};

createMorePhotos();
