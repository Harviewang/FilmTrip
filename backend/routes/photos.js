const express = require('express');
const multer = require('multer');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { auth, adminAuth } = require('../middleware/auth');

// 配置multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 获取所有照片 (公开)
router.get('/', photoController.getAllPhotos);

// 测试路由：模拟管理员访问
router.get('/test-admin', (req, res) => {
  // 模拟管理员token
  const jwt = require('jsonwebtoken');
  req.headers.authorization = 'Bearer ' + jwt.sign({ username: 'admin', id: 'test' }, process.env.JWT_SECRET || 'your-secret-key');
  photoController.getAllPhotos(req, res);
});

// 获取单张照片详情 (公开)
router.get('/:id', photoController.getPhotoById);

module.exports = router;
