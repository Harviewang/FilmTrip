const express = require('express');
const router = express.Router();
const filmRollController = require('../controllers/filmRollController');
const { auth, adminAuth } = require('../middleware/auth');

// 为需要解析JSON的路由添加中间件
const jsonParser = express.json();

// 获取所有胶卷实例 (公开)
router.get('/', filmRollController.getAllFilmRolls);

// 获取胶卷实例统计信息 (公开)
router.get('/stats', filmRollController.getFilmRollStats);

// 根据ID获取胶卷实例 (公开)
router.get('/:id', filmRollController.getFilmRollById);

// 创建胶卷实例 (需要认证)
router.post('/', auth, jsonParser, filmRollController.createFilmRoll);

// 更新胶卷实例 (需要认证)
router.put('/:id', auth, jsonParser, filmRollController.updateFilmRoll);

// 删除胶卷实例 (需要管理员权限)
router.delete('/:id', adminAuth, filmRollController.deleteFilmRoll);

// 更新胶卷实例状态 (需要认证)
router.patch('/:id/status', auth, filmRollController.updateFilmRollStatus);

module.exports = router;
