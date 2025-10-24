const { query, insert, update, delete: deleteRecord } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

/**
 * 获取所有扫描仪
 */
const getAllScanners = (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // 查询总数
    const countResult = query('SELECT COUNT(*) as total FROM scanners');
    const total = countResult[0].total;

    // 查询扫描仪列表
    const scanners = query(`
      SELECT * FROM scanners 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      scanners,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取扫描仪列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取扫描仪列表失败',
      error: error.message
    });
  }
};

/**
 * 获取单个扫描仪详情
 */
const getScannerById = (req, res) => {
  try {
    const { id } = req.params;

    const scanners = query('SELECT * FROM scanners WHERE id = ?', [id]);

    if (scanners.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该扫描仪'
      });
    }

    res.json({
      success: true,
      data: scanners[0]
    });
  } catch (error) {
    console.error('获取扫描仪详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取扫描仪详情失败',
      error: error.message
    });
  }
};

/**
 * 创建新扫描仪
 */
const createScanner = (req, res) => {
  try {
    const { name, model, type } = req.body;

    if (!name || !model) {
      return res.status(400).json({
        success: false,
        message: '扫描仪名称和型号不能为空'
      });
    }

    // 检查扫描仪型号是否已存在
    const existingScanners = query('SELECT * FROM scanners WHERE model = ?', [model]);
    if (existingScanners.length > 0) {
      return res.status(400).json({
        success: false,
        message: '扫描仪型号已存在'
      });
    }

    const id = uuidv4();
    const result = insert(
      'INSERT INTO scanners (id, name, model, type) VALUES (?, ?, ?, ?)',
      [id, name, model, type]
    );

    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '创建扫描仪失败'
      });
    }

    // 获取新创建的扫描仪
    const newScanner = query('SELECT * FROM scanners WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: '扫描仪创建成功',
      data: newScanner[0]
    });
  } catch (error) {
    console.error('创建扫描仪失败:', error);
    res.status(500).json({
      success: false,
      message: '创建扫描仪失败',
      error: error.message
    });
  }
};

/**
 * 更新扫描仪信息
 */
const updateScanner = (req, res) => {
  try {
    const { id } = req.params;
    const { name, model, type } = req.body;

    // 验证扫描仪是否存在
    const existingScanners = query('SELECT * FROM scanners WHERE id = ?', [id]);
    if (existingScanners.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该扫描仪'
      });
    }

    // 如果更新型号，检查是否与其他扫描仪重名
    if (model && model !== existingScanners[0].model) {
      const duplicateScanners = query('SELECT * FROM scanners WHERE model = ? AND id != ?', [model, id]);
      if (duplicateScanners.length > 0) {
        return res.status(400).json({
          success: false,
          message: '扫描仪型号已存在'
        });
      }
    }

    const result = update(
      'UPDATE scanners SET name = ?, model = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, model, type, id]
    );

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: '更新失败，未修改任何数据'
      });
    }

    // 获取更新后的扫描仪信息
    const updatedScanner = query('SELECT * FROM scanners WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '扫描仪信息更新成功',
      data: updatedScanner[0]
    });
  } catch (error) {
    console.error('更新扫描仪信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新扫描仪信息失败',
      error: error.message
    });
  }
};

/**
 * 删除扫描仪
 */
const deleteScanner = (req, res) => {
  try {
    const { id } = req.params;

    // 验证扫描仪是否存在
    const scanners = query('SELECT * FROM scanners WHERE id = ?', [id]);
    if (scanners.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该扫描仪'
      });
    }

    // 删除扫描仪
    const result = deleteRecord('DELETE FROM scanners WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: '删除失败'
      });
    }

    res.json({
      success: true,
      message: '扫描仪删除成功'
    });
  } catch (error) {
    console.error('删除扫描仪失败:', error);
    res.status(500).json({
      success: false,
      message: '删除扫描仪失败',
      error: error.message
    });
  }
};

module.exports = {
  getAllScanners,
  getScannerById,
  createScanner,
  updateScanner,
  deleteScanner
};
