const { query, insert, update, delete: deleteRecord } = require('../models/db');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

/**
 * 获取所有照片
 */
const getAllPhotos = (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'uploaded_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    // 验证排序字段
    const validSortFields = ['uploaded_at', 'taken_date', 'title'];
    const sortField = validSortFields.includes(sort) ? 'uploaded_at' : 'uploaded_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 查询总数
    const countResult = query('SELECT COUNT(*) as total FROM photos');
    const total = countResult[0].total;

    // 查询照片列表，包含关联信息
    const photos = query(`
      SELECT 
        p.*,
        fr.roll_number as film_roll_number,
        fr.name as film_roll_name,
        c.brand as camera_brand,
        c.model as camera_model,
        c.name as camera_name
      FROM photos p
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      LEFT JOIN cameras c ON fr.camera_id = c.id
      ORDER BY p.${sortField} ${sortOrder} 
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);
    
    // 在JavaScript中生成照片流水号和图片路径
    photos.forEach(photo => {
      photo.photo_serial_number = `${photo.film_roll_number}-${photo.photo_number.toString().padStart(3, '0')}`;
      
      // 生成图片路径
      if (photo.filename) {
        photo.original = `/uploads/${photo.filename}`;
        photo.thumbnail = `/uploads/thumbnails/${photo.id}_${photo.photo_number.toString().padStart(3, '0')}_thumb.jpg`;
      }
    });

    res.json({
      success: true,
      data: photos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取照片列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取照片列表失败',
      error: error.message
    });
  }
};

/**
 * 获取单张照片详情
 */
const getPhotoById = (req, res) => {
  try {
    const { id } = req.params;

    const photos = query('SELECT * FROM photos WHERE id = ?', [id]);

    if (photos.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该照片'
      });
    }

    res.json({
      success: true,
      data: photos[0]
    });
  } catch (error) {
    console.error('获取照片详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取照片详情失败',
      error: error.message
    });
  }
};

/**
 * 更新照片信息
 */
const updatePhoto = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 验证照片是否存在
    const existingPhotos = query('SELECT * FROM photos WHERE id = ?', [id]);
    if (existingPhotos.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该照片'
      });
    }

    // 构建更新SQL
    const updateFields = [];
    const params = [];

    Object.entries(updateData).forEach(([key, value]) => {
      // 过滤不允许更新的字段
      const allowedFields = [
        'title', 'description', 'film_type', 'camera_model', 'iso',
        'aperture', 'shutter_speed', 'focal_length', 'latitude',
        'longitude', 'location_name', 'taken_date', 'album_id'
      ];

      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有可更新的字段'
      });
    }

    params.push(id);

    // 执行更新
    const result = update(
      `UPDATE photos SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: '更新失败，未修改任何数据'
      });
    }

    // 获取更新后的照片信息
    const updatedPhoto = query('SELECT * FROM photos WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '照片信息更新成功',
      data: updatedPhoto[0]
    });
  } catch (error) {
    console.error('更新照片信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新照片信息失败',
      error: error.message
    });
  }
};

/**
 * 删除照片
 */
const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证照片是否存在
    const photos = query('SELECT * FROM photos WHERE id = ?', [id]);
    if (photos.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该照片'
      });
    }

    // 从数据库删除记录
    const result = deleteRecord('DELETE FROM photos WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: '删除失败'
      });
    }

    res.json({
      success: true,
      message: '照片删除成功'
    });
  } catch (error) {
    console.error('删除照片失败:', error);
    res.status(500).json({
      success: false,
      message: '删除照片失败',
      error: error.message
    });
  }
};

/**
 * 上传照片
 */
const uploadPhoto = async (req, res) => {
  try {
    console.log('=== 照片上传开始 ===');
    console.log('请求体:', req.body);
    console.log('上传的文件:', req.file);
    
    const {
      title,
      description,
      film_roll_id,
      camera_id,
      taken_date,
      location_name,
      tags
    } = req.body;

    // 验证必填字段
    if (!title || !film_roll_id) {
      return res.status(400).json({
        success: false,
        message: '标题和胶卷实例为必填字段'
      });
    }
    
    // 验证胶卷实例是否存在
    const filmRoll = query('SELECT * FROM film_rolls WHERE id = ?', [film_roll_id]);
    if (filmRoll.length === 0) {
      return res.status(400).json({
        success: false,
        message: '指定的胶卷实例不存在'
      });
    }
    
    // 生成照片序号
    const lastPhoto = query(
      'SELECT photo_number FROM photos WHERE film_roll_id = ? ORDER BY photo_number DESC LIMIT 1',
      [film_roll_id]
    );
    
    let photoNumber = 1;
    if (lastPhoto.length > 0) {
      photoNumber = lastPhoto[0].photo_number + 1;
    }
    
    // 验证照片序号不超过36（标准胶卷）
    if (photoNumber > 36) {
      return res.status(400).json({
        success: false,
        message: '胶卷已满，无法添加更多照片'
      });
    }

    // 验证文件
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的照片文件'
      });
    }

    // 生成唯一ID
    const id = crypto.randomUUID();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 创建上传目录
    const uploadDir = path.join(__dirname, '../uploads');
    const thumbnailDir = path.join(__dirname, '../uploads/thumbnails');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }

    // 生成文件名（包含照片序号，便于恢复）
    const fileExtension = path.extname(req.file.originalname);
    const filename = `${id}_${photoNumber.toString().padStart(3, '0')}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);
    const thumbnailPath = path.join(thumbnailDir, `${id}_${photoNumber.toString().padStart(3, '0')}_thumb.jpg`);

    // 保存原文件
    fs.writeFileSync(filePath, req.file.buffer);
    console.log('原文件保存成功:', filePath);

    // 生成缩略图
    try {
      await sharp(req.file.buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      console.log('缩略图生成成功:', thumbnailPath);
    } catch (thumbError) {
      console.error('缩略图生成失败:', thumbError);
    }

    // 插入照片记录
    const result = insert(
      `INSERT INTO photos (
        id, film_roll_id, photo_number, filename, original_name, title, description,
        camera_id, taken_date, location_name, tags, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        film_roll_id,
        photoNumber,
        filename, // 保存生成的文件名
        req.file.originalname, // original_name
        title, 
        description || '', 
        camera_id || null,
        taken_date || null, 
        location_name || '', 
        tags || '', 
        now
      ]
    );

    if (result.changes === 0) {
      return res.status(500).json({
        success: false,
        message: '照片上传失败'
      });
    }

    // 获取新创建的照片信息
    const newPhoto = query(`
      SELECT 
        p.*,
        fr.roll_number as film_roll_number
      FROM photos p
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      WHERE p.id = ?
    `, [id]);

    // 生成照片流水号
    const photoSerialNumber = `${newPhoto[0].film_roll_number}-${photoNumber.toString().padStart(3, '0')}`;

    console.log('=== 照片上传成功 ===');
    console.log('照片流水号:', photoSerialNumber);
    console.log('文件名:', filename);
    console.log('新照片ID:', id);
    console.log('文件路径:', filePath);
    console.log('缩略图路径:', thumbnailPath);
    console.log('数据库结果:', result);

    res.status(201).json({
      success: true,
      message: '照片上传成功',
      data: newPhoto[0]
    });
  } catch (error) {
    console.error('照片上传失败:', error);
    res.status(500).json({
      success: false,
      message: '照片上传失败',
      error: error.message
    });
  }
};

module.exports = {
  getAllPhotos,
  getPhotoById,
  uploadPhoto,
  updatePhoto,
  deletePhoto
};
