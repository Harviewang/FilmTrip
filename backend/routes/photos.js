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

// 获取随机照片 (公开)
router.get('/random', photoController.getRandomPhotos);

// 测试路由：模拟管理员访问
router.get('/test-admin', (req, res) => {
  // 模拟管理员token
  const jwt = require('jsonwebtoken');
  req.headers.authorization = 'Bearer ' + jwt.sign({ username: 'admin', id: 'test' }, process.env.JWT_SECRET || 'your-secret-key');
  photoController.getAllPhotos(req, res);
});

// 获取单张照片详情 (公开)
router.get('/:id', photoController.getPhotoById);

// 上传单张照片 (需要管理员权限)
router.post('/', upload.single('photo'), photoController.uploadPhoto);

// 批量上传照片 (需要管理员权限)
router.post('/batch', upload.array('photos', 50), photoController.uploadPhotosBatch);

// 更新照片信息 (需要管理员权限)
router.put('/:id', photoController.updatePhoto);

// 删除照片 (需要管理员权限)
router.delete('/:id', photoController.deletePhoto);

module.exports = router;
