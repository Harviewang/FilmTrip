const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cameraController = require('../controllers/cameraController');
const { adminAuth } = require('../middleware/auth');

// 为不需要文件上传的路由添加 JSON 解析中间件
const jsonParser = express.json();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/cameras');
    // 确保目录存在
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
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 添加调试中间件
const debugMiddleware = (req, res, next) => {
  console.log('=== Multer 调试信息 ===');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('req.body (before multer):', req.body);
  console.log('req.file (after multer):', req.file);
  console.log('req.files (after multer):', req.files);
  console.log('req.body (after multer):', req.body);
  next();
};

// 获取所有相机 (公开)
router.get('/', cameraController.getAllCameras);

// 获取单个相机详情 (公开)
router.get('/:id', cameraController.getCameraById);

// 创建新相机 (需要管理员权限，支持文件上传)
router.post('/', adminAuth, upload.single('image'), debugMiddleware, cameraController.createCamera);

// 更新相机信息 (需要管理员权限，支持文件上传)
router.put('/:id', adminAuth, upload.single('image'), debugMiddleware, cameraController.updateCamera);

// 删除相机 (需要管理员权限)
router.delete('/:id', adminAuth, cameraController.deleteCamera);

module.exports = router;
