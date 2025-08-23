const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { adminAuth } = require('../middleware/auth');

// 获取仪表板统计数据 (需要管理员权限)
router.get('/dashboard', adminAuth, statsController.getDashboardStats);

// 获取照片趋势统计 (需要管理员权限)
router.get('/trends', adminAuth, statsController.getPhotoTrends);

// 获取存储统计 (需要管理员权限)
router.get('/storage', adminAuth, statsController.getStorageStats);

module.exports = router;
