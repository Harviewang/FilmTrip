const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./models/db');

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注意：express.json() 和 express.urlencoded() 会干扰文件上传
// 只在需要的地方使用，避免影响 multer 中间件

// 静态文件服务 - 添加CORS头和正确的Content-Type
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // 检查文件内容来确定正确的Content-Type
    const fs = require('fs');
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('<svg')) {
        res.set('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.set('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.png')) {
        res.set('Content-Type', 'image/png');
      }
    } catch (error) {
      // 如果读取失败，使用默认类型
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.set('Content-Type', 'image/jpeg');
      }
    }
  }
}));

// 路由导入
const userRoutes = require('./routes/users');
const photoRoutes = require('./routes/photos');
const albumRoutes = require('./routes/albums');
const cameraRoutes = require('./routes/cameras');
const scannerRoutes = require('./routes/scanners');
const statsRoutes = require('./routes/stats');
const filmStockRoutes = require('./routes/filmStocks');
const filmRollRoutes = require('./routes/filmRolls');
const rollPhotosRoutes = require('./routes/rollPhotos');
const mapRoutes = require('./routes/map');

// 根路径路由
app.get('/', (req, res) => {
  res.json({
    message: '胶片管理系统后端API服务器',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      photos: '/api/photos',
      albums: '/api/albums',
      cameras: '/api/cameras',
      scanners: '/api/scanners',
      stats: '/api/stats',
      filmStocks: '/api/filmStocks',
      filmRolls: '/api/filmRolls',
      map: '/api/map'
    },
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API路由
app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/scanners', scannerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/filmStocks', filmStockRoutes);
app.use('/api/filmRolls', filmRollRoutes);
app.use('/api/rollPhotos', rollPhotosRoutes);
app.use('/api/map', mapRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  // 初始化数据库
  db.initialize();

  // 自动创建admin用户
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');

  // 检查admin用户是否存在
  const existingUsers = db.query('SELECT * FROM users WHERE username = ?', ['admin']);
  if (existingUsers.length === 0) {
    // 创建admin用户
    const saltRounds = 12;
    const hashedPassword = bcrypt.hashSync('admin', saltRounds);
    const id = uuidv4();
    db.insert(
      'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
      [id, 'admin', hashedPassword]
    );
    console.log('已创建管理员账号: admin/admin');
  } else {
    console.log('管理员账号已存在');
  }
});

module.exports = app;
