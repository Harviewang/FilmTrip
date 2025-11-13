const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const { adminAuth } = require('../middleware/auth');

// 生成上传策略（需要管理员权限）
router.post('/policy', adminAuth, storageController.createPolicy);

// 又拍云回调接口（无需认证，由签名校验保护）
router.post('/callback', express.urlencoded({ extended: true }), storageController.handleCallback);

// 获取受保护资源的签名URL（需要管理员权限）
router.get('/protected-url', adminAuth, storageController.getProtectedUrl);

// CDN缓存刷新（需要管理员权限）
router.post('/purge', adminAuth, storageController.purgeCache);

module.exports = router;

