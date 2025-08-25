const { query, update } = require('../models/db');

const fixPhotoFilenames = async () => {
  try {
    console.log('🔄 开始修复照片文件名...');
    
    // 获取所有照片数据
    const photos = query('SELECT id, film_roll_id, photo_number FROM photos ORDER BY film_roll_id, photo_number');
    
    console.log(`📸 找到 ${photos.length} 张照片需要修复文件名`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const photo of photos) {
      try {
        // 生成正确的文件名格式：photo_XXX.jpg
        const correctFilename = `photo_${String(photo.photo_number).padStart(3, '0')}.jpg`;
        
        // 更新数据库中的filename
        const sql = 'UPDATE photos SET filename = ? WHERE id = ?';
        update(sql, [correctFilename, photo.id]);
        
        console.log(`✅ 修复文件名: ${photo.id} -> ${correctFilename}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ 修复文件名失败 ${photo.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 文件名修复完成:`);
    console.log(`✅ 成功: ${successCount} 张`);
    console.log(`❌ 失败: ${errorCount} 张`);
    
  } catch (error) {
    console.error('❌ 修复文件名过程出错:', error);
  } finally {
    process.exit(0);
  }
};

fixPhotoFilenames();
