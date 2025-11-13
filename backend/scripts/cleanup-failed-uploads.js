/**
 * 清理上传失败的占位符照片
 * 删除那些有 POLICY_CREATED 但没有 UPLOAD_CALLBACK 的照片记录
 */

const db = require('../models/db');
require('dotenv').config();

// 初始化数据库
db.initialize();

const { query, delete: deleteRecord } = db;

const cleanupFailedUploads = async () => {
  try {
    console.log('=== 开始清理上传失败的占位符照片 ===\n');
    
    // 查找所有有 POLICY_CREATED 但没有 UPLOAD_CALLBACK 的照片
    const failedPhotos = query(`
      SELECT DISTINCT p.*
      FROM photos p
      INNER JOIN storage_actions sa ON p.id = sa.photo_id
      WHERE sa.action = 'POLICY_CREATED'
        AND sa.provider = 'UPYUN'
        AND p.origin_bucket = 'filmtrip-dev'
        AND NOT EXISTS (
          SELECT 1 
          FROM storage_actions sa2 
          WHERE sa2.photo_id = p.id 
            AND sa2.action = 'UPLOAD_CALLBACK'
        )
        AND NOT EXISTS (
          SELECT 1 
          FROM storage_files sf 
          WHERE sf.photo_id = p.id
        )
    `);
    
    console.log(`找到 ${failedPhotos.length} 张上传失败的占位符照片:\n`);
    
    if (failedPhotos.length === 0) {
      console.log('✅ 没有需要清理的占位符照片');
      return;
    }
    
    failedPhotos.forEach((photo, index) => {
      console.log(`${index + 1}. ${photo.filename} (${photo.short_code || 'N/A'})`);
      console.log(`   ID: ${photo.id}`);
      console.log(`   origin_bucket: ${photo.origin_bucket}`);
      console.log(`   origin_path: ${photo.origin_path}`);
      console.log(`   uploaded_at: ${photo.uploaded_at}`);
      console.log('');
    });
    
    console.log('⚠️  准备删除以下数据:');
    console.log(`   - ${failedPhotos.length} 张占位符照片`);
    console.log(`   - 相关的 storage_actions 记录`);
    console.log(`   - 相关的 storage_files 记录（如果有）`);
    console.log('');
    
    // 删除 storage_actions
    if (failedPhotos.length > 0) {
      const photoIds = failedPhotos.map(p => p.id);
      const photoPlaceholders = photoIds.map(() => '?').join(',');
      const actions = query(`SELECT * FROM storage_actions WHERE photo_id IN (${photoPlaceholders})`, photoIds);
      console.log(`找到 ${actions.length} 条 storage_actions 记录`);
      
      if (actions.length > 0) {
        deleteRecord(`DELETE FROM storage_actions WHERE photo_id IN (${photoPlaceholders})`, photoIds);
        console.log(`✅ 已删除 ${actions.length} 条 storage_actions 记录`);
      }
    }
    
    // 删除 storage_files
    if (failedPhotos.length > 0) {
      const photoIds = failedPhotos.map(p => p.id);
      const photoPlaceholders = photoIds.map(() => '?').join(',');
      const files = query(`SELECT * FROM storage_files WHERE photo_id IN (${photoPlaceholders})`, photoIds);
      console.log(`找到 ${files.length} 条 storage_files 记录`);
      
      if (files.length > 0) {
        deleteRecord(`DELETE FROM storage_files WHERE photo_id IN (${photoPlaceholders})`, photoIds);
        console.log(`✅ 已删除 ${files.length} 条 storage_files 记录`);
      }
    }
    
    // 删除照片
    if (failedPhotos.length > 0) {
      const photoIds = failedPhotos.map(p => p.id);
      const photoPlaceholders = photoIds.map(() => '?').join(',');
      deleteRecord(`DELETE FROM photos WHERE id IN (${photoPlaceholders})`, photoIds);
      console.log(`✅ 已删除 ${failedPhotos.length} 张占位符照片`);
    }
    
    console.log('\n=== 清理完成 ===');
    
  } catch (error) {
    console.error('清理上传失败的占位符照片失败:', error);
  } finally {
    process.exit(0);
  }
};

cleanupFailedUploads();

