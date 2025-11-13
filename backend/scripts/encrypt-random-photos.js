/**
 * 随机加密照片脚本
 * 随机选择1/5的照片设置为加密状态
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/filmtrip.db');
const db = new Database(dbPath);

try {
  // 获取所有照片
  const allPhotos = db.prepare('SELECT id, filename FROM photos').all();
  console.log(`总照片数: ${allPhotos.length}`);
  
  if (allPhotos.length === 0) {
    console.log('没有照片可以加密');
    process.exit(0);
  }
  
  // 计算需要加密的数量（1/5）
  const targetCount = Math.ceil(allPhotos.length / 5);
  console.log(`需要加密的照片数: ${targetCount}`);
  
  // 随机打乱数组
  const shuffled = allPhotos.sort(() => Math.random() - 0.5);
  
  // 选择前 targetCount 张照片
  const photosToEncrypt = shuffled.slice(0, targetCount);
  
  // 开始事务
  const updateStmt = db.prepare('UPDATE photos SET is_protected = 1 WHERE id = ?');
  const transaction = db.transaction((photos) => {
    for (const photo of photos) {
      updateStmt.run(photo.id);
    }
  });
  
  // 执行更新
  transaction(photosToEncrypt);
  
  console.log(`\n已成功加密 ${photosToEncrypt.length} 张照片:`);
  photosToEncrypt.forEach((photo, index) => {
    console.log(`${index + 1}. ${photo.filename} (ID: ${photo.id})`);
  });
  
  // 验证结果
  const encryptedCount = db.prepare('SELECT COUNT(*) as count FROM photos WHERE is_protected = 1').get();
  console.log(`\n验证: 当前加密照片总数: ${encryptedCount.count}`);
  
} catch (error) {
  console.error('加密照片时出错:', error);
  process.exit(1);
} finally {
  db.close();
}











