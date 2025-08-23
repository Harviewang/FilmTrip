const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const { adminAuth } = require('../middleware/auth');

// 获取所有相册 (公开)
router.get('/', albumController.getAllAlbums);

// 获取单个相册详情 (公开)
router.get('/:id', albumController.getAlbumById);

// 创建新相册 (需要管理员权限)
router.post('/', adminAuth, albumController.createAlbum);

// 更新相册信息 (需要管理员权限)
router.put('/:id', adminAuth, albumController.updateAlbum);

// 删除相册 (需要管理员权限)
router.delete('/:id', adminAuth, albumController.deleteAlbum);

module.exports = router;
