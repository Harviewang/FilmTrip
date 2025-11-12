const { query, insert, update, delete: deleteRecord, db } = require('../models/db');
const crypto = require('crypto');

/**
 * 获取所有胶卷实例
 */
const getAllFilmRolls = async (req, res) => {
  try {
    console.log('=== 获取所有胶卷实例 ===');
    
    const { page = 1, limit = 20, film_stock_id, status, camera_id } = req.query;
    const offset = (page - 1) * limit;
    
    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (film_stock_id) {
      whereClause += ' AND fr.film_stock_id = ?';
      params.push(film_stock_id);
    }
    
    if (status) {
      whereClause += ' AND fr.status = ?';
      params.push(status);
    }
    
    if (camera_id) {
      whereClause += ' AND fr.camera_id = ?';
      params.push(camera_id);
    }
    
    // 获取总数
    const countResult = query(`
      SELECT COUNT(*) as total 
      FROM film_rolls fr 
      ${whereClause}
    `, params);
    const total = countResult[0].total;
    
    // 获取分页数据，包含关联信息
    const filmRolls = query(`
      SELECT 
        fr.*,
        fs.brand, fs.series, fs.iso, fs.format, fs.type as film_type,
        c.name as camera_name, c.model as camera_model,
        s.name as scanner_name, s.model as scanner_model
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      LEFT JOIN cameras c ON fr.camera_id = c.id
      LEFT JOIN scanners s ON fr.scanner_id = s.id
      ${whereClause}
      ORDER BY fr.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    console.log('查询结果:', { total, count: filmRolls.length, page, limit });
    
    res.json({
      success: true,
      filmRolls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取胶卷实例失败:', error);
    res.status(500).json({
      success: false,
      message: '获取胶卷实例失败',
      error: error.message
    });
  }
};

/**
 * 根据ID获取胶卷实例
 */
const getFilmRollById = async (req, res) => {
  try {
    console.log('=== 获取胶卷实例详情 ===');
    const { id } = req.params;
    
    const filmRoll = query(`
      SELECT 
        fr.*,
        fs.brand, fs.series, fs.iso, fs.format, fs.type as film_type,
        c.name as camera_name, c.model as camera_model,
        s.name as scanner_name, s.model as scanner_model
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      LEFT JOIN cameras c ON fr.camera_id = c.id
      LEFT JOIN scanners s ON fr.scanner_id = s.id
      WHERE fr.id = ?
    `, [id]);
    
    if (filmRoll.length === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷实例不存在'
      });
    }
    
    // 获取该胶卷实例下的照片数量
    const photoCount = query('SELECT COUNT(*) as count FROM photos WHERE film_roll_id = ?', [id]);
    
    const result = {
      ...filmRoll[0],
      photoCount: photoCount[0].count
    };
    
    console.log('胶卷实例详情:', result);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取胶卷实例详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取胶卷实例详情失败',
      error: error.message
    });
  }
};

/**
 * 创建胶卷实例
 */
const createFilmRoll = async (req, res) => {
  try {
    console.log('=== 创建胶卷实例 ===');
    console.log('请求体:', req.body);
    
    const {
      film_stock_id,
      name,
      opened_date,
      location,
      camera_id,
      notes
    } = req.body;
    
    // 验证必填字段
    if (!film_stock_id) {
      return res.status(400).json({
        success: false,
        message: '胶卷品类为必填字段'
      });
    }
    
    // 检查胶卷品类是否存在
    const filmStock = query('SELECT * FROM film_stocks WHERE id = ?', [film_stock_id]);
    if (filmStock.length === 0) {
      return res.status(400).json({
        success: false,
        message: '胶卷品类不存在'
      });
    }
    
    // 生成自动编号
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // 获取今日最后一个编号
    const lastRoll = query(
      'SELECT roll_number FROM film_rolls WHERE roll_number LIKE ? ORDER BY roll_number DESC LIMIT 1',
      [`${today}-%`]
    );
    
    let nextNumber = 1;
    if (lastRoll.length > 0) {
      // 提取最后一个编号的序号部分
      const lastNumberStr = lastRoll[0].roll_number.split('-')[1];
      nextNumber = parseInt(lastNumberStr) + 1;
    }
    
    // 格式化编号为 YYYYMMDD-XXX 格式
    const roll_number = `${today}-${nextNumber.toString().padStart(3, '0')}`;
    const displayName = typeof name === 'string' && name.trim() ? name.trim() : roll_number;
    
    // 检查生成的编号是否唯一（理论上不会重复，但为了安全）
    const existingRoll = query('SELECT id FROM film_rolls WHERE roll_number = ?', [roll_number]);
    if (existingRoll.length > 0) {
      return res.status(500).json({
        success: false,
        message: '胶卷编号生成失败，请重试'
      });
    }
    
    // 如果指定了相机，检查相机是否存在
    if (camera_id) {
      const camera = query('SELECT * FROM cameras WHERE id = ?', [camera_id]);
      if (camera.length === 0) {
        return res.status(400).json({
          success: false,
          message: '指定的相机不存在'
        });
      }
    }
    
    // 生成唯一ID
    const id = crypto.randomUUID();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // 插入数据
    console.log('准备插入数据:', {
      id, film_stock_id, roll_number, name: displayName, opened_date: opened_date || null, 
      location: location || null, camera_id: camera_id || null, 
      status: '未启封', notes: notes || '', created_at: now, updated_at: now
    });
    
    const result = insert(`
      INSERT INTO film_rolls (
        id, film_stock_id, roll_number, name, opened_date, location, 
        camera_id, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, film_stock_id, roll_number, displayName, opened_date || null, location || null,
      camera_id || null, '未启封', notes || '', now, now
    ]);
    
    console.log('插入结果:', result);
    
    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '胶卷实例创建失败'
      });
    }
    
    // 获取新创建的胶卷实例
    const newFilmRoll = query(`
      SELECT 
        fr.*,
        fs.brand, fs.series, fs.iso, fs.format, fs.type as film_type
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      WHERE fr.id = ?
    `, [id]);
    
    console.log('胶卷实例创建成功:', { id, result, newFilmRoll: newFilmRoll[0] });
    
    res.status(201).json({
      success: true,
      message: '胶卷实例创建成功',
      data: newFilmRoll[0]
    });
  } catch (error) {
    console.error('创建胶卷实例失败:', error);
    res.status(500).json({
      success: false,
      message: '创建胶卷实例失败',
      error: error.message
    });
  }
};

/**
 * 更新胶卷实例
 */
const updateFilmRoll = async (req, res) => {
  try {
    console.log('=== 更新胶卷实例 ===');
    const { id } = req.params;
    console.log('更新ID:', id);
    console.log('请求体:', req.body);
    
    const {
      film_stock_id,
      roll_number,
      name,
      opened_date,
      location,
      camera_id,
      developed_date,
      developer,
      development_method,
      scanner_id,
      status,
      is_private,
      notes
    } = req.body;
    
    // 检查胶卷实例是否存在
    const existingRoll = query('SELECT * FROM film_rolls WHERE id = ?', [id]);
    if (existingRoll.length === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷实例不存在'
      });
    }
    
    // 验证必填字段
    if (!film_stock_id || !roll_number) {
      return res.status(400).json({
        success: false,
        message: '胶卷品类、编号为必填字段'
      });
    }
    
    // 检查胶卷品类是否存在
    const filmStock = query('SELECT * FROM film_stocks WHERE id = ?', [film_stock_id]);
    if (filmStock.length === 0) {
      return res.status(400).json({
        success: false,
        message: '胶卷品类不存在'
      });
    }
    
    // 检查胶卷编号是否与其他实例冲突（排除自己）
    const conflictingRoll = query('SELECT id FROM film_rolls WHERE roll_number = ? AND id != ?', [roll_number, id]);
    if (conflictingRoll.length > 0) {
      return res.status(400).json({
        success: false,
        message: '胶卷编号与其他实例冲突'
      });
    }
    
    // 如果指定了相机，检查相机是否存在
    if (camera_id) {
      const camera = query('SELECT * FROM cameras WHERE id = ?', [camera_id]);
      if (camera.length === 0) {
        return res.status(400).json({
          success: false,
          message: '指定的相机不存在'
        });
      }
    }
    
    // 如果指定了扫描仪，检查扫描仪是否存在
    if (scanner_id) {
      const scanner = query('SELECT * FROM scanners WHERE id = ?', [scanner_id]);
      if (scanner.length === 0) {
        return res.status(400).json({
          success: false,
          message: '指定的扫描仪不存在'
        });
      }
    }
    
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const safeNameSource = typeof name === 'string' ? name.trim() : '';
    const resolvedName = safeNameSource || existingRoll[0].roll_number;
    
    // 更新数据
    const result = insert(`
      UPDATE film_rolls SET 
        film_stock_id = ?, roll_number = ?, name = ?, opened_date = ?, location = ?,
        camera_id = ?, developed_date = ?, developer = ?, development_method = ?,
        scanner_id = ?, status = ?, is_private = COALESCE(?, is_private), notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      film_stock_id, roll_number, resolvedName, opened_date || null, location || null,
      camera_id || null, developed_date || null, developer || null, development_method || null,
      scanner_id || null, status || '未启封', (is_private === undefined ? null : (is_private ? 1 : 0)), notes || '', now, id
    ]);
    
    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '胶卷实例更新失败'
      });
    }
    
    // 获取更新后的胶卷实例
    const updatedRoll = query(`
      SELECT 
        fr.*,
        fs.brand, fs.series, fs.iso, fs.format, fs.type as film_type
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      WHERE fr.id = ?
    `, [id]);
    
    console.log('胶卷实例更新成功:', { id, result, updatedRoll: updatedRoll[0] });
    
    res.json({
      success: true,
      message: '胶卷实例更新成功',
      data: updatedRoll[0]
    });
  } catch (error) {
    console.error('更新胶卷实例失败:', error);
    res.status(500).json({
      success: false,
      message: '更新胶卷实例失败',
      error: error.message
    });
  }
};

/**
 * 删除胶卷实例
 */
const deleteFilmRoll = async (req, res) => {
  try {
    console.log('=== 删除胶卷实例 ===');
    const { id } = req.params;
    console.log('删除ID:', id);
    
    // 检查胶卷实例是否存在
    const existingRoll = query('SELECT * FROM film_rolls WHERE id = ?', [id]);
    if (existingRoll.length === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷实例不存在'
      });
    }
    
    // 检查是否有照片关联到该胶卷实例
    const photoCount = query('SELECT COUNT(*) as count FROM photos WHERE film_roll_id = ?', [id]);
    if (photoCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: '该胶卷实例下还有照片，无法删除'
      });
    }
    
    // 删除胶卷实例
    const result = insert('DELETE FROM film_rolls WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '胶卷实例删除失败'
      });
    }
    
    console.log('胶卷实例删除成功:', { id, result });
    
    res.json({
      success: true,
      message: '胶卷实例删除成功'
    });
  } catch (error) {
    console.error('删除胶卷实例失败:', error);
    res.status(500).json({
      success: false,
      message: '删除胶卷实例失败',
      error: error.message
    });
  }
};

/**
 * 更新胶卷实例状态
 */
const updateFilmRollStatus = async (req, res) => {
  try {
    console.log('=== 更新胶卷实例状态 ===');
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('更新状态:', { id, status });
    
    // 验证状态值
    const validStatuses = ['unopened', 'shooting', 'exposed', 'developed', 'scanned', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }
    
    // 检查胶卷实例是否存在
    const existingRoll = query('SELECT * FROM film_rolls WHERE id = ?', [id]);
    if (existingRoll.length === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷实例不存在'
      });
    }
    
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // 更新状态
    const result = db.prepare('UPDATE film_rolls SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);
    
    console.log('状态更新结果:', result);
    
    res.json({
      success: true,
      message: '状态更新成功',
      data: { id, status }
    });
  } catch (error) {
    console.error('更新状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新状态失败',
      error: error.message
    });
  }
};

/**
 * 获取胶卷实例统计信息
 */
const getFilmRollStats = async (req, res) => {
  try {
    console.log('=== 获取胶卷实例统计 ===');
    
    // 按状态统计
    const statusStats = query(`
      SELECT status, COUNT(*) as count 
      FROM film_rolls 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    // 按胶卷品类统计
    const stockStats = query(`
      SELECT fs.brand, fs.series, COUNT(*) as count 
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      GROUP BY fr.film_stock_id
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // 按相机统计
    const cameraStats = query(`
      SELECT c.name, c.model, COUNT(*) as count 
      FROM film_rolls fr
      LEFT JOIN cameras c ON fr.camera_id = c.id
      WHERE fr.camera_id IS NOT NULL
      GROUP BY fr.camera_id
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // 按时间统计（最近30天）
    const timeStats = query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM film_rolls 
      WHERE created_at >= date('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    const stats = {
      statusStats,
      stockStats,
      cameraStats,
      timeStats,
      total: statusStats.reduce((sum, item) => sum + item.count, 0)
    };
    
    console.log('统计信息:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取胶卷实例统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取胶卷实例统计失败',
      error: error.message
    });
  }
};

module.exports = {
  getAllFilmRolls,
  getFilmRollById,
  createFilmRoll,
  updateFilmRoll,
  deleteFilmRoll,
  updateFilmRollStatus,
  getFilmRollStats
};
