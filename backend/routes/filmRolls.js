const express = require('express');
const router = express.Router();
const { query, insert } = require('../models/db');

// 获取所有胶卷实例，包含胶卷品类信息和照片信息
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        fr.id,
        fr.roll_number,
        fr.film_stock_id,
        fr.is_private,
        fr.name,
        fr.status,
        fr.opened_date,
        fr.finished_date,
        fr.location,
        fr.camera_name,
        fr.notes,
        fr.created_at,
        fr.updated_at,
        -- 胶卷品类信息
        fs.brand as film_roll_brand,
        fs.series as film_roll_name,
        fs.iso as film_roll_iso,
        fs.type as film_roll_type,
        fs.format as film_roll_format,
        fs.description as film_roll_description,
        -- 照片统计
        COUNT(p.id) as photo_count
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      LEFT JOIN photos p ON fr.id = p.film_roll_id
      GROUP BY fr.id
      ORDER BY fr.opened_date DESC, fr.created_at DESC
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

// 更新胶卷实例（支持用 id 或 roll_number 定位）
router.put('/:id', async (req, res) => {
  try {
    const param = req.params.id;
    const body = req.body || {};

    // 先按 id 查找
    let row = await query('SELECT * FROM film_rolls WHERE id = ?', [param]);
    if (row.length === 0) {
      // 再按 roll_number 查找
      row = await query('SELECT * FROM film_rolls WHERE roll_number = ?', [param]);
      if (row.length === 0) {
        return res.status(404).json({ success: false, message: '胶卷不存在' });
      }
    }
    const id = row[0].id;

    // 允许更新的字段
    const allowed = ['film_stock_id','roll_number','name','opened_date','location','camera_name','notes','status','is_private'];
    const sets = [];
    const params = [];
    for (const [k, v] of Object.entries(body)) {
      if (allowed.includes(k)) {
        if (k === 'is_private') {
          sets.push('is_private = ?');
          params.push(v ? 1 : 0);
        } else {
          sets.push(`${k} = ?`);
          params.push(v ?? null);
        }
      }
    }

    if (sets.length === 0) {
      return res.status(400).json({ success: false, message: '没有可更新的字段' });
    }

    sets.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE film_rolls SET ${sets.join(', ')} WHERE id = ?`;
    params.push(id);

    const result = await insert(sql, params);
    if (result.changes === 0) {
      return res.status(500).json({ success: false, message: '更新失败' });
    }

    const updated = await query('SELECT * FROM film_rolls WHERE id = ?', [id]);
    return res.json({ success: true, data: updated[0], message: '更新成功' });
  } catch (error) {
    console.error('更新胶卷失败:', error);
    return res.status(500).json({ success: false, message: '更新胶卷失败', error: error.message });
  }
});

// 获取单个胶卷详情，包含照片列表
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取胶卷基本信息
    const rollResult = await query(`
      SELECT 
        fr.*,
        fr.is_private,
        fs.brand as film_roll_brand,
        fs.series as film_roll_name,
        fs.iso as film_roll_iso,
        fs.type as film_roll_type,
        fs.format as film_roll_format,
        fs.description as film_roll_description
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      WHERE fr.id = ?
    `, [id]);
    
    if (rollResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷不存在'
      });
    }
    
    // 获取胶卷的照片
    const photosResult = await query(`
      SELECT 
        p.id,
        p.photo_number,
        p.filename,
        p.original_name,
        p.title,
        p.description,
        p.taken_date,
        p.rating,
        p.latitude,
        p.longitude,
        p.location_name,
        p.uploaded_at,
        -- 构建文件路径
        CASE 
          WHEN p.filename LIKE '%.jpg' OR p.filename LIKE '%.jpeg' OR p.filename LIKE '%.png' THEN
            '/uploads/Film_roll/' || fr.roll_number || '/photos/' || p.filename
          ELSE NULL
        END as original,
        CASE 
          WHEN p.filename LIKE '%.jpg' OR p.filename LIKE '%.jpeg' OR p.filename LIKE '%.png' THEN
            '/uploads/Film_roll/' || fr.roll_number || '/thumbnails/' || REPLACE(p.filename, '.jpg', '_thumb.jpg')
          ELSE NULL
        END as thumbnail
      FROM photos p
      JOIN film_rolls fr ON p.film_roll_id = fr.id
      WHERE p.film_roll_id = ?
      ORDER BY p.photo_number ASC, p.uploaded_at ASC
    `, [id]);
    
    const filmRoll = rollResult[0];
    filmRoll.photos = photosResult;
    
    res.json({
      success: true,
      data: filmRoll,
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

// 创建新胶卷实例
router.post('/', async (req, res) => {
  try {
    const {
      roll_number,
      film_stock_id,
      is_private = 0,
      status = 'unopened',
      name,
      opened_date,
      location,
      camera_name,
      notes
    } = req.body;
    
    if (!roll_number || !film_stock_id || !name) {
      return res.status(400).json({
        success: false,
        message: '胶卷编号、名称和胶卷品类ID是必填项'
      });
    }
    
    const result = await insert(`
      INSERT INTO film_rolls (
        roll_number, film_stock_id, name, is_private, status, opened_date, 
        location, camera_name, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [roll_number, film_stock_id, name, is_private ? 1 : 0, status, opened_date, location, camera_name, notes]);
    
    res.status(201).json({
      success: true,
      data: { id: result.lastID },
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
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, finished_date } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: '状态是必填项'
      });
    }
    
    const validStatuses = ['unopened', 'shooting', 'exposed', 'developed', 'scanned', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }
    
    const result = await query(`
      UPDATE film_rolls 
      SET status = ?, finished_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, finished_date, id]);
    
    if (result.changes === 0) {
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

// 删除胶卷（软删除）
router.delete('/:id', async (req, res) => {
  try {
    const param = req.params.id;
    // 先按 id 更新
    let result = await query(`
      UPDATE film_rolls 
      SET status = 'archived', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [param]);

    if (result.changes === 0) {
      // 再按 roll_number 更新
      result = await query(`
        UPDATE film_rolls 
        SET status = 'archived', updated_at = CURRENT_TIMESTAMP
        WHERE roll_number = ?
      `, [param]);

      if (result.changes === 0) {
        return res.status(404).json({ success: false, message: '胶卷不存在' });
      }
    }

    res.json({ success: true, message: '胶卷已归档' });
  } catch (error) {
    console.error('归档胶卷失败:', error);
    res.status(500).json({ success: false, message: '归档胶卷失败', error: error.message });
  }
});

module.exports = router;
