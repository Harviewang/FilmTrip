const fs = require('fs');
const path = require('path');
const { query } = require('../models/db');

/**
 * 检查缩略图文件是否存在
 */
const checkThumbnails = async () => {
  try {
    console.log('🔍 开始检查缩略图文件...');
    
    // 获取所有照片
    const photos = query('SELECT id, filename, photo_number FROM photos LIMIT 10');
    console.log(`📸 找到 ${photos.length} 张照片`);
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
    
    // 检查目录是否存在
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ uploads 目录不存在');
      return;
    }
    
    if (!fs.existsSync(thumbnailsDir)) {
      console.log('❌ thumbnails 目录不存在，创建中...');
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
    
    console.log('📁 目录检查完成');
    console.log(`📂 uploads 目录: ${uploadsDir}`);
    console.log(`📂 thumbnails 目录: ${thumbnailsDir}`);
    
    // 检查每张照片的缩略图
    let missingThumbnails = 0;
    let existingThumbnails = 0;
    
    for (const photo of photos) {
      const thumbnailPath = path.join(thumbnailsDir, `${photo.id}_${photo.photo_number.toString().padStart(3, '0')}_thumb.jpg`);
      const originalPath = path.join(uploadsDir, photo.filename);
      
      const thumbnailExists = fs.existsSync(thumbnailPath);
      const originalExists = fs.existsSync(photo.filename ? originalPath : '');
      
      if (thumbnailExists) {
        existingThumbnails++;
        console.log(`✅ 缩略图存在: ${path.basename(thumbnailPath)}`);
      } else {
        missingThumbnails++;
        console.log(`❌ 缩略图缺失: ${path.basename(thumbnailPath)}`);
      }
      
      if (photo.filename) {
        if (originalExists) {
          console.log(`✅ 原图存在: ${photo.filename}`);
        } else {
          console.log(`❌ 原图缺失: ${photo.filename}`);
        }
      }
    }
    
    console.log('\n📊 检查结果:');
    console.log(`✅ 存在的缩略图: ${existingThumbnails}`);
    console.log(`❌ 缺失的缩略图: ${missingThumbnails}`);
    console.log(`📸 总照片数: ${photos.length}`);
    
    if (missingThumbnails > 0) {
      console.log('\n🔧 建议:');
      console.log('1. 检查缩略图生成逻辑');
      console.log('2. 确保照片上传时自动生成缩略图');
      console.log('3. 手动生成缺失的缩略图');
    }
    
  } catch (error) {
    console.error('❌ 检查缩略图时出错:', error);
  }
};

// 运行检查
checkThumbnails();
