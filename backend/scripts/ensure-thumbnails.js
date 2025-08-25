const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
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
    
    // 确保目录存在
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
      console.log('📁 创建 thumbnails 目录');
    }
    
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
      const thumbnailPath = path.join(thumbnailsDir, `${photo.id}_${photo.photo_number.toString().padStart(3, '0')}_thumb.jpg`);
      
      // 检查原图是否存在
      if (!fs.existsSync(originalPath)) {
        console.log(`❌ 原图不存在: ${photo.filename}`);
        errorCount++;
        continue;
      }
      
      // 检查缩略图是否存在且是否需要更新
      let needsUpdate = false;
      if (fs.existsSync(thumbnailPath)) {
        // 检查缩略图文件大小，如果太小说明质量不够
        const stats = fs.statSync(thumbnailPath);
        if (stats.size < 5000) { // 小于5KB的缩略图质量可能不够
          needsUpdate = true;
          console.log(`🔄 缩略图质量不足，需要更新: ${path.basename(thumbnailPath)}`);
        } else {
          console.log(`⏭️  缩略图已存在且质量良好: ${path.basename(thumbnailPath)}`);
          skippedCount++;
          continue;
        }
      } else {
        needsUpdate = true;
        console.log(`🔄 生成新缩略图: ${path.basename(thumbnailPath)}`);
      }
      
      if (needsUpdate) {
        try {
          // 生成高质量缩略图
          await sharp(originalPath)
            .resize(400, 400, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ 
              quality: 85,
              progressive: true,
              mozjpeg: true
            })
            .toFile(thumbnailPath);
          
          console.log(`✅ 缩略图${needsUpdate ? '更新' : '生成'}成功: ${path.basename(thumbnailPath)}`);
          generatedCount++;
          
        } catch (error) {
          console.error(`❌ 缩略图${needsUpdate ? '更新' : '生成'}失败: ${path.basename(thumbnailPath)}`, error.message);
          errorCount++;
        }
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
