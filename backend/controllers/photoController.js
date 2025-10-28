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
const getAllPhotos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      film_roll_id, 
      sort = 'id', 
      order = 'desc',
      film_type, // 新增：胶卷类型筛选
      film_format // 新增：胶卷画幅筛选
    } = req.query;

    // 验证参数
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: '无效的分页参数'
      });
    }

    // 构建排序字段和方向
    const allowedSortFields = ['id', 'taken_date', 'uploaded_at', 'title', 'rating', 'random'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'id';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    
    // 处理随机排序
    let orderClause;
    if (sortField === 'random') {
      orderClause = 'ORDER BY RANDOM()';
    } else {
      orderClause = `ORDER BY p.${sortField} ${sortOrder}`;
    }

    // 计算偏移量
    const offset = (pageNum - 1) * limitNum;

    // 构建WHERE条件
    let whereConditions = [];
    let queryParams = [];
    
    if (film_roll_id) {
      whereConditions.push('p.film_roll_id = ?');
      queryParams.push(film_roll_id);
    }
    
    // 胶卷类型筛选
    if (film_type && film_type !== 'all') {
      whereConditions.push('fs.type = ?');
      queryParams.push(film_type);
    }
    
    // 胶卷画幅筛选
    if (film_format && film_format !== 'all') {
      whereConditions.push('fs.format = ?');
      queryParams.push(film_format);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // 获取总数
    const totalQuery = `
      SELECT COUNT(*) as total 
      FROM photos p
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      ${whereClause}
    `;
    const totalResult = query(totalQuery, queryParams);
    const total = totalResult[0].total;

    // 查询照片数据
    const photos = query(`
      SELECT 
        p.*,
        c.name AS camera_name,
        c.model AS camera_model,
        c.brand AS camera_brand,
        fr.roll_number AS film_roll_number,
        fr.roll_number AS film_roll_name,
        fr.is_protected AS roll_is_protected,
        fr.protection_level AS roll_protection_level,
        fs.brand AS film_roll_brand,
        fs.iso AS film_roll_iso,
        fs.type AS film_roll_type,
        fs.format AS film_roll_format
      FROM photos p
      LEFT JOIN cameras c ON p.camera_id = c.id
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);
    
    // 判断用户是否为管理员
    const token = req.headers.authorization?.replace('Bearer ', '');
    let isAdmin = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        isAdmin = decoded.username === 'admin';
      } catch (e) {
        // Token 无效，视为普通用户
      }
    }
    
    photos.forEach(photo => {
      // 在修改前保存原始数据副本
      const originalPhoto = { ...photo };
      
      photo.photo_serial_number = `${photo.film_roll_number}-${photo.photo_number.toString().padStart(3, '0')}`;
      
      // 统一使用 effective_protection 逻辑
      const photoIsProtected = !!photo.is_protected;
      const rollIsProtected = !!photo.roll_is_protected;
      const effectiveProtection = photoIsProtected || rollIsProtected;
      photo.effective_protection = effectiveProtection;
      photo.protection_level = photo.protection_level || photo.roll_protection_level || null;

      photo._raw = originalPhoto; // 保存原始数据副本
      photo._raw.effective_protection = effectiveProtection;
      photo._raw.protection_level = photo.protection_level; // 确保_raw中也有protection_level
      
      // 根据用户角色和保护状态决定是否生成URL
      if (photo.filename && photo.filename.trim()) {
        // 如果用户是管理员或者照片未受保护，才生成URL
        if (isAdmin || !effectiveProtection) {
          const baseName = photo.filename.replace(/\.[^.]+$/, '');
          photo.original = `/uploads/${photo.filename}`;
          photo.thumbnail = `/uploads/thumbnails/${baseName}_thumb.jpg`;
          photo.size1024 = `/uploads/size1024/${baseName}_1024.jpg`;
          photo.size2048 = `/uploads/size2048/${baseName}_2048.jpg`;
          
          // 尝试读取EXIF信息
          try {
            const uploadsDir = path.join(__dirname, '../uploads');
            const origPathAbs = path.join(uploadsDir, photo.filename);
            const buf = fs.readFileSync(origPathAbs);
            const exif = ExifParser.create(buf).parse();
            if (exif && exif.tags && typeof exif.tags.Orientation !== 'undefined') {
              photo.exif = photo.exif || {};
              photo.exif.Orientation = exif.tags.Orientation;
              photo._raw.exif = photo._raw.exif || {};
              photo._raw.exif.Orientation = exif.tags.Orientation;
            }
          } catch (e) {
            // EXIF读取失败，不影响图片显示
          }
        } else {
          // 普通用户且照片加密，不返回URL
          photo.original = null;
          photo.thumbnail = null;
          photo.size1024 = null;
          photo.size2048 = null;
        }
      } else {
        photo.original = null;
        photo.thumbnail = null;
        photo.size1024 = null;
        photo.size2048 = null;
      }
    });

    // 数据映射：将后端字段映射到前端期望的字段
    const mappedPhotos = photos.map((photo, index) => ({
      id: photo.id || `photo-${page}-${index}`, // 使用稳定的ID，避免刷新时位置错乱
      title: photo.title || photo.filename || '无标题',
      description: photo.description || '',
      thumbnail: photo.thumbnail,
      original: photo.original,
      size1024: photo.size1024,
      size2048: photo.size2048,
      filename: photo.filename,
      camera: photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机',
      film: photo.film_roll_name || photo.film_roll_number || '无',
      date: photo.taken_date || (photo.uploaded_at ? photo.uploaded_at.split(' ')[0] : '未知日期'),
      rating: photo.rating || 0,
      location_name: photo.location_name,
      photo_serial_number: photo.photo_serial_number,
      // 加密保护字段
      is_protected: photo.is_protected,
      protection_level: photo.protection_level,
      effective_protection: photo.effective_protection,
      // 图片尺寸和方向(用于前端布局计算)
      width: photo.width,
      height: photo.height,
      orientation: photo.orientation,
      // 新增的元数据字段
      country: photo.country,
      province: photo.province,
      city: photo.city,
      district: photo.district,
      township: photo.township,
      categories: photo.categories,
      trip_name: photo.trip_name,
      trip_start_date: photo.trip_start_date,
      trip_end_date: photo.trip_end_date,
      aperture: photo.aperture,
      shutter_speed: photo.shutter_speed,
      focal_length: photo.focal_length,
      iso: photo.iso,
      camera_model: photo.camera_model,
      lens_model: photo.lens_model,
      // 保留原始数据用于调试
      _raw: photo
    }));

    res.json({
      success: true,
      data: mappedPhotos,
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
    return res.status(500).json({ 
      success: false, 
      message: '获取原图失败', 
      error: error.message 
    });
  }
};

const normalizeBoolean = (value) => {
  // 如果值为 undefined 或 null，返回 false（默认不加密）
  if (value === undefined || value === null) return false;
  
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return ['true', '1', 'yes', 'on'].includes(normalized);
  }
  return false;
};

const uploadPhotosBatch = async (req, res) => {
  try {
    console.log('=== 批量上传开始 ===');
    console.log('请求体字段:', Object.keys(req.body));
    console.log('文件数量:', req.files ? req.files.length : 0);
    console.log('文件信息:', req.files ? req.files.map(f => ({ name: f.fieldname, originalname: f.originalname, size: f.size })) : []);
    
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
      trip_end_date,
      is_protected,
      protection_level
    } = req.body;
    const isProtectedFlag = normalizeBoolean(is_protected);
    console.log('[批量上传] is_protected 原始值:', is_protected, '=>', isProtectedFlag ? 1 : 0);
    const resolvedProtectionLevel = isProtectedFlag ? (protection_level || null) : null;
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
      
      // 处理EXIF Orientation:保留原图orientation或应用用户旋转
      const userRotation = req.body[`rotation_${i}`] ? parseInt(req.body[`rotation_${i}`]) : 0;
      
      let orientationValue = null;
      if (userRotation > 0) {
        // 用户手动旋转,设置对应的orientation
        if (userRotation === 90) orientationValue = 6;
        else if (userRotation === 180) orientationValue = 3;
        else if (userRotation === 270) orientationValue = 8;
      } else {
        // 用户没有旋转,读取原图的EXIF orientation
        const originalMetadata = await sharp(file.buffer).metadata();
        orientationValue = originalMetadata.orientation || 1;
      }
      
      // 保存原图,设置或保留EXIF Orientation
      await sharp(file.buffer)
        .withMetadata({ orientation: orientationValue })
        .toFile(filePath);
      
      // 获取图片原始物理尺寸
      let imageWidth = null;
      let imageHeight = null;
      let imageOrientation = orientationValue;
      try {
        const metadata = await sharp(filePath).metadata();
        imageWidth = metadata.width;
        imageHeight = metadata.height;
      } catch (e) {}
      
      // 生成派生图:同样设置EXIF Orientation
      try {
        await sharp(filePath)
          .withMetadata({ orientation: orientationValue })
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbPath);
      } catch (e) {}
      try {
        await sharp(filePath)
          .withMetadata({ orientation: orientationValue })
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(size1024Path);
      } catch (e) {}
      try {
        await sharp(filePath)
          .withMetadata({ orientation: orientationValue })
          .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toFile(size2048Path);
      } catch (e) {}
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
          taken_date, camera_id, camera_model, lens_model, lens_focal_length,
          aperture, shutter_speed, focal_length, iso,
          exposure_compensation, metering_mode, focus_mode,
          latitude, longitude, location_name, country, province, city,
          categories, trip_name, trip_start_date, trip_end_date,
          tags, is_protected, protection_level, width, height, orientation, rotation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          film_roll_id,
          photoNumber,
          `${base}${ext}`,
          file.originalname,
          path.basename(file.originalname, ext),
          '',
          takenDate,
          camera_id || null,
          null, // camera_model
          null, // lens_model
          null, // lens_focal_length
          exifAperture2,
          exifShutter2,
          exifFocal2,
          exifIso2 || null,
          null, // exposure_compensation
          null, // metering_mode
          null, // focus_mode
          exifLat2 || null,
          exifLon2 || null,
          location_name || '',
          country || null,
          province || null,
          city || null,
          categories || null,
          trip_name || null,
          trip_start_date || null,
          trip_end_date || null,
          tags || '',
          isProtectedFlag ? 1 : 0,
          resolvedProtectionLevel,
          imageWidth,
          imageHeight,
          imageOrientation, // EXIF orientation
          0 // rotation字段设为0,不再使用
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

    // 判断用户是否为管理员
    const token = req.headers.authorization?.replace('Bearer ', '');
    let isAdmin = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        isAdmin = decoded.username === 'admin';
      } catch (e) {
        // Token 无效，视为普通用户
      }
    }

    const photos = query(`
      SELECT 
        p.*,
        c.name AS camera_name,
        c.model AS camera_model,
        c.brand AS camera_brand,
        fr.roll_number AS film_roll_number,
        fr.roll_number AS film_roll_name,
        fr.is_private AS roll_is_private,
        fr.is_protected AS roll_is_protected,
        fr.protection_level AS roll_protection_level,
        fs.brand AS film_roll_brand,
        fs.iso AS film_roll_iso,
        fs.type AS film_roll_type
      FROM photos p
      LEFT JOIN cameras c ON p.camera_id = c.id
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      WHERE p.id = ?
    `, [id]);

    if (photos.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该照片'
      });
    }

    const photo = photos[0];

    // 在修改前保存原始数据副本
    const originalPhoto = { ...photo };

    photo.photo_serial_number = `${photo.film_roll_number}-${photo.photo_number.toString().padStart(3, '0')}`;

    // 统一使用 effective_protection 逻辑
    const photoIsProtected = !!photo.is_protected;
    const rollIsProtected = !!photo.roll_is_protected;
    const effectiveProtection = photoIsProtected || rollIsProtected;
    photo.effective_protection = effectiveProtection;
    photo.protection_level = photo.protection_level || photo.roll_protection_level || null;

    photo._raw = originalPhoto; // 保存原始数据副本
    photo._raw.effective_protection = effectiveProtection;
    photo._raw.protection_level = photo.protection_level; // 确保_raw中也有protection_level

    // 根据用户角色和保护状态决定是否生成URL
    if (photo.filename && photo.filename.trim()) {
      // 如果用户是管理员或者照片未受保护，才生成URL
      if (isAdmin || !effectiveProtection) {
        const baseName = photo.filename.replace(/\.[^.]+$/, '');
        photo.original = `/uploads/${photo.filename}`;
        photo.thumbnail = `/uploads/thumbnails/${baseName}_thumb.jpg`;
        photo.size1024 = `/uploads/size1024/${baseName}_1024.jpg`;
        photo.size2048 = `/uploads/size2048/${baseName}_2048.jpg`;

        // 尝试读取EXIF信息
        try {
          const uploadsDir = path.join(__dirname, '../uploads');
          const origPathAbs = path.join(uploadsDir, photo.filename);
          const buf = fs.readFileSync(origPathAbs);
          const exif = ExifParser.create(buf).parse();
          if (exif && exif.tags && typeof exif.tags.Orientation !== 'undefined') {
            photo.exif = photo.exif || {};
            photo.exif.Orientation = exif.tags.Orientation;
            photo._raw.exif = photo._raw.exif || {};
            photo._raw.exif.Orientation = exif.tags.Orientation;
          }
        } catch (e) {
          // EXIF读取失败，不影响图片显示
        }
      } else {
        // 普通用户且照片受保护，不返回URL
        photo.original = null;
        photo.thumbnail = null;
        photo.size1024 = null;
        photo.size2048 = null;
      }
    } else {
      photo.original = null;
      photo.thumbnail = null;
      photo.size1024 = null;
      photo.size2048 = null;
    }

    // 数据映射：将后端字段映射到前端期望的字段
    const mappedPhoto = {
      id: photo.id,
      title: photo.title || photo.filename || '无标题',
      description: photo.description || '',
      thumbnail: photo.thumbnail,
      original: photo.original,
      size1024: photo.size1024,
      size2048: photo.size2048,
      filename: photo.filename,
      camera: photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机',
      film: photo.film_roll_name || photo.film_roll_number || '无',
      date: photo.taken_date || (photo.uploaded_at ? photo.uploaded_at.split(' ')[0] : '未知日期'),
      rating: photo.rating || 0,
      location_name: photo.location_name,
      photo_serial_number: photo.photo_serial_number,
      // 加密保护字段
      is_protected: photo.is_protected,
      protection_level: photo.protection_level,
      effective_protection: photo.effective_protection,
      // 图片尺寸和方向(用于前端布局计算)
      width: photo.width,
      height: photo.height,
      orientation: photo.orientation,
      // 新增的元数据字段
      country: photo.country,
      province: photo.province,
      city: photo.city,
      district: photo.district,
      township: photo.township,
      categories: photo.categories,
      trip_name: photo.trip_name,
      trip_start_date: photo.trip_start_date,
      trip_end_date: photo.trip_end_date,
      aperture: photo.aperture,
      shutter_speed: photo.shutter_speed,
      focal_length: photo.focal_length,
      iso: photo.iso,
      camera_model: photo.camera_model,
      lens_model: photo.lens_model,
      // 保留原始数据用于调试
      _raw: photo
    };

    res.json({
      success: true,
      data: mappedPhoto
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
const updatePhoto = async (req, res) => {
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
        'categories', 'trip_name', 'trip_start_date', 'trip_end_date',
        'is_protected', 'protection_level', 'rotation'
      ];

      if (allowedFields.includes(key)) {
        if (key === 'is_private' || key === 'is_protected') {
          // 布尔转 0/1，保持 undefined 不覆盖
          if (value === undefined || value === null || value === '') return;
          const v = (value === true || value === 1 || value === '1' || value === 'true') ? 1 : 0;
          updateFields.push(`${key} = ?`);
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

    // 如果rotation字段被更新,需要重新生成图片文件
    if (updateData.rotation !== undefined) {
      const photos = query('SELECT * FROM photos WHERE id = ?', [id]);
      if (photos.length > 0) {
        const photo = photos[0];
        // 使用filename字段构建原图路径
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const originalPath = path.join(uploadsDir, photo.filename);
        
        // 检查原图是否存在
        if (fs.existsSync(originalPath)) {
          console.log('检测到rotation更新,重新生成图片:', photo.filename);
          
          const rotation = parseInt(updateData.rotation) || 0;
          const thumbnailPath = path.join(uploadsDir, 'thumbnails', photo.filename.replace(/\.[^.]+$/, '_thumb.jpg'));
          const size1024Path = path.join(uploadsDir, 'size1024', photo.filename.replace(/\.[^.]+$/, '_1024.jpg'));
          const size2048Path = path.join(uploadsDir, 'size2048', photo.filename.replace(/\.[^.]+$/, '_2048.jpg'));
          
          try {
            // 最优方案:只修改EXIF Orientation,不物理旋转像素!
            // rotation值对应EXIF Orientation值:
            // 0° → orientation=1, 90° → orientation=6, 180° → orientation=3, 270° → orientation=8
            console.log(`检测到rotation更新=${rotation},修改EXIF Orientation`);
            
            if (rotation > 0) {
              // 将用户的rotation角度转换为EXIF Orientation值
              let orientationValue = 1; // 默认不旋转
              if (rotation === 90) orientationValue = 6;   // 顺时针90°
              else if (rotation === 180) orientationValue = 3; // 180°
              else if (rotation === 270) orientationValue = 8; // 顺时针270° = 逆时针90°
              
              console.log(`设置EXIF Orientation=${orientationValue} (${rotation}°)`);
              
              // 修改原图EXIF
              const tempOriginal = originalPath + '.tmp';
              await sharp(originalPath, { failOnError: false })
                .withMetadata({ orientation: orientationValue })
                .toFile(tempOriginal);
              fs.renameSync(tempOriginal, originalPath);
              console.log('原图EXIF已更新');
              
              // 修改缩略图EXIF
              if (fs.existsSync(thumbnailPath)) {
                const tempThumb = thumbnailPath + '.tmp';
                await sharp(thumbnailPath, { failOnError: false })
                  .withMetadata({ orientation: orientationValue })
                  .toFile(tempThumb);
                fs.renameSync(tempThumb, thumbnailPath);
                console.log('缩略图EXIF已更新');
              }
              
              // 修改1024尺寸EXIF
              if (fs.existsSync(size1024Path)) {
                const temp1024 = size1024Path + '.tmp';
                await sharp(size1024Path, { failOnError: false })
                  .withMetadata({ orientation: orientationValue })
                  .toFile(temp1024);
                fs.renameSync(temp1024, size1024Path);
                console.log('1024尺寸EXIF已更新');
              }
              
              // 修改2048尺寸EXIF
              if (fs.existsSync(size2048Path)) {
                const temp2048 = size2048Path + '.tmp';
                await sharp(size2048Path, { failOnError: false })
                  .withMetadata({ orientation: orientationValue })
                  .toFile(temp2048);
                fs.renameSync(temp2048, size2048Path);
                console.log('2048尺寸EXIF已更新');
              }
              
              // 所有EXIF已更新,重置rotation并更新宽高(如果是90°/270°需要互换)
              if (rotation === 90 || rotation === 270) {
                // 需要互换宽高
                const currentPhoto = query('SELECT width, height FROM photos WHERE id = ?', [id])[0];
                if (currentPhoto && currentPhoto.width && currentPhoto.height) {
                  const newWidth = currentPhoto.height;
                  const newHeight = currentPhoto.width;
                  update('UPDATE photos SET rotation = 0, width = ?, height = ? WHERE id = ?', [newWidth, newHeight, id]);
                  console.log(`宽高已互换: ${currentPhoto.width}x${currentPhoto.height} → ${newWidth}x${newHeight}`);
                } else {
                  update('UPDATE photos SET rotation = 0 WHERE id = ?', [id]);
                }
              } else {
                update('UPDATE photos SET rotation = 0 WHERE id = ?', [id]);
              }
              console.log('所有图片EXIF已更新,数据库已同步');
            }
          } catch (regenerateError) {
            console.error('重新生成图片失败:', regenerateError);
          }
        }
      }
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
      trip_end_date,
      is_protected,
      protection_level
    } = req.body;
    const isProtectedFlag = normalizeBoolean(is_protected);
    console.log('[单张上传] is_protected 原始值:', is_protected, '=>', isProtectedFlag ? 1 : 0);
    const resolvedProtectionLevel = isProtectedFlag ? (protection_level || null) : null;

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

    // 处理EXIF Orientation:
    // 1. 如果用户手动旋转了(rotation > 0),设置对应的orientation值
    // 2. 如果用户没有旋转(rotation = 0),保留原图的EXIF orientation
    const userRotation = req.body.rotation ? parseInt(req.body.rotation) : 0;
    
    let orientationValue = null;
    if (userRotation > 0) {
      // 用户手动旋转,设置对应的orientation
      if (userRotation === 90) orientationValue = 6;
      else if (userRotation === 180) orientationValue = 3;
      else if (userRotation === 270) orientationValue = 8;
      console.log(`用户手动旋转${userRotation}°,设置EXIF Orientation=${orientationValue}`);
    } else {
      // 用户没有旋转,读取原图的EXIF orientation
      const originalMetadata = await sharp(req.file.buffer).metadata();
      orientationValue = originalMetadata.orientation || 1;
      console.log(`保留原图EXIF Orientation=${orientationValue}`);
    }
    
    // 保存原图,设置或保留EXIF Orientation
    await sharp(req.file.buffer)
      .withMetadata({ orientation: orientationValue })
      .toFile(filePath);
    console.log('原图保存成功:', filePath);

    // 获取图片原始物理尺寸和EXIF orientation
    let imageWidth = null;
    let imageHeight = null;
    let imageOrientation = orientationValue; // 使用我们刚设置的EXIF orientation值
    try {
      const metadata = await sharp(filePath).metadata();
      imageWidth = metadata.width;
      imageHeight = metadata.height;
      
      console.log(`图片物理尺寸: ${imageWidth}x${imageHeight}, EXIF Orientation: ${imageOrientation}`);
    } catch (metaError) {
      console.error('获取图片尺寸失败:', metaError);
    }

    // 生成派生图:同样设置EXIF Orientation
    try {
      await sharp(filePath)
        .withMetadata({ orientation: orientationValue })
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      console.log('缩略图生成成功:', thumbnailPath);
    } catch (thumbError) {
      console.error('缩略图生成失败:', thumbError);
    }
    
    // 生成1024尺寸
    try {
      await sharp(filePath)
        .withMetadata({ orientation: orientationValue })
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(size1024Path);
      console.log('1024尺寸生成成功:', size1024Path);
    } catch (e) {
      console.error('1024尺寸生成失败:', e);
    }
    
    // 生成2048尺寸
    try {
      await sharp(filePath)
        .withMetadata({ orientation: orientationValue })
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
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
        taken_date, camera_id, camera_model, lens_model, lens_focal_length,
        aperture, shutter_speed, focal_length, iso,
        exposure_compensation, metering_mode, focus_mode,
        latitude, longitude, location_name, country, province, city,
        categories, trip_name, trip_start_date, trip_end_date,
        tags, is_protected, protection_level, width, height, orientation, rotation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        film_roll_id,
        photoNumber,
        filename,
        req.file.originalname,
        title,
        description || '',
        (taken_date || exifTaken || null),
        camera_id || null,
        null, // camera_model
        null, // lens_model
        null, // lens_focal_length
        exifAperture,
        exifShutter,
        exifFocal,
        exifIso || null,
        null, // exposure_compensation
        null, // metering_mode
        null, // focus_mode
        exifLat || null,
        exifLon || null,
        location_name || '',
        country || null,
        province || null,
        city || null,
        categories || null,
        trip_name || null,
        trip_start_date || null,
        trip_end_date || null,
        tags || '',
        isProtectedFlag ? 1 : 0,
        resolvedProtectionLevel,
        imageWidth,
        imageHeight,
        imageOrientation, // EXIF orientation
        0 // rotation字段设为0,不再使用
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

/**
 * 获取随机照片
 */
const getRandomPhotos = (req, res) => {
  try {
    const { count = 6 } = req.query; // 默认返回6张照片
    const limit = Math.min(parseInt(count) || 6, 10); // 最多返回10张

    // 判断用户是否为管理员
    const token = req.headers.authorization?.replace('Bearer ', '');
    let isAdmin = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        isAdmin = decoded.username === 'admin';
      } catch (e) {
        // Token 无效，视为普通用户
      }
    }

    // 查询随机照片，排除受保护内容
    const photos = query(`
      SELECT
        p.*,
        c.name AS camera_name,
        c.model AS camera_model,
        c.brand AS camera_brand,
        fr.roll_number AS film_roll_number,
        fr.roll_number AS film_roll_name,
        fr.is_private AS roll_is_private,
        fr.is_protected AS roll_is_protected,
        fr.protection_level AS roll_protection_level,
        fs.brand AS film_roll_brand,
        fs.iso AS film_roll_iso,
        fs.type AS film_roll_type
      FROM photos p
      LEFT JOIN cameras c ON p.camera_id = c.id
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      LEFT JOIN film_stocks fs ON fr.film_stock_id = fs.id
      WHERE (p.is_protected = 0 OR p.is_protected IS NULL)
        AND (fr.is_protected = 0 OR fr.is_protected IS NULL)
      ORDER BY RANDOM()
      LIMIT ?
    `, [limit]);

    // 处理照片数据
    const processedPhotos = photos.map(photo => {
      // 在修改前保存原始数据副本
      const originalPhoto = { ...photo };

      photo.photo_serial_number = `${photo.film_roll_number}-${photo.photo_number.toString().padStart(3, '0')}`;

      // 统一使用 effective_protection 逻辑
      const photoIsProtected = !!photo.is_protected;
      const rollIsProtected = !!photo.roll_is_protected;
      const effectiveProtection = photoIsProtected || rollIsProtected;
      photo.effective_protection = effectiveProtection;
      photo.protection_level = photo.protection_level || photo.roll_protection_level || null;

      photo._raw = originalPhoto; // 保存原始数据副本
      photo._raw.effective_protection = effectiveProtection;
      photo._raw.protection_level = photo.protection_level; // 确保_raw中也有protection_level

      // 随机照片API总是返回URL，因为查询时已过滤保护内容
      if (photo.filename && photo.filename.trim()) {
        const baseName = photo.filename.replace(/\.[^.]+$/, '');
        photo.original = `/uploads/${photo.filename}`;
        photo.thumbnail = `/uploads/thumbnails/${baseName}_thumb.jpg`;
        photo.size1024 = `/uploads/size1024/${baseName}_1024.jpg`;
        photo.size2048 = `/uploads/size2048/${baseName}_2048.jpg`;

        // 尝试读取EXIF信息
        try {
          const uploadsDir = path.join(__dirname, '../uploads');
          const origPathAbs = path.join(uploadsDir, photo.filename);
          const buf = fs.readFileSync(origPathAbs);
          const exif = ExifParser.create(buf).parse();
          if (exif && exif.tags && typeof exif.tags.Orientation !== 'undefined') {
            photo.exif = photo.exif || {};
            photo.exif.Orientation = exif.tags.Orientation;
            photo._raw.exif = photo._raw.exif || {};
            photo._raw.exif.Orientation = exif.tags.Orientation;
          }
        } catch (e) {
          // EXIF读取失败，不影响图片显示
        }
      } else {
        photo.original = null;
        photo.thumbnail = null;
        photo.size1024 = null;
        photo.size2048 = null;
      }

      return photo;
    });

    // 数据映射：将后端字段映射到前端期望的字段
    const mappedPhotos = processedPhotos.map((photo, index) => ({
      id: photo.id || `photo-random-${index}`,
      title: photo.title || photo.filename || '无标题',
      description: photo.description || '',
      thumbnail: photo.thumbnail,
      original: photo.original,
      size1024: photo.size1024,
      size2048: photo.size2048,
      filename: photo.filename,
      camera: photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机',
      film: photo.film_roll_name || photo.film_roll_number || '无',
      date: photo.taken_date || (photo.uploaded_at ? photo.uploaded_at.split(' ')[0] : '未知日期'),
      rating: photo.rating || 0,
      location_name: photo.location_name,
      photo_serial_number: photo.photo_serial_number,
      // 加密保护字段
      is_protected: photo.is_protected,
      protection_level: photo.protection_level,
      effective_protection: photo.effective_protection,
      // 图片尺寸和方向(用于前端布局计算)
      width: photo.width,
      height: photo.height,
      orientation: photo.orientation,
      // 新增的元数据字段
      country: photo.country,
      province: photo.province,
      city: photo.city,
      district: photo.district,
      township: photo.township,
      categories: photo.categories,
      trip_name: photo.trip_name,
      trip_start_date: photo.trip_start_date,
      trip_end_date: photo.trip_end_date,
      aperture: photo.aperture,
      shutter_speed: photo.shutter_speed,
      focal_length: photo.focal_length,
      iso: photo.iso,
      camera_model: photo.camera_model,
      lens_model: photo.lens_model,
      // 保留原始数据用于调试
      _raw: photo
    }));

    res.json({
      success: true,
      data: mappedPhotos,
      count: mappedPhotos.length
    });
  } catch (error) {
    console.error('获取随机照片失败:', error);
    res.status(500).json({
      success: false,
      message: '获取随机照片失败',
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
  getOriginalPhoto,
  getRandomPhotos
};
