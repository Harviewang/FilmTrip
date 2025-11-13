/**
 * 清理测试照片数据
 * 删除 Test Roll 胶卷及其下的所有照片
 */

const db = require('../models/db');
require('dotenv').config();

// 初始化数据库
db.initialize();

const { query, delete: deleteRecord } = db;

const cleanupTestPhotos = async () => {
  try {
    console.log('=== 开始清理测试照片数据 ===\n');
    
    // 查找测试胶卷
    const testRolls = query("SELECT * FROM film_rolls WHERE name LIKE '%Test%' OR name LIKE '%test%'");
    
    if (testRolls.length === 0) {
      console.log('未找到测试胶卷');
      return;
    }
    
    console.log(`找到 ${testRolls.length} 个测试胶卷:\n`);
    testRolls.forEach((roll, index) => {
      console.log(`${index + 1}. ${roll.name} (ID: ${roll.id})`);
    });
    console.log('');
    
    // 查找这些胶卷下的照片
    const rollIds = testRolls.map(r => r.id);
    const placeholders = rollIds.map(() => '?').join(',');
    const photos = query(`SELECT * FROM photos WHERE film_roll_id IN (${placeholders})`, rollIds);
    
    console.log(`找到 ${photos.length} 张测试照片:\n`);
    photos.forEach((photo, index) => {
      console.log(`${index + 1}. ${photo.filename} (${photo.short_code || 'N/A'})`);
      console.log(`   ID: ${photo.id}`);
      console.log(`   origin_bucket: ${photo.origin_bucket || 'NULL'}`);
      console.log(`   origin_path: ${photo.origin_path || 'NULL'}`);
    });
    console.log('');
    
    // 确认删除
    console.log('⚠️  准备删除以下数据:');
    console.log(`   - ${testRolls.length} 个测试胶卷`);
    console.log(`   - ${photos.length} 张测试照片`);
    console.log(`   - 相关的 storage_actions 记录`);
    console.log(`   - 相关的 storage_files 记录`);
    console.log('');
    
    // 删除 storage_actions
    if (photos.length > 0) {
      const photoIds = photos.map(p => p.id);
      const photoPlaceholders = photoIds.map(() => '?').join(',');
      const actions = query(`SELECT * FROM storage_actions WHERE photo_id IN (${photoPlaceholders})`, photoIds);
      console.log(`找到 ${actions.length} 条 storage_actions 记录`);
      
      if (actions.length > 0) {
        deleteRecord(`DELETE FROM storage_actions WHERE photo_id IN (${photoPlaceholders})`, photoIds);
        console.log(`✅ 已删除 ${actions.length} 条 storage_actions 记录`);
      }
    }
    
    // 删除 storage_files
    if (photos.length > 0) {
      const photoIds = photos.map(p => p.id);
      const photoPlaceholders = photoIds.map(() => '?').join(',');
      const files = query(`SELECT * FROM storage_files WHERE photo_id IN (${photoPlaceholders})`, photoIds);
      console.log(`找到 ${files.length} 条 storage_files 记录`);
      
      if (files.length > 0) {
        deleteRecord(`DELETE FROM storage_files WHERE photo_id IN (${photoPlaceholders})`, photoIds);
        console.log(`✅ 已删除 ${files.length} 条 storage_files 记录`);
      }
    }
    
    // 删除照片
    if (photos.length > 0) {
      const photoIds = photos.map(p => p.id);
      const photoPlaceholders = photoIds.map(() => '?').join(',');
      deleteRecord(`DELETE FROM photos WHERE id IN (${photoPlaceholders})`, photoIds);
      console.log(`✅ 已删除 ${photos.length} 张测试照片`);
    }
    
    // 删除胶卷
    const rollPlaceholders = rollIds.map(() => '?').join(',');
    deleteRecord(`DELETE FROM film_rolls WHERE id IN (${rollPlaceholders})`, rollIds);
    console.log(`✅ 已删除 ${testRolls.length} 个测试胶卷`);
    
    console.log('\n=== 清理完成 ===');
    
  } catch (error) {
    console.error('清理测试照片数据失败:', error);
  } finally {
    process.exit(0);
  }
};

cleanupTestPhotos();

