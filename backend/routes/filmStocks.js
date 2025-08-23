const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const filmStockController = require('../controllers/filmStockController');
const { auth, adminAuth } = require('../middleware/auth');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/filmStocks');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 获取所有胶卷品类 (公开)
router.get('/', filmStockController.getAllFilmStocks);

// 获取胶卷品类统计信息 (公开)
router.get('/stats', filmStockController.getFilmStockStats);

// 根据ID获取胶卷品类 (公开)
router.get('/:id', filmStockController.getFilmStockById);

// 创建胶卷品类 (需要管理员权限，支持图片上传)
router.post('/', adminAuth, upload.fields([
  { name: 'package_image', maxCount: 1 },
  { name: 'cartridge_image', maxCount: 1 }
]), filmStockController.createFilmStock);

// 更新胶卷品类 (需要管理员权限，支持图片上传)
router.put('/:id', adminAuth, upload.fields([
  { name: 'package_image', maxCount: 1 },
  { name: 'cartridge_image', maxCount: 1 }
]), filmStockController.updateFilmStock);

// 删除胶卷品类 (需要管理员权限)
router.delete('/:id', adminAuth, filmStockController.deleteFilmStock);

module.exports = router;
