#!/usr/bin/env node

/**
 * 创建更好的测试图片
 * 生成彩色、有视觉差异的SVG占位图片
 */

const fs = require('fs');
const path = require('path');

// 颜色调色板
const colors = [
  { bg: '#ef4444', text: '#ffffff', name: 'Red' },
  { bg: '#3b82f6', text: '#ffffff', name: 'Blue' },
  { bg: '#10b981', text: '#ffffff', name: 'Green' },
  { bg: '#f59e0b', text: '#ffffff', name: 'Orange' },
  { bg: '#8b5cf6', text: '#ffffff', name: 'Purple' },
  { bg: '#ec4899', text: '#ffffff', name: 'Pink' },
  { bg: '#06b6d4', text: '#ffffff', name: 'Cyan' },
  { bg: '#84cc16', text: '#ffffff', name: 'Lime' }
];

// 创建更丰富的SVG占位图片
function createRichSVG(width, height, text, colorIndex) {
  const color = colors[colorIndex % colors.length];
  const gradientId = `grad${colorIndex}`;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${adjustBrightness(color.bg, -20)};stop-opacity:1" />
      </linearGradient>
      <pattern id="dots${colorIndex}" patternUnits="userSpaceOnUse" width="20" height="20">
        <circle cx="10" cy="10" r="2" fill="${color.text}" opacity="0.1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#${gradientId})"/>
    <rect width="100%" height="100%" fill="url(#dots${colorIndex})"/>
    <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${color.text}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="12" fill="${color.text}" text-anchor="middle" dominant-baseline="middle">${width}×${height}</text>
    <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="10" fill="${color.text}" text-anchor="middle" dominant-baseline="middle" opacity="0.8">${color.name} Photo</text>
  </svg>`;
}

// 调整颜色亮度
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// 创建目录结构
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 主函数
async function createBetterTestImages() {
  console.log('🎨 开始创建更好的测试图片...');
  
  const baseDir = path.join(__dirname, '../uploads/Film_roll');
  
  // 创建胶卷目录
  const rolls = [
    { id: 'roll_006', count: 20, name: '彩负四' },
    { id: 'roll_007', count: 15, name: '彩负五' }
  ];

  let totalCreated = 0;
  let colorIndex = 0;

  for (const roll of rolls) {
    const rollDir = path.join(baseDir, roll.id);
    const thumbDir = path.join(rollDir, 'thumbnails');
    
    ensureDirectoryExists(rollDir);
    ensureDirectoryExists(thumbDir);

    console.log(`\n📸 处理 ${roll.id} (${roll.name})...`);

    for (let i = 1; i <= roll.count; i++) {
      const photoNum = i.toString().padStart(3, '0');
      const photoName = `photo_${photoNum}`;
      const displayName = `${roll.name}-${photoNum}`;
      
      // 创建原图 (1200x800)
      const originalPath = path.join(rollDir, `${photoName}.jpg`);
      const originalSVG = createRichSVG(1200, 800, displayName, colorIndex);
      
      // 创建缩略图 (400x267)
      const thumbPath = path.join(thumbDir, `${photoName}_thumb.jpg`);
      const thumbSVG = createRichSVG(400, 267, displayName, colorIndex);

      try {
        // 写入文件
        fs.writeFileSync(originalPath, originalSVG);
        fs.writeFileSync(thumbPath, thumbSVG);
        
        totalCreated += 2;
        colorIndex++;
        
        if (i % 5 === 0 || i === roll.count) {
          console.log(`   ✅ 已创建 ${i}/${roll.count} 张照片`);
        }
      } catch (error) {
        console.error(`   ❌ 创建 ${photoName} 失败:`, error.message);
      }
    }
  }

  console.log(`\n🎉 彩色测试图片创建完成!`);
  console.log(`📊 总计创建: ${totalCreated} 个文件`);
  console.log(`🌈 使用了 ${colors.length} 种颜色主题`);
  console.log(`📁 存储位置: ${baseDir}`);
  console.log(`\n💡 提示: 现在每张图片都有不同的颜色，便于测试识别`);
}

// 运行脚本
if (require.main === module) {
  createBetterTestImages().catch(console.error);
}

module.exports = { createBetterTestImages };

