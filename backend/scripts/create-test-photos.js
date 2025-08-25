const { query, insert } = require('../models/db');
const fs = require('fs');
const path = require('path');

const createTestPhotos = async () => {
  try {
    console.log('开始创建测试照片数据...');
    
    // 检查是否有胶卷数据
    const filmRolls = query('SELECT id FROM film_rolls LIMIT 3');
    if (filmRolls.length === 0) {
      console.log('没有胶卷数据，请先创建胶卷数据');
      return;
    }
    
    // 清空现有照片数据
    try {
      query('DELETE FROM photos');
      console.log('清空现有照片数据');
    } catch (error) {
      console.log('清空照片数据时出现警告:', error.message);
    }
    
    // 创建测试照片数据
    const testPhotos = [
      {
        id: 'photo-001',
        film_roll_id: filmRolls[0].id,
        photo_number: 1,
        filename: 'test1.jpg',
        original_name: 'test1.jpg',
        title: '测试照片1',
        description: '这是一张测试照片，用于演示系统功能',
        taken_date: '2025-01-15',
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
        tags: '测试,风景,城市'
      },
      {
        id: 'photo-002',
        film_roll_id: filmRolls[0].id,
        photo_number: 2,
        filename: 'test2.jpg',
        original_name: 'test2.jpg',
        title: '测试照片2',
        description: '第二张测试照片，展示不同的拍摄参数',
        taken_date: '2025-01-15',
        camera_id: null,
        aperture: 'f/4.0',
        shutter_speed: '1/60',
        focal_length: '35mm',
        iso: 400,
        latitude: 39.9042,
        longitude: 116.4074,
        location_name: '北京',
        rating: 5,
        is_encrypted: 0,
        tags: '测试,人像,街拍'
      },
      {
        id: 'photo-003',
        film_roll_id: filmRolls[1].id,
        photo_number: 1,
        filename: 'test3.jpg',
        original_name: 'test3.jpg',
        title: '测试照片3',
        description: '第三张测试照片，来自不同的胶卷',
        taken_date: '2025-01-10',
        camera_id: null,
        aperture: 'f/5.6',
        shutter_speed: '1/250',
        focal_length: '85mm',
        iso: 160,
        latitude: 31.2304,
        longitude: 121.4737,
        location_name: '上海',
        rating: 3,
        is_encrypted: 0,
        tags: '测试,建筑,城市'
      }
    ];
    
    // 插入照片数据
    for (const photo of testPhotos) {
      insert(`
      INSERT INTO photos (
        id, film_roll_id, photo_number, filename, original_name, title, description,
          taken_date, camera_id, aperture, shutter_speed, focal_length, iso,
          latitude, longitude, location_name, rating, is_encrypted, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        photo.id, photo.film_roll_id, photo.photo_number, photo.filename,
        photo.original_name, photo.title, photo.description, photo.taken_date,
        photo.camera_id, photo.aperture, photo.shutter_speed, photo.focal_length,
        photo.iso, photo.latitude, photo.longitude, photo.location_name,
        photo.rating, photo.is_encrypted, photo.tags
      ]);
    }
    
    console.log(`成功创建 ${testPhotos.length} 张测试照片`);
    
    // 验证数据
    const result = query('SELECT COUNT(*) as count FROM photos');
    console.log(`数据库中共有 ${result[0].count} 张照片`);
    
    // 显示部分数据
    const sampleData = query('SELECT id, title, filename, film_roll_id FROM photos LIMIT 3');
    console.log('示例数据:', sampleData);
    
    // 创建缩略图目录
    const thumbnailsDir = path.join(__dirname, '../uploads/thumbnails');
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
      console.log('创建缩略图目录:', thumbnailsDir);
    }
    
    // 创建测试缩略图文件（简单的占位符）
    for (const photo of testPhotos) {
      const thumbnailPath = path.join(thumbnailsDir, `${photo.id}_${photo.photo_number.toString().padStart(3, '0')}_thumb.jpg`);
      
      // 创建一个简单的1x1像素的JPEG文件作为占位符
      const placeholderData = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
        0x0F, 0xFF, 0xD9
      ]);
      
      fs.writeFileSync(thumbnailPath, placeholderData);
      console.log('创建缩略图占位符:', thumbnailPath);
    }
    
    console.log('测试照片数据创建完成！');
    
  } catch (error) {
    console.error('创建测试照片数据失败:', error);
  } finally {
    process.exit(0);
  }
};

createTestPhotos();