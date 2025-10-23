/**
 * 照片尺寸和方向数据修复脚本
 * 
 * 功能: 扫描所有照片,读取实际文件的EXIF信息,更新数据库中的width/height/orientation字段
 * 使用场景: 
 *   1. 历史照片缺少尺寸数据
 *   2. 数据库迁移后需要补全数据
 *   3. 手动修改过照片文件需要同步到数据库
 * 
 * 运行方式:
 *   cd backend && node scripts/fix-photo-dimensions.js
 * 
 * 或者:
 *   npm run fix-dimensions
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('better-sqlite3');

// ANSI颜色代码
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 日志函数
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.blue}=== ${msg} ===${colors.reset}\n`)
};

/**
 * 主函数: 更新所有照片的尺寸和方向数据
 */
async function updateAllPhotos() {
  log.title('照片尺寸和方向数据修复工具');
  
  const dbPath = path.join(__dirname, '../data/filmtrip.db');
  if (!fs.existsSync(dbPath)) {
    log.error(`数据库文件不存在: ${dbPath}`);
    process.exit(1);
  }
  
  const db = sqlite3(dbPath);
  
  try {
    // 获取所有照片
    log.info('正在查询数据库...');
    const photos = db.prepare('SELECT id, filename FROM photos WHERE filename IS NOT NULL').all();
    log.info(`找到 ${photos.length} 张照片`);
    
    if (photos.length === 0) {
      log.warn('没有找到照片,退出');
      return;
    }
    
    // 统计
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const results = [];
    
    // 处理每张照片
    console.log(''); // 空行
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const progress = `[${i + 1}/${photos.length}]`;
      
      try {
        const filePath = path.join(__dirname, '../uploads', photo.filename);
        
        if (!fs.existsSync(filePath)) {
          log.error(`${progress} 文件不存在: ${photo.filename}`);
          failed++;
          results.push({ id: photo.id, filename: photo.filename, status: 'not_found' });
          continue;
        }
        
        // 读取EXIF信息
        const metadata = await sharp(filePath).metadata();
        const width = metadata.width;
        const height = metadata.height;
        const orientation = metadata.orientation || 1;
        
        // 更新数据库
        const result = db.prepare(
          'UPDATE photos SET width = ?, height = ?, orientation = ? WHERE id = ?'
        ).run(width, height, orientation, photo.id);
        
        if (result.changes > 0) {
          log.success(`${progress} ${photo.filename}: ${width}x${height}, orientation=${orientation}`);
          updated++;
          results.push({ 
            id: photo.id, 
            filename: photo.filename, 
            width, 
            height, 
            orientation,
            status: 'updated' 
          });
        } else {
          log.warn(`${progress} ${photo.filename}: 未更新`);
          skipped++;
          results.push({ id: photo.id, filename: photo.filename, status: 'skipped' });
        }
      } catch (error) {
        log.error(`${progress} 处理 ${photo.filename} 失败: ${error.message}`);
        failed++;
        results.push({ id: photo.id, filename: photo.filename, status: 'error', error: error.message });
      }
    }
    
    // 汇总报告
    log.title('修复完成');
    console.log(`总计: ${photos.length} 张照片`);
    console.log(`${colors.green}成功: ${updated}${colors.reset}`);
    console.log(`${colors.yellow}跳过: ${skipped}${colors.reset}`);
    console.log(`${colors.red}失败: ${failed}${colors.reset}`);
    
    // 详细报告
    if (failed > 0) {
      console.log('\n失败照片列表:');
      results.filter(r => r.status === 'error' || r.status === 'not_found').forEach(r => {
        console.log(`  - ${r.filename} (${r.status}${r.error ? ': ' + r.error : ''})`);
      });
    }
    
    // 验证修复结果
    console.log('\n验证修复结果...');
    const missing = db.prepare(
      'SELECT COUNT(*) as count FROM photos WHERE (width IS NULL OR height IS NULL OR width = 0 OR height = 0) AND filename IS NOT NULL'
    ).get();
    
    if (missing.count > 0) {
      log.warn(`仍有 ${missing.count} 张照片缺少尺寸数据`);
    } else {
      log.success('所有照片的尺寸数据都已完整!');
    }
    
  } catch (error) {
    log.error(`脚本执行失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    db.close();
  }
}

/**
 * 检查功能: 只检查不修复
 */
async function checkOnly() {
  log.title('照片数据完整性检查');
  
  const dbPath = path.join(__dirname, '../data/filmtrip.db');
  const db = sqlite3(dbPath);
  
  try {
    // 检查缺少尺寸数据的照片
    const missing = db.prepare(`
      SELECT id, filename, width, height, orientation 
      FROM photos 
      WHERE (width IS NULL OR height IS NULL OR width = 0 OR height = 0) 
        AND filename IS NOT NULL
    `).all();
    
    console.log(`总照片数: ${db.prepare('SELECT COUNT(*) as count FROM photos WHERE filename IS NOT NULL').get().count}`);
    console.log(`缺少尺寸数据: ${missing.length}`);
    
    if (missing.length > 0) {
      console.log('\n缺少数据的照片:');
      missing.forEach((photo, i) => {
        console.log(`  ${i + 1}. ${photo.filename}`);
        console.log(`     width: ${photo.width || 'NULL'}, height: ${photo.height || 'NULL'}, orientation: ${photo.orientation || 'NULL'}`);
      });
      console.log(`\n${colors.yellow}建议运行修复: node scripts/fix-photo-dimensions.js${colors.reset}`);
    } else {
      log.success('所有照片数据完整!');
    }
  } finally {
    db.close();
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0];

if (command === 'check' || command === '--check' || command === '-c') {
  // 只检查不修复
  checkOnly().catch(error => {
    console.error('检查失败:', error);
    process.exit(1);
  });
} else if (command === 'help' || command === '--help' || command === '-h') {
  // 显示帮助
  console.log(`
${colors.blue}照片尺寸和方向数据修复工具${colors.reset}

用法:
  node scripts/fix-photo-dimensions.js [命令]

命令:
  (无参数)  执行修复,更新所有照片的尺寸和方向数据
  check     只检查数据完整性,不进行修复
  help      显示此帮助信息

示例:
  node scripts/fix-photo-dimensions.js          # 执行修复
  node scripts/fix-photo-dimensions.js check    # 检查数据
  npm run fix-dimensions                        # 使用npm脚本执行修复
  npm run check-dimensions                      # 使用npm脚本检查数据
  `);
} else {
  // 执行修复
  updateAllPhotos().catch(error => {
    console.error('修复失败:', error);
    process.exit(1);
  });
}

