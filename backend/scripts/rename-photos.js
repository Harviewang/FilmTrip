const fs = require('fs');
const path = require('path');
const { query } = require('../models/db');

const renamePhotos = async () => {
  try {
    console.log('🔄 开始重命名照片文件...');
    
    // 获取所有照片数据
    const photos = query('SELECT id, filename, film_roll_id, photo_number FROM photos ORDER BY film_roll_id, photo_number');
    
    console.log(`📸 找到 ${photos.length} 张照片需要重命名`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const photo of photos) {
      try {
        const rollNumber = photo.film_roll_id.replace('roll-', 'roll_');
        const sourceDir = path.join(__dirname, '../uploads/Film_roll', rollNumber, 'photos');
        const targetFile = path.join(sourceDir, photo.filename);
        
        // 检查目标文件是否已存在
        if (fs.existsSync(targetFile)) {
          console.log(`✅ ${photo.filename} 已存在，跳过`);
          successCount++;
          continue;
        }
        
        // 查找源文件（按序号命名）
        const sourceFiles = fs.readdirSync(sourceDir).filter(f => 
          f.match(/^\d+\.(jpg|JPG|png|PNG)$/)
        ).sort((a, b) => {
          const numA = parseInt(a.match(/^(\d+)/)[1]);
          const numB = parseInt(b.match(/^(\d+)/)[1]);
          return numA - numB;
        });
        
        if (sourceFiles.length === 0) {
          console.log(`⚠️ 胶卷 ${rollNumber} 没有找到源文件`);
          continue;
        }
        
        // 根据photo_number选择对应的源文件
        const sourceIndex = photo.photo_number - 1;
        if (sourceIndex < sourceFiles.length) {
          const sourceFile = path.join(sourceDir, sourceFiles[sourceIndex]);
          const targetFile = path.join(sourceDir, photo.filename);
          
          // 重命名文件
          fs.renameSync(sourceFile, targetFile);
          console.log(`✅ 重命名: ${sourceFiles[sourceIndex]} -> ${photo.filename}`);
          successCount++;
        } else {
          console.log(`⚠️ 照片 ${photo.id} 的序号超出范围: ${photo.photo_number} > ${sourceFiles.length}`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ 重命名照片 ${photo.id} 失败:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 重命名完成:`);
    console.log(`✅ 成功: ${successCount} 张`);
    console.log(`❌ 失败: ${errorCount} 张`);
    
  } catch (error) {
    console.error('❌ 重命名过程出错:', error);
  } finally {
    process.exit(0);
  }
};

renamePhotos();
