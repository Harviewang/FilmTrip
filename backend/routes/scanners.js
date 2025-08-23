const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');
const { adminAuth } = require('../middleware/auth');

// 获取所有扫描仪 (公开)
router.get('/', scannerController.getAllScanners);

// 获取单个扫描仪详情 (公开)
router.get('/:id', scannerController.getScannerById);

// 创建新扫描仪 (需要管理员权限)
router.post('/', adminAuth, scannerController.createScanner);

// 更新扫描仪信息 (需要管理员权限)
router.put('/:id', adminAuth, scannerController.updateScanner);

// 删除扫描仪 (需要管理员权限)
router.delete('/:id', adminAuth, scannerController.deleteScanner);

module.exports = router;
