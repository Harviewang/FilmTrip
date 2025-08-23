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

// 获取单张照片详情 (公开)
router.get('/:id', photoController.getPhotoById);

// 上传照片 (需要认证，使用multer处理文件)
router.post('/', auth, upload.single('file'), photoController.uploadPhoto);

// 更新照片信息 (需要认证)
router.put('/:id', auth, photoController.updatePhoto);

// 删除照片 (需要管理员权限)
router.delete('/:id', adminAuth, photoController.deletePhoto);

module.exports = router;
