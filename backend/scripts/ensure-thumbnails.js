const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sizeOf = require('image-size');
const { query } = require('../models/db');

/**
 * 确保所有照片都有高质量的缩略图
 */
const ensureThumbnails = async () => {
  try {
    console.log('🔧 开始确保所有照片都有缩略图...');
    
    // 获取所有照片
    const photos = query('SELECT id, filename, photo_number FROM photos ORDER BY id');
    console.log(`📸 找到 ${photos.length} 张照片`);
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
    const size1024Dir = path.join(uploadsDir, 'size1024');
    const size2048Dir = path.join(uploadsDir, 'size2048');
    
    // 确保目录存在
    [thumbnailsDir, size1024Dir, size2048Dir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 创建 ${path.basename(dir)} 目录`);
      }
    });
    
    let generatedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const photo of photos) {
      if (!photo.filename) {
        console.log(`⚠️  照片 ${photo.id} 没有文件名，跳过`);
        continue;
      }
      
      const originalPath = path.join(uploadsDir, photo.filename);
      const baseName = photo.filename.replace(/\.[^.]+$/, '');
      const thumbnailPath = path.join(thumbnailsDir, `${baseName}_thumb.jpg`);
      const size1024Path = path.join(size1024Dir, `${baseName}_1024.jpg`);
      const size2048Path = path.join(size2048Dir, `${baseName}_2048.jpg`);
      
      // 检查原图是否存在
      if (!fs.existsSync(originalPath)) {
        console.log(`❌ 原图不存在: ${photo.filename}`);
        errorCount++;
        continue;
      }
      
      // 检查是否需要重新生成（如果任一派生图缺失则全部重建）
      const needsUpdate = !fs.existsSync(thumbnailPath) || !fs.existsSync(size1024Path) || !fs.existsSync(size2048Path);
      
      if (!needsUpdate) {
        console.log(`⏭️  所有派生图已存在: ${baseName}`);
        skippedCount++;
        continue;
      }
      
      console.log(`🔄 重新生成派生图: ${baseName}`);
      
      try {
        // 生成三个派生图：rotate()应用EXIF方向，withMetadata(false)移除EXIF防止前端二次旋转
        await sharp(originalPath)
          .rotate()
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .withMetadata(false)
          .toFile(thumbnailPath);
        
        await sharp(originalPath)
          .rotate()
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .withMetadata(false)
          .toFile(size1024Path);
        
        await sharp(originalPath)
          .rotate()
          .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .withMetadata(false)
          .toFile(size2048Path);
        
        console.log(`✅ 派生图生成成功: ${baseName} (thumb, 1024, 2048)`);
        generatedCount++;
        
      } catch (error) {
        console.error(`❌ 派生图生成失败: ${baseName}`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 缩略图处理结果:');
    console.log(`✅ 新生成/更新的缩略图: ${generatedCount}`);
    console.log(`⏭️  已存在且质量良好的缩略图: ${skippedCount}`);
    console.log(`❌ 处理失败的缩略图: ${errorCount}`);
    console.log(`📸 总照片数: ${photos.length}`);
    
    if (generatedCount > 0) {
      console.log('\n🎉 缩略图处理完成！现在前端应该能正常显示所有照片了。');
      console.log('💡 提示: 未来上传的照片会自动生成缩略图。');
    }
    
    // 显示一些统计信息
    if (photos.length > 0) {
      const totalSize = photos.reduce((acc, photo) => {
        const thumbnailPath = path.join(thumbnailsDir, `${photo.id}_${photo.photo_number.toString().padStart(3, '0')}_thumb.jpg`);
        if (fs.existsSync(thumbnailPath)) {
          return acc + fs.statSync(thumbnailPath).size;
        }
        return acc;
      }, 0);
      
      console.log(`📊 缩略图总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`📊 平均缩略图大小: ${(totalSize / photos.length / 1024).toFixed(2)} KB`);
    }
    
  } catch (error) {
    console.error('❌ 处理缩略图时出错:', error);
  }
};

// 运行脚本
ensureThumbnails();
