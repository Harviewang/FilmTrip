const { query, insert, update, delete: deleteRecord } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

/**
 * 获取所有相机
 */
const getAllCameras = (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // 查询总数
    const countResult = query('SELECT COUNT(*) as total FROM cameras');
    const total = countResult[0].total;

    // 查询相机列表，包含使用次数
    const cameras = query(`
      SELECT 
        c.*,
        COUNT(p.id) as usage_count
      FROM cameras c
      LEFT JOIN photos p ON c.id = p.camera_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: cameras,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取相机列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取相机列表失败',
      error: error.message
    });
  }
};

/**
 * 获取单个相机详情
 */
const getCameraById = (req, res) => {
  try {
    const { id } = req.params;

    const cameras = query('SELECT * FROM cameras WHERE id = ?', [id]);

    if (cameras.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该相机'
      });
    }

    // 获取使用该相机拍摄的照片
    const photos = query('SELECT * FROM photos WHERE camera_id = ? ORDER BY uploaded_at DESC', [cameras[0].id]);

    res.json({
      success: true,
      data: {
        ...cameras[0],
        photos
      }
    });
  } catch (error) {
    console.error('获取相机详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取相机详情失败',
      error: error.message
    });
  }
};

/**
 * 创建新相机
 */
const createCamera = (req, res) => {
  try {
    const { name, model, brand, type, format, description } = req.body;
    let imagePath = null;
    
    // 处理文件上传
    console.log('=== 相机创建 - 文件上传信息 ===');
    console.log('req.file:', req.file);
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    
    if (req.file) {
      imagePath = `/uploads/cameras/${req.file.filename}`;
      console.log('设置图片路径:', imagePath);
    } else {
      console.log('没有上传文件');
    }

    if (!name || !model) {
      return res.status(400).json({
        success: false,
        message: '相机名称和型号不能为空'
      });
    }

    // 检查相机型号是否已存在
    const existingCameras = query('SELECT * FROM cameras WHERE model = ?', [model]);
    if (existingCameras.length > 0) {
      return res.status(400).json({
        success: false,
        message: '相机型号已存在'
      });
    }

    const id = uuidv4();
    const result = insert(
      'INSERT INTO cameras (id, name, model, brand, type, format, description, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [id, name, model, brand || null, type || null, format || null, description || null, imagePath]
    );

    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '创建相机失败'
      });
    }

    // 获取新创建的相机
    const newCamera = query('SELECT * FROM cameras WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: '相机创建成功',
      data: newCamera[0]
    });
  } catch (error) {
    console.error('创建相机失败:', error);
    res.status(500).json({
      success: false,
      message: '创建相机失败',
      error: error.message
    });
  }
};

/**
 * 更新相机信息
 */
const updateCamera = (req, res) => {
  try {
    const { id } = req.params;
    
    // 安全检查 req.body
    let name, model, brand, type, format, description;
    
    if (!req.body) {
      console.log('req.body 是 undefined，尝试从 req 中获取数据');
      // 如果 req.body 不存在，尝试从其他地方获取数据
      name = req.body?.name || req.query?.name || '';
      model = req.body?.model || req.query?.model || '';
      brand = req.body?.brand || req.query?.brand || '';
      type = req.body?.type || req.query?.type || '';
      format = req.body?.format || req.query?.format || '';
      description = req.body?.description || req.query?.description || '';
    } else {
      ({ name, model, brand, type, format, description } = req.body);
    }
    
    let imagePath = null;
    
    // 处理文件上传
    console.log('=== 相机更新 - 文件上传信息 ===');
    console.log('req.file:', req.file);
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    
    if (req.file) {
      imagePath = `/uploads/cameras/${req.file.filename}`;
      console.log('设置新图片路径:', imagePath);
    } else {
      console.log('没有上传新文件');
    }

    // 验证相机是否存在
    const existingCameras = query('SELECT * FROM cameras WHERE id = ?', [id]);
    if (existingCameras.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该相机'
      });
    }

    // 如果没有新上传的图片，保留原有图片
    if (!req.file) {
      imagePath = existingCameras[0].image;
    }

    // 如果更新型号，检查是否与其他相机重名
    if (model && model !== existingCameras[0].model) {
      const duplicateCameras = query('SELECT * FROM cameras WHERE model = ? AND id != ?', [model, id]);
      if (duplicateCameras.length > 0) {
        return res.status(400).json({
          success: false,
          message: '相机型号已存在'
        });
      }
    }

    const result = update(
      'UPDATE cameras SET name = ?, model = ?, brand = ?, type = ?, format = ?, description = ?, image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, model, brand || null, type || null, format || null, description || null, imagePath, id]
    );

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: '更新失败，未修改任何数据'
      });
    }

    // 获取更新后的相机信息
    const updatedCamera = query('SELECT * FROM cameras WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '相机信息更新成功',
      data: updatedCamera[0]
    });
  } catch (error) {
    console.error('更新相机信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新相机信息失败',
      error: error.message
    });
  }
};

/**
 * 删除相机
 */
const deleteCamera = (req, res) => {
  try {
    const { id } = req.params;

    // 验证相机是否存在
    const cameras = query('SELECT * FROM cameras WHERE id = ?', [id]);
    if (cameras.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该相机'
      });
    }

    // 检查是否有照片使用该相机
    const photos = query('SELECT COUNT(*) as count FROM photos WHERE camera_id = ?', [cameras[0].id]);
    if (photos[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: '该相机还有照片在使用，无法删除'
      });
    }

    // 删除相机
    const result = deleteRecord('DELETE FROM cameras WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: '删除失败'
      });
    }

    res.json({
      success: true,
      message: '相机删除成功'
    });
  } catch (error) {
    console.error('删除相机失败:', error);
    res.status(500).json({
      success: false,
      message: '删除相机失败',
      error: error.message
    });
  }
};

module.exports = {
  getAllCameras,
  getCameraById,
  createCamera,
  updateCamera,
  deleteCamera
};
