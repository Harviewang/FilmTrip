const { query, insert, update, delete: deleteRecord } = require('../models/db');
const crypto = require('crypto');

/**
 * 获取所有胶卷品类
 */
const getAllFilmStocks = (req, res) => {
  try {
    console.log('=== 获取所有胶卷品类 ===');
    
    const { page = 1, limit = 20, brand, series, iso, format, type } = req.query;
    const offset = (page - 1) * limit;
    
    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (brand) {
      whereClause += ' AND brand LIKE ?';
      params.push(`%${brand}%`);
    }
    
    if (series) {
      whereClause += ' AND series LIKE ?';
      params.push(`%${series}%`);
    }
    
    if (iso) {
      whereClause += ' AND iso = ?';
      params.push(parseInt(iso));
    }
    
    if (format) {
      whereClause += ' AND format = ?';
      params.push(format);
    }
    
    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }
    
    // 获取总数
    const countResult = query(`SELECT COUNT(*) as total FROM film_stocks ${whereClause}`, params);
    const total = countResult[0].total;
    
    // 获取分页数据
    const filmStocks = query(
      `SELECT 
        id,
        stock_serial_number,
        brand,
        series,
        iso,
        format,
        type,
        description,
        package_image as image_url,
        cartridge_image,
        created_at,
        updated_at
      FROM film_stocks ${whereClause} 
      ORDER BY brand, series, iso 
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    console.log('查询结果:', { total, count: filmStocks.length, page, limit });
    
    res.json({
      success: true,
      data: filmStocks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取胶卷品类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取胶卷品类失败',
      error: error.message
    });
  }
};

/**
 * 根据ID获取胶卷品类
 */
const getFilmStockById = (req, res) => {
  try {
    console.log('=== 获取胶卷品类详情 ===');
    const { id } = req.params;
    
    const filmStock = query('SELECT * FROM film_stocks WHERE id = ?', [id]);
    
    if (filmStock.length === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷品类不存在'
      });
    }
    
    console.log('胶卷品类详情:', filmStock[0]);
    
    res.json({
      success: true,
      data: filmStock[0]
    });
  } catch (error) {
    console.error('获取胶卷品类详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取胶卷品类详情失败',
      error: error.message
    });
  }
};

/**
 * 创建胶卷品类
 */
const createFilmStock = (req, res) => {
  try {
    console.log('=== 创建胶卷品类 ===');
    console.log('请求体:', req.body);
    console.log('上传的文件:', req.files);
    
    const { brand, series, iso, format, type, description } = req.body;
    
    // 处理文件上传
    let packageImagePath = null;
    let cartridgeImagePath = null;
    
    if (req.files) {
      if (req.files.package_image && req.files.package_image[0]) {
        packageImagePath = `/uploads/filmStocks/${req.files.package_image[0].filename}`;
      }
      if (req.files.cartridge_image && req.files.cartridge_image[0]) {
        cartridgeImagePath = `/uploads/filmStocks/${req.files.cartridge_image[0].filename}`;
      }
    }
    
    // 验证必填字段
    if (!brand || !series || !iso || !format || !type) {
      return res.status(400).json({
        success: false,
        message: '品牌、系列、ISO、规格、类型为必填字段'
      });
    }
    
    // 验证ISO值
    if (isNaN(iso) || parseInt(iso) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ISO必须是正整数'
      });
    }
    
    // 检查是否已存在相同的胶卷品类
    const existingStock = query(
      'SELECT id FROM film_stocks WHERE brand = ? AND series = ? AND iso = ? AND format = ? AND type = ?',
      [brand, series, parseInt(iso), format, type]
    );
    
    if (existingStock.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该胶卷品类已存在'
      });
    }
    
    // 生成唯一ID
    const id = crypto.randomUUID();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // 生成胶卷品类流水号
    const stockSerialNumber = `${brand.toUpperCase()}-${series.toUpperCase()}-${iso}-${format.toUpperCase()}`;
    
    // 检查流水号是否已存在
    const existingStockBySerial = query('SELECT id FROM film_stocks WHERE stock_serial_number = ?', [stockSerialNumber]);
    if (existingStockBySerial.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该胶卷品类已存在'
      });
    }
    
    // 插入数据
    const result = insert(
      `INSERT INTO film_stocks (id, stock_serial_number, brand, series, iso, format, type, description, package_image, cartridge_image, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, stockSerialNumber, brand, series, parseInt(iso), format, type, description || '', packageImagePath, cartridgeImagePath, now, now]
    );
    
    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '胶卷品类创建失败'
      });
    }
    
    // 获取新创建的胶卷品类
    const newFilmStock = query('SELECT * FROM film_stocks WHERE id = ?', [id]);
    
    console.log('胶卷品类创建成功:', { id, result, newFilmStock: newFilmStock[0] });
    
    res.status(201).json({
      success: true,
      message: '胶卷品类创建成功',
      data: newFilmStock[0]
    });
  } catch (error) {
    console.error('创建胶卷品类失败:', error);
    res.status(500).json({
      success: false,
      message: '创建胶卷品类失败',
      error: error.message
    });
  }
};

/**
 * 更新胶卷品类
 */
const updateFilmStock = (req, res) => {
  try {
    console.log('=== 更新胶卷品类 ===');
    const { id } = req.params;
    console.log('更新ID:', id);
    console.log('请求体:', req.body);
    console.log('上传的文件:', req.files);
    
    const { brand, series, iso, format, type, description } = req.body;
    
    // 处理文件上传
    let packageImagePath = null;
    let cartridgeImagePath = null;
    
    if (req.files) {
      if (req.files.package_image && req.files.package_image[0]) {
        packageImagePath = `/uploads/filmStocks/${req.files.package_image[0].filename}`;
      }
      if (req.files.cartridge_image && req.files.cartridge_image[0]) {
        cartridgeImagePath = `/uploads/filmStocks/${req.files.cartridge_image[0].filename}`;
      }
    }
    
    // 如果没有新上传的图片，保留原有图片
    if (!packageImagePath) {
      const existingStock = query('SELECT package_image FROM film_stocks WHERE id = ?', [id]);
      if (existingStock.length > 0) {
        packageImagePath = existingStock[0].package_image;
      }
    }
    if (!cartridgeImagePath) {
      const existingStock = query('SELECT cartridge_image FROM film_stocks WHERE id = ?', [id]);
      if (existingStock.length > 0) {
        cartridgeImagePath = existingStock[0].cartridge_image;
      }
    }
    
    // 生成新的胶卷品类流水号
    const stockSerialNumber = `${brand.toUpperCase()}-${series.toUpperCase()}-${iso}-${format.toUpperCase()}`;
    
    // 检查新流水号是否与其他品类冲突（排除自己）
    const conflictingStockBySerial = query(
      'SELECT id FROM film_stocks WHERE stock_serial_number = ? AND id != ?',
      [stockSerialNumber, id]
    );
    if (conflictingStockBySerial.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该胶卷品类流水号已存在'
      });
    }
    
    // 检查胶卷品类是否存在
    const existingStock = query('SELECT * FROM film_stocks WHERE id = ?', [id]);
    if (existingStock.length === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷品类不存在'
      });
    }
    
    // 验证必填字段
    if (!brand || !series || !iso || !format || !type) {
      return res.status(400).json({
        success: false,
        message: '品牌、系列、ISO、规格、类型为必填字段'
      });
    }
    
    // 验证ISO值
    if (isNaN(iso) || parseInt(iso) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ISO必须是正整数'
      });
    }
    
    // 检查是否与其他胶卷品类冲突（排除自己）
    const conflictingStock = query(
      'SELECT id FROM film_stocks WHERE brand = ? AND series = ? AND iso = ? AND format = ? AND type = ? AND id != ?',
      [brand, series, parseInt(iso), format, type, id]
    );
    
    if (conflictingStock.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该胶卷品类配置与其他品类冲突'
      });
    }
    
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // 更新数据
    const result = insert(
      `UPDATE film_stocks SET stock_serial_number = ?, brand = ?, series = ?, iso = ?, format = ?, type = ?, description = ?, package_image = ?, cartridge_image = ?, updated_at = ? 
       WHERE id = ?`,
      [stockSerialNumber, brand, series, parseInt(iso), format, type, description || '', packageImagePath, cartridgeImagePath, now, id]
    );
    
    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '胶卷品类更新失败'
      });
    }
    
    // 获取更新后的胶卷品类
    const updatedStock = query('SELECT * FROM film_stocks WHERE id = ?', [id]);
    
    console.log('胶卷品类更新成功:', { id, result, updatedStock: updatedStock[0] });
    
    res.json({
      success: true,
      message: '胶卷品类更新成功',
      data: updatedStock[0]
    });
  } catch (error) {
    console.error('更新胶卷品类失败:', error);
    res.status(500).json({
      success: false,
      message: '更新胶卷品类失败',
      error: error.message
    });
  }
};

/**
 * 删除胶卷品类
 */
const deleteFilmStock = (req, res) => {
  try {
    console.log('=== 删除胶卷品类 ===');
    const { id } = req.params;
    console.log('删除ID:', id);
    
    // 检查胶卷品类是否存在
    const existingStock = query('SELECT * FROM film_stocks WHERE id = ?', [id]);
    if (existingStock.length === 0) {
      return res.status(404).json({
        success: false,
        message: '胶卷品类不存在'
      });
    }
    
    // 检查是否有胶卷实例在使用该品类
    const usedInstances = query('SELECT COUNT(*) as count FROM film_rolls WHERE film_stock_id = ?', [id]);
    if (usedInstances[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: '该胶卷品类正在被使用，无法删除'
      });
    }
    
    // 删除胶卷品类
    const result = insert('DELETE FROM film_stocks WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '胶卷品类删除失败'
      });
    }
    
    console.log('胶卷品类删除成功:', { id, result });
    
    res.json({
      success: true,
      message: '胶卷品类删除成功'
    });
  } catch (error) {
    console.error('删除胶卷品类失败:', error);
    res.status(500).json({
      success: false,
      message: '删除胶卷品类失败',
      error: error.message
    });
  }
};

/**
 * 获取胶卷品类统计信息
 */
const getFilmStockStats = (req, res) => {
  try {
    console.log('=== 获取胶卷品类统计 ===');
    
    // 按品牌统计
    const brandStats = query(`
      SELECT brand, COUNT(*) as count 
      FROM film_stocks 
      GROUP BY brand 
      ORDER BY count DESC
    `);
    
    // 按ISO统计
    const isoStats = query(`
      SELECT iso, COUNT(*) as count 
      FROM film_stocks 
      GROUP BY iso 
      ORDER BY iso
    `);
    
    // 按规格统计
    const formatStats = query(`
      SELECT format, COUNT(*) as count 
      FROM film_stocks 
      GROUP BY format 
      ORDER BY count DESC
    `);
    
    // 按类型统计
    const typeStats = query(`
      SELECT type, COUNT(*) as count 
      FROM film_stocks 
      GROUP BY type 
      ORDER BY count DESC
    `);
    
    const stats = {
      brandStats,
      isoStats,
      formatStats,
      typeStats,
      total: brandStats.reduce((sum, item) => sum + item.count, 0)
    };
    
    console.log('统计信息:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取胶卷品类统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取胶卷品类统计失败',
      error: error.message
    });
  }
};

module.exports = {
  getAllFilmStocks,
  getFilmStockById,
  createFilmStock,
  updateFilmStock,
  deleteFilmStock,
  getFilmStockStats
};
