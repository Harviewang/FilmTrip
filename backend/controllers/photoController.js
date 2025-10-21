const { query, insert, update, delete: deleteRecord } = require('../models/db');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sizeOf = require('image-size').default || require('image-size');
const crypto = require('crypto');
const ExifParser = require('exif-parser');
const jwt = require('jsonwebtoken');

/**
 * 获取所有照片
 */
const getAllPhotos = (req, res) => {
  try {
    let { page = 1, limit = 20, sort = 'uploaded_at', order = 'DESC', film_roll_id } = req.query;
    page = parseInt(page) || 1;
    if (page < 1) page = 1;
    limit = parseInt(limit) || 20;
    if (limit > 100) limit = 100;
    const offset = (page - 1) * limit;

    // 验证排序字段
    const validSortFields = ['uploaded_at', 'taken_date', 'title'];
    const sortField = validSortFields.includes(sort) ? 'uploaded_at' : 'uploaded_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 查询总数（可选按胶卷过滤）
    const countResult = film_roll_id
      ? query('SELECT COUNT(*) as total FROM photos WHERE film_roll_id = ?', [film_roll_id])
      : query('SELECT COUNT(*) as total FROM photos');
    const total = countResult[0].total;

    // 尝试解析是否为管理员（可选令牌）
    let isAdmin = false;
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      const secret = process.env.JWT_SECRET || 'dev-secret';
      if (token) {
        const decoded = jwt.verify(token, secret);
        if (decoded && decoded.username === 'admin') isAdmin = true;
      }
    } catch (e) {}

    // 查询照片列表，包含关联信息（包括胶卷是否加密）
    const photos = film_roll_id ? query(`
      SELECT 
        p.*,
        fr.roll_number AS film_roll_number,
        fr.roll_number AS film_roll_name,
        fr.is_private AS roll_is_private,
        fs.brand AS film_roll_brand,
        fs.iso AS film_roll_iso,
        fs.type AS film_roll_type
      FROM photos p
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      WHERE p.film_roll_id = ?
      ORDER BY p.${sortField} ${sortOrder} 
      LIMIT ? OFFSET ?
    `, [film_roll_id, parseInt(limit), parseInt(offset)]) : query(`
      SELECT 
        p.*,
        fr.roll_number AS film_roll_number,
        fr.roll_number AS film_roll_name,
        fr.is_private AS roll_is_private,
        fs.brand AS film_roll_brand,
        fs.iso AS film_roll_iso,
        fs.type AS film_roll_type
      FROM photos p
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      ORDER BY p.${sortField} ${sortOrder} 
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);
    
    // 在JavaScript中生成照片流水号和图片路径，并根据隐私策略处理URL
    photos.forEach(photo => {
      photo.photo_serial_number = `${photo.film_roll_number}-${photo.photo_number.toString().padStart(3, '0')}`;
      const photoIsPrivate = !!photo.is_private;
      const rollIsPrivate = !!photo.roll_is_private;
      const effectivePrivate = photoIsPrivate || rollIsPrivate;
      photo.effective_private = effectivePrivate;
      photo._raw = photo._raw || {};
      photo._raw.effective_private = effectivePrivate;
      if (photo.filename) {
        const uploadsDir = path.join(__dirname, '../uploads');
        const origPathAbs = path.join(uploadsDir, photo.filename);
        const baseName = photo.filename.replace(/\.[^.]+$/, '');
        const thumbRel = `/uploads/thumbnails/${baseName}_thumb.jpg`;
        const thumbPathAbs = path.join(uploadsDir, 'thumbnails', `${baseName}_thumb.jpg`);
        const size1024Rel = `/uploads/size1024/${baseName}_1024.jpg`;
        const size2048Rel = `/uploads/size2048/${baseName}_2048.jpg`;
        const size1024Abs = path.join(uploadsDir, 'size1024', `${baseName}_1024.jpg`);
        const size2048Abs = path.join(uploadsDir, 'size2048', `${baseName}_2048.jpg`);
        const hasOriginal = fs.existsSync(origPathAbs);
        const hasThumb = fs.existsSync(thumbPathAbs);
        const has1024 = fs.existsSync(size1024Abs);
        const has2048 = fs.existsSync(size2048Abs);
        if (hasOriginal) {
          // 非管理员且为加密内容：不返回任何图片URL
          if (effectivePrivate && !isAdmin) {
            photo.original = null;
            photo.thumbnail = null;
          } else {
            photo.original = `/uploads/${photo.filename}`;
            photo.size1024 = has1024 ? size1024Rel : null;
            photo.size2048 = has2048 ? size2048Rel : null;
            photo.thumbnail = hasThumb ? thumbRel : (has1024 ? size1024Rel : photo.original);
            // 返回缩略图尺寸与 EXIF 方向（若存在）
            // 暂时注释掉图片尺寸获取，先让瀑布流正常工作
            // try {
            //   const dimTarget = hasThumb ? thumbPathAbs : origPathAbs;
            //   console.log('尝试获取图片尺寸:', dimTarget);
              
            //   // 使用 sharp 获取图片尺寸
            //   const metadata = await sharp(dimTarget).metadata();
            //   console.log('图片尺寸结果:', metadata);
              
            //   if (metadata && metadata.width && metadata.height) {
            //     photo.thumbnail_width = metadata.width;
            //     photo.thumbnail_height = metadata.height;
            //     photo._raw.thumbnail_width = metadata.width;
            //     photo._raw.thumbnail_height = metadata.height;
            //     console.log('设置图片尺寸:', metadata.width, 'x', metadata.height);
            //   }
            // } catch (e) {
            //   console.error('获取图片尺寸失败:', e.message);
            // }
            try {
              const buf = fs.readFileSync(origPathAbs);
              const exif = ExifParser.create(buf).parse();
              if (exif && exif.tags && typeof exif.tags.Orientation !== 'undefined') {
                photo.exif = photo.exif || {};
                photo.exif.Orientation = exif.tags.Orientation;
                photo._raw.exif = photo._raw.exif || {};
                photo._raw.exif.Orientation = exif.tags.Orientation;
              }
            } catch (e) {}
          }
        } else {
          photo.original = null;
          photo.thumbnail = null;
        }
      } else {
        photo.original = null;
        photo.thumbnail = null;
      }
    });

    res.json({
      success: true,
      data: photos,
      pagination: {
        total,
        page,
        limit,
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

// 管理员获取原图文件
const getOriginalPhoto = (req, res) => {
  try {
    const { id } = req.params;
    const rows = query('SELECT filename FROM photos WHERE id = ?', [id]);
    if (!rows || rows.length === 0 || !rows[0].filename) {
      return res.status(404).json({ success: false, message: '照片不存在' });
    }
    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadsDir, rows[0].filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: '原图文件不存在' });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(filePath);
  } catch (error) {
    console.error('获取原图失败:', error);
    return res.status(500).json({ success: false, message: '获取原图失败', error: error.message });
  }
};

const uploadPhotosBatch = async (req, res) => {
  try {
    const { 
      film_roll_id, 
      camera_id, 
      location_name, 
      tags,
      country,
      province,
      city,
      categories,
      trip_name,
      trip_start_date,
      trip_end_date
    } = req.body;
    if (!film_roll_id) {
      return res.status(400).json({ success: false, message: '胶卷实例为必填字段' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: '请选择要上传的照片文件' });
    }
    const filmRoll = query('SELECT * FROM film_rolls WHERE id = ?', [film_roll_id]);
    if (filmRoll.length === 0) {
      return res.status(400).json({ success: false, message: '指定的胶卷实例不存在' });
    }
    const lastPhoto = query('SELECT photo_number FROM photos WHERE film_roll_id = ? ORDER BY photo_number DESC LIMIT 1', [film_roll_id]);
    const countRow = query('SELECT COUNT(*) as cnt FROM photos WHERE film_roll_id = ?', [film_roll_id]);
    const existingCount = countRow[0]?.cnt || 0;
    let nextNumber = lastPhoto.length > 0 ? (lastPhoto[0].photo_number + 1) : 1;
    const maxPerRoll = 36;
    const remainingSlots = Math.max(0, maxPerRoll - existingCount);
    if (remainingSlots <= 0) {
      return res.status(400).json({ success: false, message: '胶卷已满，无法添加更多照片' });
    }
    const uploadDir = path.join(__dirname, '../uploads');
    const thumbDir = path.join(__dirname, '../uploads/thumbnails');
    const size1024Dir = path.join(__dirname, '../uploads/size1024');
    const size2048Dir = path.join(__dirname, '../uploads/size2048');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
    if (!fs.existsSync(size1024Dir)) fs.mkdirSync(size1024Dir, { recursive: true });
    if (!fs.existsSync(size2048Dir)) fs.mkdirSync(size2048Dir, { recursive: true });
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const results = [];
    let processed = 0;
    const toProcess = Math.min(remainingSlots, req.files.length);
    for (let i = 0; i < toProcess; i++) {
      const file = req.files[i];
      const id = crypto.randomUUID();
      const photoNumber = nextNumber++;
      const ext = path.extname(file.originalname) || '.jpg';
      const base = `${id}_${photoNumber.toString().padStart(3, '0')}`;
      const filePath = path.join(uploadDir, `${base}${ext}`);
      const thumbPath = path.join(thumbDir, `${base}_thumb.jpg`);
      const size1024Path = path.join(size1024Dir, `${base}_1024.jpg`);
      const size2048Path = path.join(size2048Dir, `${base}_2048.jpg`);
      fs.writeFileSync(filePath, file.buffer);
      // 生成派生图：rotate()自动应用EXIF方向，withMetadata:false移除EXIF防止前端二次旋转
      try { await sharp(file.buffer).rotate().resize(300, 300, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).withMetadata(false).toFile(thumbPath); } catch (e) {}
      try { await sharp(file.buffer).rotate().resize(1024, 1024, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).withMetadata(false).toFile(size1024Path); } catch (e) {}
      try { await sharp(file.buffer).rotate().resize(2048, 2048, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).withMetadata(false).toFile(size2048Path); } catch (e) {}
      let exifAperture2 = null;
      let exifShutter2 = null;
      let exifIso2 = null;
      let exifFocal2 = null;
      let exifLat2 = null;
      let exifLon2 = null;
      let takenDate = null;
      try {
        const parser = ExifParser.create(file.buffer);
        const exif = parser.parse();
        if (exif.tags) {
          if (exif.tags.FNumber) exifAperture2 = `f/${exif.tags.FNumber}`;
          if (exif.tags.ExposureTime) {
            const exp = exif.tags.ExposureTime;
            exifShutter2 = exp >= 1 ? `${Math.round(exp)}s` : `1/${Math.round(1/exp)}`;
          }
          if (exif.tags.ISO) exifIso2 = exif.tags.ISO;
          if (exif.tags.FocalLength) exifFocal2 = `${exif.tags.FocalLength}mm`;
          if (typeof exif.tags.GPSLatitude === 'number') exifLat2 = exif.tags.GPSLatitude;
          if (typeof exif.tags.GPSLongitude === 'number') exifLon2 = exif.tags.GPSLongitude;
          if (exif.tags.DateTimeOriginal) {
            const d = new Date(exif.tags.DateTimeOriginal * 1000);
            takenDate = isNaN(d.getTime()) ? null : d.toISOString().replace('T', ' ').substring(0, 19);
          }
        }
      } catch (e) {}
      const result = insert(
        `INSERT INTO photos (
          id, film_roll_id, photo_number, filename, original_name, title, description,
          camera_id, taken_date, location_name, tags, uploaded_at,
          aperture, shutter_speed, focal_length, iso, latitude, longitude,
          country, province, city, categories, trip_name, trip_start_date, trip_end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          film_roll_id,
          photoNumber,
          `${base}${ext}`,
          file.originalname,
          path.basename(file.originalname, ext),
          '',
          camera_id || null,
          takenDate,
          location_name || '',
          tags || '',
          now,
          exifAperture2,
          exifShutter2,
          exifFocal2,
          exifIso2 || null,
          exifLat2 || null,
          exifLon2 || null,
          country || null,
          province || null,
          city || null,
          categories || null,
          trip_name || null,
          trip_start_date || null,
          trip_end_date || null
        ]
      );
      if (result.changes > 0) {
        const row = query('SELECT * FROM photos WHERE id = ?', [id]);
        results.push(row[0]);
      }
      processed++;
    }
    const skipped = req.files.length - processed;
    const msg = skipped > 0 
      ? `批量上传完成：成功 ${processed} 张，跳过 ${skipped} 张（已达每卷上限 36 张）`
      : '批量上传成功';
    return res.status(201).json({ success: true, message: msg, count: results.length, skipped, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: '批量上传失败', error: error.message });
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
        'longitude', 'location_name', 'taken_date', 'album_id', 'is_private',
        'camera_model', 'lens_model', 'lens_focal_length', 'exposure_compensation',
        'metering_mode', 'focus_mode', 'country', 'province', 'city',
        'categories', 'trip_name', 'trip_start_date', 'trip_end_date'
      ];

      if (allowedFields.includes(key)) {
        if (key === 'is_private') {
          // 布尔转 0/1，保持 undefined 不覆盖
          if (value === undefined || value === null || value === '') return;
          const v = (value === true || value === 1 || value === '1' || value === 'true') ? 1 : 0;
          updateFields.push('is_private = ?');
          params.push(v);
        } else {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
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
      tags,
      country,
      province,
      city,
      categories,
      trip_name,
      trip_start_date,
      trip_end_date
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
    const size1024Dir = path.join(__dirname, '../uploads/size1024');
    const size2048Dir = path.join(__dirname, '../uploads/size2048');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    if (!fs.existsSync(size1024Dir)) {
      fs.mkdirSync(size1024Dir, { recursive: true });
    }
    if (!fs.existsSync(size2048Dir)) {
      fs.mkdirSync(size2048Dir, { recursive: true });
    }

    // 生成文件名（包含照片序号，便于恢复）
    const fileExtension = path.extname(req.file.originalname);
    const base = `${id}_${photoNumber.toString().padStart(3, '0')}`;
    const filename = `${base}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);
    const thumbnailPath = path.join(thumbnailDir, `${base}_thumb.jpg`);
    const size1024Path = path.join(size1024Dir, `${base}_1024.jpg`);
    const size2048Path = path.join(size2048Dir, `${base}_2048.jpg`);

    // 保存原文件
    fs.writeFileSync(filePath, req.file.buffer);
    console.log('原文件保存成功:', filePath);

    // 生成派生图：rotate()自动应用EXIF方向，withMetadata(false)移除EXIF防止前端二次旋转
    try {
      await sharp(req.file.buffer)
        .rotate()
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .withMetadata(false)
        .toFile(thumbnailPath);
      console.log('缩略图生成成功:', thumbnailPath);
    } catch (thumbError) {
      console.error('缩略图生成失败:', thumbError);
    }
    
    // 生成1024尺寸
    try {
      await sharp(req.file.buffer)
        .rotate()
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .withMetadata(false)
        .toFile(size1024Path);
      console.log('1024尺寸生成成功:', size1024Path);
    } catch (e) {
      console.error('1024尺寸生成失败:', e);
    }
    
    // 生成2048尺寸
    try {
      await sharp(req.file.buffer)
        .rotate()
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .withMetadata(false)
        .toFile(size2048Path);
      console.log('2048尺寸生成成功:', size2048Path);
    } catch (e) {
      console.error('2048尺寸生成失败:', e);
    }

    let exifAperture = null;
    let exifShutter = null;
    let exifIso = null;
    let exifFocal = null;
    let exifLat = null;
    let exifLon = null;
    let exifTaken = null;
    try {
      const parser = ExifParser.create(req.file.buffer);
      const exif = parser.parse();
      if (exif.tags) {
        if (exif.tags.FNumber) exifAperture = `f/${exif.tags.FNumber}`;
        if (exif.tags.ExposureTime) {
          const exp = exif.tags.ExposureTime;
          exifShutter = exp >= 1 ? `${Math.round(exp)}s` : `1/${Math.round(1/exp)}`;
        }
        if (exif.tags.ISO) exifIso = exif.tags.ISO;
        if (exif.tags.FocalLength) exifFocal = `${exif.tags.FocalLength}mm`;
        if (typeof exif.tags.GPSLatitude === 'number') exifLat = exif.tags.GPSLatitude;
        if (typeof exif.tags.GPSLongitude === 'number') exifLon = exif.tags.GPSLongitude;
        if (exif.tags.DateTimeOriginal) {
          const d = new Date(exif.tags.DateTimeOriginal * 1000);
          exifTaken = isNaN(d.getTime()) ? null : d.toISOString().replace('T', ' ').substring(0, 19);
        }
      }
    } catch (e) {}

    const result = insert(
      `INSERT INTO photos (
        id, film_roll_id, photo_number, filename, original_name, title, description,
        camera_id, taken_date, location_name, tags, uploaded_at,
        aperture, shutter_speed, focal_length, iso, latitude, longitude,
        country, province, city, categories, trip_name, trip_start_date, trip_end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        film_roll_id,
        photoNumber,
        filename,
        req.file.originalname,
        title,
        description || '',
        camera_id || null,
        (taken_date || exifTaken || null),
        location_name || '',
        tags || '',
        now,
        exifAperture,
        exifShutter,
        exifFocal,
        exifIso || null,
        exifLat || null,
        exifLon || null,
        country || null,
        province || null,
        city || null,
        categories || null,
        trip_name || null,
        trip_start_date || null,
        trip_end_date || null
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
  uploadPhotosBatch,
  updatePhoto,
  deletePhoto,
  getOriginalPhoto
};
