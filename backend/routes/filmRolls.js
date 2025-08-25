const express = require('express');
const router = express.Router();
const { query } = require('../models/db');

// 获取所有胶卷
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        fr.id,
        fr.name,
        fr.brand,
        fr.iso,
        fr.type,
        fr.format,
        fr.status,
        fr.exposure_count,
        fr.exposed_count,
        fr.date,
        fr.location,
        fr.description,
        fr.created_at,
        fr.updated_at
      FROM film_rolls fr
      ORDER BY fr.date DESC, fr.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result,
      message: '胶卷数据获取成功'
    });
  } catch (error) {
    console.error('获取胶卷数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取胶卷数据失败',
      error: error.message
    });
  }
});

// 获取单个胶卷详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        fr.*,
        COUNT(p.id) as photo_count
      FROM film_rolls fr
      LEFT JOIN photos p ON fr.id = p.film_roll_id
      WHERE fr.id = ?
      GROUP BY fr.id
    `, [id]);
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷不存在'
      });
    }
    
    res.json({
      success: true,
      data: result[0],
      message: '胶卷详情获取成功'
    });
  } catch (error) {
    console.error('获取胶卷详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取胶卷详情失败',
      error: error.message
    });
  }
});

// 创建新胶卷
router.post('/', async (req, res) => {
  try {
    const {
      name,
      brand,
      iso,
      type,
      format,
      status,
      exposure_count,
      date,
      location,
      description
    } = req.body;
    
    const result = await query(`
      INSERT INTO film_rolls (
        name, brand, iso, type, format, status, 
        exposure_count, exposed_count, date, location, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `, [name, brand, iso, type, format, status, exposure_count, date, location, description]);
    
    res.json({
      success: true,
      data: { id: result.insertId },
      message: '胶卷创建成功'
    });
  } catch (error) {
    console.error('创建胶卷失败:', error);
    res.status(500).json({
      success: false,
      message: '创建胶卷失败',
      error: error.message
    });
  }
});

// 更新胶卷状态
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, exposed_count } = req.body;
    
    const result = await query(`
      UPDATE film_rolls 
      SET status = ?, exposed_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, exposed_count, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷不存在'
      });
    }
    
    res.json({
      success: true,
      message: '胶卷状态更新成功'
    });
  } catch (error) {
    console.error('更新胶卷状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新胶卷状态失败',
      error: error.message
    });
  }
});

// 删除胶卷
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有关联的照片
    const photos = await query('SELECT COUNT(*) as count FROM photos WHERE film_roll_id = ?', [id]);
    
    if (photos[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: '无法删除包含照片的胶卷'
      });
    }
    
    const result = await query('DELETE FROM film_rolls WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷不存在'
      });
    }
    
    res.json({
      success: true,
      message: '胶卷删除成功'
    });
  } catch (error) {
    console.error('删除胶卷失败:', error);
    res.status(500).json({
      success: false,
      message: '删除胶卷失败',
      error: error.message
    });
  }
});

module.exports = router;
