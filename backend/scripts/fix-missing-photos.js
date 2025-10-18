const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const sharp = require('sharp');

const dbPath = path.join(__dirname, '../data/filmtrip.db');
const db = new Database(dbPath);

const uploadsDir = path.join(__dirname, '../uploads');
const thumbDir = path.join(uploadsDir, 'thumbnails');
const size1024Dir = path.join(uploadsDir, 'size1024');
const size2048Dir = path.join(uploadsDir, 'size2048');

// 创建目录
[uploadsDir, thumbDir, size1024Dir, size2048Dir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 创建目录: ${dir}`);
  }
});

// 获取所有照片记录
const photos = db.prepare('SELECT id, filename, photo_number FROM photos').all();

console.log(`🔍 找到 ${photos.length} 条照片记录\n`);

// 为每张照片创建测试图片
let created = 0;
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

photos.forEach((photo, index) => {
  const baseName = photo.filename.replace(/\.[^.]+$/, '');
  const originalPath = path.join(uploadsDir, photo.filename);
  const thumbPath = path.join(thumbDir, `${baseName}_thumb.jpg`);
  const size1024Path = path.join(size1024Dir, `${baseName}_1024.jpg`);
  const size2048Path = path.join(size2048Dir, `${baseName}_2048.jpg`);
  
  // 如果文件已存在，跳过
  if (fs.existsSync(originalPath)) {
    return;
  }
  
  // 选择颜色
  const color = colors[index % colors.length];
  
  // 随机决定横竖
  const isPortrait = Math.random() > 0.5;
  const width = isPortrait ? 1200 : 1800;
  const height = isPortrait ? 1800 : 1200;
  
  // 创建SVG内容
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color}88;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad${index})"/>
      <text x="50%" y="45%" text-anchor="middle" font-size="80" fill="white" font-family="Arial">
        照片 #${photo.photo_number}
      </text>
      <text x="50%" y="55%" text-anchor="middle" font-size="40" fill="white" opacity="0.8" font-family="Arial">
        ${baseName.substring(0, 8)}
      </text>
      <text x="50%" y="65%" text-anchor="middle" font-size="30" fill="white" opacity="0.6" font-family="Arial">
        ${width} × ${height}
      </text>
    </svg>
  `;
  
  const svgBuffer = Buffer.from(svg);
  
  try {
    // 生成原图（2400px）
    sharp(svgBuffer)
      .resize(width, height)
      .jpeg({ quality: 90 })
      .toFile(originalPath);
    
    // 生成缩略图（300px）
    sharp(svgBuffer)
      .resize(300, 300, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    
    // 生成1024尺寸
    sharp(svgBuffer)
      .resize(1024, 1024, { fit: 'inside' })
      .jpeg({ quality: 85 })
      .toFile(size1024Path);
    
    // 生成2048尺寸
    sharp(svgBuffer)
      .resize(2048, 2048, { fit: 'inside' })
      .jpeg({ quality: 90 })
      .toFile(size2048Path);
    
    created++;
    if (created % 10 === 0) {
      console.log(`✅ 已创建 ${created}/${photos.length} 张照片`);
    }
  } catch (err) {
    console.error(`❌ 创建失败: ${photo.filename}`, err.message);
  }
});

db.close();

console.log(`\n🎉 完成！共创建 ${created} 张测试图片`);
console.log(`📁 存储位置: ${uploadsDir}`);


