#!/usr/bin/env node

/**
 * 创建测试照片数据脚本
 * 生成测试用的胶卷、相机和照片数据
 */

const { query, insert } = require('../models/db');
const fs = require('fs');
const path = require('path');

async function createTestData() {
  console.log('开始创建测试数据...');

  try {
    // 1. 创建测试相机
    console.log('创建测试相机...');
    const cameras = [
      { id: 'camera-001', name: 'Leica M6', model: 'M6', brand: 'Leica', type: 'Rangefinder', format: '35mm' },
      { id: 'camera-002', name: 'Canon AE-1', model: 'AE-1', brand: 'Canon', type: 'SLR', format: '35mm' },
      { id: 'camera-003', name: 'Nikon F3', model: 'F3', brand: 'Nikon', type: 'SLR', format: '35mm' },
      { id: 'camera-004', name: 'Pentax K1000', model: 'K1000', brand: 'Pentax', type: 'SLR', format: '35mm' }
    ];

    for (const camera of cameras) {
      insert(
        `INSERT OR IGNORE INTO cameras (id, name, model, brand, type, format, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [camera.id, camera.name, camera.model, camera.brand, camera.type, camera.format]
      );
    }

    // 2. 创建测试胶卷品类
    console.log('创建测试胶卷品类...');
    const filmStocks = [
      { id: 'stock-001', serial: 'Kodak Portra 400', brand: 'Kodak', series: 'Portra', iso: 400, format: '35mm', type: 'Color Negative' },
      { id: 'stock-002', serial: 'Fujifilm Superia 400', brand: 'Fujifilm', series: 'Superia', iso: 400, format: '35mm', type: 'Color Negative' },
      { id: 'stock-003', serial: 'Ilford HP5 Plus', brand: 'Ilford', series: 'HP5 Plus', iso: 400, format: '35mm', type: 'Black and White Negative' }
    ];

    for (const stock of filmStocks) {
      insert(
        `INSERT OR IGNORE INTO film_stocks (id, stock_serial_number, brand, series, iso, format, type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [stock.id, stock.serial, stock.brand, stock.series, stock.iso, stock.format, stock.type]
      );
    }

    // 3. 创建测试胶卷实例
    console.log('创建测试胶卷实例...');
    const filmRolls = [
      { id: 'roll-001', stockId: 'stock-001', number: '2025-001', name: '北京之行', cameraId: 'camera-001', location: '北京' },
      { id: 'roll-002', stockId: 'stock-002', number: '2025-002', name: '上海风情', cameraId: 'camera-002', location: '上海' },
      { id: 'roll-003', stockId: 'stock-003', number: '2025-003', name: '广州纪行', cameraId: 'camera-003', location: '广州' }
    ];

    for (const roll of filmRolls) {
      insert(
        `INSERT OR IGNORE INTO film_rolls (
          id, film_stock_id, roll_number, name, opened_date, location, camera_id, camera_name,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [roll.id, roll.stockId, roll.number, roll.name, '2025-01-01', roll.location, roll.cameraId, roll.cameraId, '已完成']
      );
    }

    // 4. 创建测试照片
    console.log('创建测试照片...');

    // 创建uploads目录结构
    const uploadsDir = path.join(__dirname, '../uploads');
    const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
    const size1024Dir = path.join(uploadsDir, 'size1024');
    const size2048Dir = path.join(uploadsDir, 'size2048');

    [uploadsDir, thumbnailsDir, size1024Dir, size2048Dir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    const photos = [
      // 北京之行照片
      { rollId: 'roll-001', number: 1, title: '故宫角楼', lat: 39.9163, lng: 116.3972, location: '故宫博物院' },
      { rollId: 'roll-001', number: 2, title: '天安门广场', lat: 39.9055, lng: 116.3976, location: '天安门广场' },
      { rollId: 'roll-001', number: 3, title: '长城', lat: 40.4319, lng: 116.5704, location: '八达岭长城' },
      { rollId: 'roll-001', number: 4, title: '胡同', lat: 39.9333, lng: 116.4167, location: '北京胡同' },

      // 上海风情照片
      { rollId: 'roll-002', number: 1, title: '外滩', lat: 31.2419, lng: 121.4905, location: '上海外滩' },
      { rollId: 'roll-002', number: 2, title: '南京路', lat: 31.2348, lng: 121.4737, location: '南京路步行街' },
      { rollId: 'roll-002', number: 3, title: '城隍庙', lat: 31.2243, lng: 121.4879, location: '上海城隍庙' },

      // 广州纪行照片
      { rollId: 'roll-003', number: 1, title: '越秀公园', lat: 23.1438, lng: 113.2644, location: '越秀公园' },
      { rollId: 'roll-003', number: 2, title: '白云山', lat: 23.1828, lng: 113.2750, location: '白云山' },
      { rollId: 'roll-003', number: 3, title: '珠江夜景', lat: 23.1065, lng: 113.3244, location: '珠江两岸' }
    ];

    for (const photo of photos) {
      const id = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const filename = `${id}.jpg`;

      // 创建一个1x1像素的测试图片文件
      const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

      // 保存原图
      fs.writeFileSync(path.join(uploadsDir, filename), testImageBuffer);

      // 创建缩略图
      fs.writeFileSync(path.join(thumbnailsDir, `${id}_thumb.jpg`), testImageBuffer);

      // 创建1024和2048尺寸
      fs.writeFileSync(path.join(size1024Dir, `${id}_1024.jpg`), testImageBuffer);
      fs.writeFileSync(path.join(size2048Dir, `${id}_2048.jpg`), testImageBuffer);

      // 插入数据库
      insert(
        `INSERT INTO photos (
          id, film_roll_id, photo_number, filename, original_name, title, description,
          taken_date, latitude, longitude, location_name, uploaded_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          id,
          photo.rollId,
          photo.number,
          filename,
          `${photo.title}.jpg`,
          photo.title,
          `拍摄于${photo.location}`,
          '2025-01-15',
          photo.lat,
          photo.lng,
          photo.location
        ]
      );

      console.log(`创建照片: ${photo.title} (${photo.location})`);
    }

    console.log('✅ 测试数据创建完成！');
    console.log('📊 创建统计:');
    console.log(`  - 相机: ${cameras.length} 台`);
    console.log(`  - 胶卷品类: ${filmStocks.length} 种`);
    console.log(`  - 胶卷实例: ${filmRolls.length} 个`);
    console.log(`  - 照片: ${photos.length} 张`);

  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
  }
}

// 运行脚本
if (require.main === module) {
  createTestData().then(() => {
    console.log('🎉 所有测试数据创建完成！');
    process.exit(0);
  }).catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { createTestData };
