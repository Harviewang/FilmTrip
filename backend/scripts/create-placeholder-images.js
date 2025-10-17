#!/usr/bin/env node

/**
 * 创建占位图片脚本
 * 为测试创建SVG占位图片和缩略图
 */

const fs = require('fs');
const path = require('path');

// 创建SVG占位图片
function createPlaceholderSVG(width, height, text, bgColor = '#f3f4f6', textColor = '#6b7280') {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
}

// 创建目录结构
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 创建目录: ${dirPath}`);
  }
}

// 主函数
async function createPlaceholderImages() {
  console.log('🎨 开始创建占位图片...');
  
  const baseDir = path.join(__dirname, '../uploads/Film_roll');
  
  // 创建胶卷目录
  const rolls = [
    { id: 'roll_001', count: 36 },
    { id: 'roll_002', count: 24 },
    { id: 'roll_003', count: 36 },
    { id: 'roll_004', count: 24 },
    { id: 'roll_005', count: 36 },
    { id: 'roll_006', count: 36 },
    { id: 'roll_007', count: 15 }
  ];

  let totalCreated = 0;

  for (const roll of rolls) {
    const rollDir = path.join(baseDir, roll.id);
    const thumbDir = path.join(rollDir, 'thumbnails');
    
    ensureDirectoryExists(rollDir);
    ensureDirectoryExists(thumbDir);

    for (let i = 1; i <= roll.count; i++) {
      const photoNum = i.toString().padStart(3, '0');
      const photoName = `photo_${photoNum}`;
      
      // 创建原图 (1200x800)
      const originalPath = path.join(rollDir, `${photoName}.jpg`);
      const originalSVG = createPlaceholderSVG(
        1200, 800, 
        `${roll.id}\n${photoName}\n1200x800`, 
        '#e5e7eb', '#374151'
      );
      
      // 创建缩略图 (400x267)
      const thumbPath = path.join(thumbDir, `${photoName}_thumb.jpg`);
      const thumbSVG = createPlaceholderSVG(
        400, 267, 
        `${roll.id}\n${photoName}\n400x267`, 
        '#f9fafb', '#6b7280'
      );

      try {
        // 写入SVG文件（临时用SVG代替JPG）
        fs.writeFileSync(originalPath.replace('.jpg', '.svg'), originalSVG);
        fs.writeFileSync(thumbPath.replace('.jpg', '.svg'), thumbSVG);
        
        // 也创建JPG扩展名的文件（实际还是SVG内容，但路径正确）
        fs.writeFileSync(originalPath, originalSVG);
        fs.writeFileSync(thumbPath, thumbSVG);
        
        totalCreated += 2;
        
        if (i % 10 === 0 || i === roll.count) {
          console.log(`📸 ${roll.id}: 已创建 ${i}/${roll.count} 张照片`);
        }
      } catch (error) {
        console.error(`❌ 创建 ${photoName} 失败:`, error.message);
      }
    }
  }

  console.log(`\n🎉 占位图片创建完成!`);
  console.log(`📊 总计创建: ${totalCreated} 个文件`);
  console.log(`📁 存储位置: ${baseDir}`);
  console.log(`\n💡 提示: 这些是SVG占位图片，用于测试界面功能`);
}

// 运行脚本
if (require.main === module) {
  createPlaceholderImages().catch(console.error);
}

module.exports = { createPlaceholderImages };

