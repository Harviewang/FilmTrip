const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { query, insert, update } = require('../models/db');
const { resolveIsAdmin, sanitizePhotoForViewer } = require('../utils/photoVisibility');

// 获取随机胶卷实例（用于随机浏览功能）
router.get('/random', (req, res) => {
  try {
    const result = query(`
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
        fs.package_image as package_image,
        fs.cartridge_image as canister_image,
        -- 照片统计
        COUNT(p.id) as photo_count
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      LEFT JOIN photos p ON fr.id = p.film_roll_id AND p.is_protected = 0
      WHERE fr.status = '已完成' AND fr.is_private = 0
      GROUP BY fr.id
      HAVING photo_count > 0
      ORDER BY RANDOM()
      LIMIT 1
    `);
    
    if (result.length > 0) {
      res.json({
        success: true,
        data: result[0]
      });
    } else {
      res.json({
        success: false,
        message: '没有可用的胶卷实例'
      });
    }
  } catch (error) {
    console.error('获取随机胶卷失败:', error);
    res.status(500).json({
      success: false,
      message: '获取随机胶卷失败',
      error: error.message
    });
  }
});

// 获取所有胶卷实例，包含胶卷品类信息和照片信息
router.get('/', (req, res) => {
  try {
    const result = query(`
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
        fr.camera_id,
        fr.camera_name,
        fr.notes,
        fr.created_at,
        fr.updated_at,
        -- 相机信息
        c.name as camera_name,
        c.model as camera_model,
        -- 胶卷品类信息
        fs.brand as film_roll_brand,
        fs.series as film_roll_name,
        fs.iso as film_roll_iso,
        fs.type as film_roll_type,
        fs.format as film_roll_format,
        fs.description as film_roll_description,
        fs.package_image as package_image,
        fs.cartridge_image as canister_image,
        -- 照片统计
        COUNT(p.id) as photo_count
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      LEFT JOIN cameras c ON fr.camera_id = c.id
      LEFT JOIN photos p ON fr.id = p.film_roll_id
      GROUP BY COALESCE(fr.id, fr.roll_number)
      ORDER BY fr.opened_date DESC, fr.created_at DESC
    `);
    
    res.json({
      success: true,
      filmRolls: result,
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
router.put('/:id', (req, res) => {
  try {
    console.log('=== 更新胶卷实例 ===');
    const param = req.params.id;
    const body = req.body || {};
    console.log('URL参数:', param);
    console.log('请求体:', body);

    // 先按 id 查找
    let row = query('SELECT * FROM film_rolls WHERE id = ?', [param]);
    console.log('按ID查找结果:', row.length > 0 ? '找到' : '未找到');
    
    if (row.length === 0) {
      // 再按 roll_number 查找
      row = query('SELECT * FROM film_rolls WHERE roll_number = ?', [param]);
      console.log('按roll_number查找结果:', row.length > 0 ? '找到' : '未找到');
      
      if (row.length === 0) {
        console.error('胶卷不存在:', { param, id: param, roll_number: param });
        return res.status(404).json({ success: false, message: '胶卷不存在' });
      }
    }
    
    let id = row[0].id;
    console.log('找到的记录ID:', id);
    console.log('找到的记录roll_number:', row[0].roll_number);
    
    // 如果ID为null，先为该记录生成一个UUID
    if (!id) {
      id = crypto.randomUUID();
      console.log('为缺少ID的胶卷实例生成新ID:', { roll_number: row[0].roll_number, new_id: id });
      const updateIdResult = update('UPDATE film_rolls SET id = ? WHERE roll_number = ?', [id, row[0].roll_number]);
      if (updateIdResult.changes === 0) {
        console.error('无法为记录生成ID:', { roll_number: row[0].roll_number });
        return res.status(500).json({ success: false, message: '无法为记录生成ID' });
      }
      console.log('ID生成成功');
    }

    // 允许更新的字段（roll_number 自动生成）
    const allowed = ['name','film_stock_id','opened_date','location','camera_id','camera_name','notes','status','is_private','is_protected','protection_level'];
    const sets = [];
    const params = [];
    
    for (const [k, v] of Object.entries(body)) {
      if (allowed.includes(k)) {
        if (k === 'name') {
          const nextNameRaw = typeof v === 'string' ? v.trim() : '';
          const safeName = nextNameRaw || row[0].roll_number;
          sets.push('name = ?');
          params.push(safeName);
        } else if (k === 'is_private' || k === 'is_protected') {
          sets.push(`${k} = ?`);
          const boolValue = typeof v === 'boolean' ? (v ? 1 : 0) : (v === 'true' || v === 1 || v === '1' ? 1 : 0);
          params.push(boolValue);
        } else {
          sets.push(`${k} = ?`);
          params.push(v ?? null);
        }
      }
    }

    if (sets.length === 0) {
      console.warn('没有可更新的字段');
      return res.status(400).json({ success: false, message: '没有可更新的字段' });
    }

    sets.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE film_rolls SET ${sets.join(', ')} WHERE id = ?`;
    params.push(id);

    console.log('执行更新SQL:', sql);
    console.log('更新参数:', params);

    const result = update(sql, params);
    console.log('更新结果:', { changes: result.changes, lastID: result.lastID });

    if (result.changes === 0) {
      console.error('更新失败: 没有行被更新', { id, sql, params });
      return res.status(500).json({ success: false, message: '更新失败：没有行被更新' });
    }

    const updated = query('SELECT * FROM film_rolls WHERE id = ?', [id]);
    console.log('更新后的记录:', updated[0]);
    
    return res.json({ success: true, data: updated[0], message: '更新成功' });
  } catch (error) {
    console.error('更新胶卷失败:', error);
    console.error('错误堆栈:', error.stack);
    return res.status(500).json({ success: false, message: '更新胶卷失败', error: error.message });
  }
});

// 获取单个胶卷详情，包含照片列表
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取胶卷基本信息
    const rollResult = query(`
      SELECT 
        fr.*,
        fr.is_private,
        fs.brand as film_roll_brand,
        fs.series as film_roll_name,
        fs.iso as film_roll_iso,
        fs.type as film_roll_type,
        fs.format as film_roll_format,
        fs.description as film_roll_description,
        fs.package_image as package_image,
        fs.cartridge_image as canister_image
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
    
    const isAdminUser = resolveIsAdmin(req);

    // 获取胶卷的照片
    const photosResult = query(`
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
        p.width,
        p.height,
        p.orientation,
        p.short_code,
        p.is_protected,
        p.protection_level,
        fr.is_protected AS roll_is_protected,
        fr.protection_level AS roll_protection_level
      FROM photos p
      JOIN film_rolls fr ON p.film_roll_id = fr.id
      WHERE p.film_roll_id = ?
      ORDER BY p.photo_number ASC, p.uploaded_at ASC
    `, [id]);
    
    const filmRoll = rollResult[0];
    filmRoll.photos = photosResult.map((photo) => sanitizePhotoForViewer(photo, { isAdmin: isAdminUser }));
    
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
router.post('/', (req, res) => {
  try {
    console.log('=== 创建胶卷实例 ===');
    console.log('请求体:', req.body);
    
    const {
      film_stock_id,
      is_private = 0,
      status = 'unopened',
      opened_date,
      camera_id, // 使用camera_id而不是camera_name
      notes,
      is_protected = false,
      protection_level = ''
    } = req.body;
    
    if (!film_stock_id) {
      return res.status(400).json({
        success: false,
        message: '胶卷品类ID是必填项'
      });
    }
    
    // 检查胶卷品类是否存在，并获取品类编号
    const filmStock = query('SELECT * FROM film_stocks WHERE id = ?', [film_stock_id]);
    if (filmStock.length === 0) {
      return res.status(400).json({
        success: false,
        message: '胶卷品类不存在'
      });
    }
    
    const stockSerialNumber = filmStock[0].stock_serial_number || 'UNKNOWN';
    
    if (stockSerialNumber === 'UNKNOWN') {
      console.error('警告：胶卷品类编号为UNKNOWN，无法生成实例编号');
      return res.status(400).json({
        success: false,
        message: '胶卷品类编号异常，无法生成实例编号'
      });
    }
    
    // 自动生成胶卷实例编号：品类编号-流水号（品类编号和流水号之间有分隔符）
    // 查找该品类下已有的最大流水号
    const existingRolls = query(`
      SELECT roll_number FROM film_rolls 
      WHERE film_stock_id = ? AND roll_number LIKE ?
      ORDER BY roll_number DESC
      LIMIT 1
    `, [film_stock_id, `${stockSerialNumber}-%`]);
    
    let nextSequence = 1;
    if (existingRolls.length > 0) {
      // 提取最后的流水号，例如 "KODPOR135CN-001" -> 1, "KODPOR135CN-003" -> 3
      const lastRollNumber = existingRolls[0].roll_number;
      // 从编号末尾提取"-"后面的3位数字作为流水号
      const match = lastRollNumber.match(/-(\d{3})$/);
      if (match) {
        const lastSeq = parseInt(match[1]);
        if (!isNaN(lastSeq) && lastSeq >= 0) {
          nextSequence = lastSeq + 1;
        }
      }
      console.log('找到已有实例，流水号递增:', {
        lastRollNumber,
        extractedSequence: match ? match[1] : '未找到',
        nextSequence
      });
    } else {
      console.log('该品类下无已有实例，从001开始');
    }
    
    // 生成完整的编号：品类编号-流水号（品类编号和流水号之间有"-"分隔符）
    // 流水号补零到3位，最大支持999
    if (nextSequence > 999) {
      return res.status(400).json({
        success: false,
        message: '该品类实例数量已达上限（999），无法创建更多实例'
      });
    }
    
    const roll_number = `${stockSerialNumber}-${nextSequence.toString().padStart(3, '0')}`;
    
    console.log('生成的胶卷实例编号:', {
      film_stock_id,
      stockSerialNumber,
      existingRollsCount: existingRolls.length,
      nextSequence,
      roll_number
    });
    
    // 检查生成的编号是否已存在（理论上不应该，但为了确保唯一性）
    let retryCount = 0;
    let finalRollNumber = roll_number;
    while (retryCount < 10) {
      const existingRoll = query('SELECT id FROM film_rolls WHERE roll_number = ?', [finalRollNumber]);
      if (existingRoll.length === 0) {
        // 编号可用，退出循环
        break;
      }
      // 如果编号已存在，尝试下一个序号
      console.warn(`编号 ${finalRollNumber} 已存在，尝试下一个序号`);
      nextSequence++;
      if (nextSequence > 999) {
        return res.status(500).json({
          success: false,
          message: '无法生成唯一编号，请检查数据库'
        });
      }
      finalRollNumber = `${stockSerialNumber}-${nextSequence.toString().padStart(3, '0')}`;
      retryCount++;
    }
    
    if (retryCount > 0) {
      console.log(`编号生成经过 ${retryCount} 次重试，最终编号：${finalRollNumber}`);
    }
    
    // 使用最终确认可用的编号
    const roll_number_final = finalRollNumber;
    
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
    const rawName = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const displayName = rawName || roll_number_final;
    
    // 处理加密设置
    const isProtected = is_protected === true || is_protected === 1 || is_protected === 'true';
    const protectionLevel = isProtected ? (protection_level || null) : null;
    
    console.log('准备插入数据:', {
      id, roll_number, film_stock_id, name: displayName, opened_date: opened_date || null,
      camera_id: camera_id || null, status, is_private: is_private ? 1 : 0,
      is_protected: isProtected ? 1 : 0,
      protection_level: protectionLevel,
      notes: notes || '', created_at: now, updated_at: now
    });
    
    const result = insert(`
      INSERT INTO film_rolls (
        id, roll_number, name, film_stock_id, is_private, status, opened_date, 
        camera_id, is_protected, protection_level, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, roll_number_final, displayName, film_stock_id, is_private ? 1 : 0, status,
      opened_date || null, camera_id || null,
      isProtected ? 1 : 0, protectionLevel,
      notes || '', now, now
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
        fs.brand as film_roll_brand,
        fs.series as film_roll_name,
        fs.iso as film_roll_iso,
        fs.type as film_roll_type,
        fs.format as film_roll_format,
        c.name as camera_name,
        c.model as camera_model
      FROM film_rolls fr
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      LEFT JOIN cameras c ON fr.camera_id = c.id
      WHERE fr.id = ?
    `, [id]);
    
    console.log('胶卷实例创建成功:', { id, result, newFilmRoll: newFilmRoll[0] });
    
    res.status(201).json({
      success: true,
      message: '胶卷实例创建成功',
      data: newFilmRoll[0]
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
router.patch('/:id/status', (req, res) => {
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
    
    const result = update(`
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
router.delete('/:id', (req, res) => {
  try {
    const param = req.params.id;
    // 先按 id 更新
    let result = query(`
      UPDATE film_rolls 
      SET status = 'archived', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [param]);

    if (result.changes === 0) {
      // 再按 roll_number 更新
      result = query(`
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
