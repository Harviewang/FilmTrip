const { query, insert, update, delete: deleteRecord } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

/**
 * 获取所有相册
 */
const getAllAlbums = (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // 查询总数
    const countResult = query('SELECT COUNT(*) as total FROM albums');
    const total = countResult[0].total;

    // 查询相册列表，包含照片数量
    const albums = query(`
      SELECT 
        a.*,
        COUNT(p.id) as photo_count
      FROM albums a
      LEFT JOIN photos p ON a.id = p.album_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      albums,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取相册列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取相册列表失败',
      error: error.message
    });
  }
};

/**
 * 获取单个相册详情
 */
const getAlbumById = (req, res) => {
  try {
    const { id } = req.params;

    const albums = query('SELECT * FROM albums WHERE id = ?', [id]);

    if (albums.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该相册'
      });
    }

    // 获取相册中的照片
    const photos = query('SELECT * FROM photos WHERE album_id = ? ORDER BY uploaded_at DESC', [id]);

    res.json({
      success: true,
      data: {
        ...albums[0],
        photos
      }
    });
  } catch (error) {
    console.error('获取相册详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取相册详情失败',
      error: error.message
    });
  }
};

/**
 * 创建新相册
 */
const createAlbum = (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '相册名称不能为空'
      });
    }

    // 检查相册名称是否已存在
    const existingAlbums = query('SELECT * FROM albums WHERE name = ?', [name]);
    if (existingAlbums.length > 0) {
      return res.status(400).json({
        success: false,
        message: '相册名称已存在'
      });
    }

    const id = uuidv4();
    const result = insert(
      'INSERT INTO albums (id, name, description) VALUES (?, ?, ?)',
      [id, name, description]
    );

    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '创建相册失败'
      });
    }

    // 获取新创建的相册
    const newAlbum = query('SELECT * FROM albums WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: '相册创建成功',
      data: newAlbum[0]
    });
  } catch (error) {
    console.error('创建相册失败:', error);
    res.status(500).json({
      success: false,
      message: '创建相册失败',
      error: error.message
    });
  }
};

/**
 * 更新相册信息
 */
const updateAlbum = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // 验证相册是否存在
    const existingAlbums = query('SELECT * FROM albums WHERE id = ?', [id]);
    if (existingAlbums.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该相册'
      });
    }

    // 如果更新名称，检查是否与其他相册重名
    if (name && name !== existingAlbums[0].name) {
      const duplicateAlbums = query('SELECT * FROM albums WHERE name = ? AND id != ?', [name, id]);
      if (duplicateAlbums.length > 0) {
        return res.status(400).json({
          success: false,
          message: '相册名称已存在'
        });
      }
    }

    const result = update(
      'UPDATE albums SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, id]
    );

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: '更新失败，未修改任何数据'
      });
    }

    // 获取更新后的相册信息
    const updatedAlbum = query('SELECT * FROM albums WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '相册信息更新成功',
      data: updatedAlbum[0]
    });
  } catch (error) {
    console.error('更新相册信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新相册信息失败',
      error: error.message
    });
  }
};

/**
 * 删除相册
 */
const deleteAlbum = (req, res) => {
  try {
    const { id } = req.params;

    // 验证相册是否存在
    const albums = query('SELECT * FROM albums WHERE id = ?', [id]);
    if (albums.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该相册'
      });
    }

    // 检查相册中是否有照片
    const photos = query('SELECT COUNT(*) as count FROM photos WHERE album_id = ?', [id]);
    if (photos[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: '相册中还有照片，无法删除'
      });
    }

    // 删除相册
    const result = deleteRecord('DELETE FROM albums WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: '删除失败'
      });
    }

    res.json({
      success: true,
      message: '相册删除成功'
    });
  } catch (error) {
    console.error('删除相册失败:', error);
    res.status(500).json({
      success: false,
      message: '删除相册失败',
      error: error.message
    });
  }
};

module.exports = {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum
};
