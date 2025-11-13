const crypto = require('crypto');
const {
  generateObjectPath,
  ensureVariant
} = require('../storage/namingService');
const upyunService = require('../storage/upyunService');
const { insert, update } = require('../models/db');
const {
  createPhotoPlaceholder,
  normalizeListString,
  toNullableString
} = require('../storage/photoPlaceholderService');

const DEFAULT_MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const TRUE_VALUES = new Set(['true', '1', 'yes', 'on']);

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const normalized = value.toString().trim().toLowerCase();
  if (!normalized) return defaultValue;
  return TRUE_VALUES.has(normalized);
};

const parseInteger = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

const parseFloatNumber = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

const stringifySafe = (data) => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    return '';
  }
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const parts = forwarded.split(',');
    if (parts.length > 0) {
      return parts[0].trim();
    }
  }
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  if (req.ip) {
    return req.ip;
  }
  return '';
};

const normalizeObjectPath = (input, bucket) => {
  if (!input) return '';
  let value = input.toString().trim();
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      value = url.pathname || '';
    } catch (error) {
      // ignore parse error, keep original
    }
  }

  if (bucket) {
    const bucketPrefix = `/${bucket}`;
    if (value.startsWith(bucketPrefix + '/')) {
      value = value.slice(bucketPrefix.length + 1);
    } else if (value === bucketPrefix) {
      value = '';
    }
  }

  if (value.startsWith('/')) {
    value = value.slice(1);
  }

  return value;
};

const extractMetadata = (payload = {}) => {
  const metadata = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (key.startsWith('x-upyun-meta-')) {
      const metaKey = key.slice('x-upyun-meta-'.length);
      if (metaKey) {
        metadata[metaKey] = value;
      }
    }
  });

  const extParamRaw =
    payload['ext-param'] ||
    payload['ext_param'] ||
    payload['ext'] ||
    payload['extra'] ||
    payload['metadata'];

  if (typeof extParamRaw === 'string' && extParamRaw.trim()) {
    const raw = extParamRaw.trim();
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      parsed = null;
    }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      Object.entries(parsed).forEach(([key, value]) => {
        metadata[key] = value;
      });
    } else {
      try {
        const searchParams = new URLSearchParams(raw);
        for (const [key, value] of searchParams.entries()) {
          metadata[key] = value;
        }
      } catch (error) {
        // ignore parse error
      }
    }
  } else if (extParamRaw && typeof extParamRaw === 'object') {
    Object.entries(extParamRaw).forEach(([key, value]) => {
      metadata[key] = value;
    });
  }

  return metadata;
};

const resolveMetaValue = (metadata, payload, candidates = []) => {
  for (const key of candidates) {
    if (metadata && metadata[key] !== undefined && metadata[key] !== null && metadata[key] !== '') {
      return metadata[key];
    }
    if (payload && payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
      return payload[key];
    }
  }
  return null;
};

const determineExtension = (fileName) => {
  if (!fileName) return '.jpg';
  const match = fileName.match(/(\.[^.]+)$/);
  if (match) {
    return match[1].toLowerCase();
  }
  return '.jpg';
};

const buildSaveKey = ({ variant, extension, shortCode = null }) => {
  // 使用新的简化路径生成逻辑（减少信息泄露）
  // 优先使用shortCode生成路径，格式: {prefix}/{shortCode}.{ext}
  // 如果没有shortCode，使用hash生成路径，格式: {prefix}/{hash}.{ext}
  const { objectPath } = generateObjectPath({ variant, extension, shortCode });
  return objectPath;
};

const createPolicy = async (req, res) => {
  try {
    console.log('[Upyun] Policy request received:', {
      method: req.method,
      path: req.path,
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : []
    });

    // 检查又拍云基本配置
    if (!upyunService.isConfigured()) {
      console.log('[Upyun] UPYUN not configured');
      return res.status(500).json({
        success: false,
        message: '又拍云未配置，请联系管理员配置 UPYUN_BUCKET, UPYUN_OPERATOR, UPYUN_PASSWORD 环境变量'
      });
    }

    const body = req.body || {};
    console.log('[Upyun] Request body:', JSON.stringify(body).substring(0, 200));
    const fileNameRaw = body.fileName || body.filename || body.name || 'upload.jpg';
    const fileName = toNullableString(fileNameRaw) || 'upload.jpg';
    const mime = toNullableString(body.mime || body.mimeType || body['content-type']);
    const size = parseInteger(body.size, DEFAULT_MAX_FILE_SIZE);
    const variantInput = body.variant || body.storageVariant || 'WEB';
    const normalizedVariant = ensureVariant(variantInput);
    let effectiveVariant = normalizedVariant;
    if (body.storageVariant) {
      try {
        effectiveVariant = ensureVariant(body.storageVariant);
      } catch (error) {
        effectiveVariant = normalizedVariant;
      }
    }

    const filmRollId = toNullableString(body.film_roll_id || body.filmRollId);
    const albumId = toNullableString(body.album_id || body.albumId);
    const cameraId = toNullableString(body.camera_id || body.cameraId);
    const photoIdInput = toNullableString(body.photo_id || body.photoId);
    const title = toNullableString(body.title);
    const description = toNullableString(body.description);
    const takenDate = toNullableString(body.taken_date || body.takenDate);
    const locationName = toNullableString(body.location_name || body.locationName);
    const latitude = toNullableString(body.latitude || body.lat);
    const longitude = toNullableString(body.longitude || body.lng || body.lon);
    const tags = body.tags;
    const country = toNullableString(body.country);
    const province = toNullableString(body.province);
    const city = toNullableString(body.city);
    const district = toNullableString(body.district);
    const township = toNullableString(body.township);
    const categories = body.categories;
    const tripName = toNullableString(body.trip_name || body.tripName);
    const tripStartDate = toNullableString(body.trip_start_date || body.tripStartDate);
    const tripEndDate = toNullableString(body.trip_end_date || body.tripEndDate);
    const protectionLevel = toNullableString(body.protection_level || body.protectionLevel);
    const uploader = toNullableString(body.uploader);
    const notes = toNullableString(body.notes);
    const isProtectedFlag = parseBoolean(body.is_protected ?? body.isProtected ?? false);

    const extension = determineExtension(fileName);
    
    // 先创建照片占位符，获取shortCode，然后用shortCode生成路径（减少信息泄露）
    let photoRecord = null;
    let saveKey = null;
    const shouldCreatePhoto =
      filmRollId && parseBoolean(body.createPhoto ?? body.autoCreatePhoto ?? true);
    if (shouldCreatePhoto) {
      try {
        photoRecord = await createPhotoPlaceholder({
          filmRollId,
          cameraId,
          title,
          description,
          takenDate,
          locationName,
          latitude,
          longitude,
          tags,
          country,
          province,
          city,
          district,
          township,
          categories,
          tripName,
          tripStartDate,
          tripEndDate,
          isProtected: isProtectedFlag,
          protectionLevel,
          storageVariant: effectiveVariant,
          bucket: null, // 先不设置，等有了saveKey再更新
          saveKey: null, // 先不设置，等生成后再更新
          originalName: fileName
        });
        
        // 使用shortCode生成路径（减少信息泄露）
        // 格式: {prefix}/{shortCode}.{ext}，例如: a7/b3c8f.jpg
        saveKey = buildSaveKey({ variant: normalizedVariant, extension, shortCode: photoRecord.short_code });
        
        // 更新照片记录的origin_path
        const bucket = (upyunService.getConfig().bucket || '').trim() || null;
        if (bucket && saveKey) {
          update(`UPDATE photos SET origin_bucket = ?, origin_path = ? WHERE id = ?`, [bucket, saveKey, photoRecord.id]);
        }
      } catch (error) {
        if (error.code === 'FILM_ROLL_NOT_FOUND') {
          return res.status(400).json({ success: false, message: '胶卷实例不存在' });
        }
        if (error.code === 'FILM_ROLL_CAPACITY_FULL') {
          return res.status(400).json({ success: false, message: '胶卷已满，无法添加更多照片' });
        }
        throw error;
      }
    } else {
      // 如果没有创建照片占位符，使用hash生成路径
      saveKey = buildSaveKey({ variant: normalizedVariant, extension });
    }
    
    const bucket = (upyunService.getConfig().bucket || '').trim() || null;
    const notifyUrl = process.env.UPYUN_NOTIFY_URL || '';
    const returnUrl = process.env.UPYUN_RETURN_URL || '';
    const maxSize = Math.max(1, size || DEFAULT_MAX_FILE_SIZE);

    const metadata = {
      protected: isProtectedFlag ? '1' : '0',
      variant: effectiveVariant,
      save_key: saveKey
    };
    if (albumId) metadata.album = albumId;
    if (filmRollId) metadata.film_roll = filmRollId;
    if (cameraId) metadata.camera = cameraId;
    if (uploader) metadata.uploader = uploader;
    if (notes) metadata.note = notes;
    if (photoRecord) {
      metadata.photo = photoRecord.id;
      metadata.photo_number = photoRecord.photo_number;
      if (photoRecord.roll_number) {
        metadata.roll_number = photoRecord.roll_number;
      }
    } else if (photoIdInput) {
      metadata.photo = photoIdInput;
    }
    if (latitude) metadata.latitude = latitude;
    if (longitude) metadata.longitude = longitude;
    if (district) metadata.district = district;
    if (township) metadata.township = township;

    // 又拍云 FORM API 必须使用 policy + signature 方式
    // 如果 formApiSecret 未配置，返回错误
    if (!upyunService.isFormApiConfigured()) {
      console.log('[Upyun] Form API secret not configured');
      return res.status(500).json({
        success: false,
        message: '又拍云表单上传未配置，请联系管理员配置 UPYUN_FORM_API_SECRET 环境变量。请检查又拍云控制台的"文件密钥"设置。'
      });
    }
    
    // 使用 policy + signature 方式（FORM API 标准方式）
    const useAuthorizationHeader = false;
    
    const policy = upyunService.generatePolicy({
      saveKey,
      fileSize: maxSize,
      mime,
      notifyUrl: notifyUrl || undefined,
      returnUrl: returnUrl || undefined,
      allowFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      metadata,
      useAuthorizationHeader
    });

    const responseData = {
      ...policy,
      saveKey,
      cdnUrl: upyunService.buildCdnUrl(saveKey),
      styles: {
        thumb: upyunService.getStyleName('thumb'),
        size1024: upyunService.getStyleName('size1024'),
        size2048: upyunService.getStyleName('size2048'),
        watermark: upyunService.getStyleName('watermark')
      }
    };

    if (photoRecord) {
      responseData.photoId = photoRecord.id;
      responseData.photoNumber = photoRecord.photo_number;
      responseData.photoSerialNumber = photoRecord.photo_serial_number;
    }

    try {
      insert(
        `INSERT INTO storage_actions (
          id, action, provider, object_path, resource_url, operator, status, message, payload,
          photo_id, film_roll_id, album_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          'POLICY_CREATED',
          'UPYUN',
          saveKey,
          upyunService.buildCdnUrl(saveKey),
          uploader || null,
          'created',
          null,
          stringifySafe({
            request: body,
            metadata,
            response: responseData
          }),
          (photoRecord && photoRecord.id) || photoIdInput || null,
          filmRollId || null,
          albumId || null
        ]
      );
    } catch (logError) {
      console.warn('[Upyun] 策略日志写入失败:', logError.message);
    }

    return res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('[Upyun] 生成策略失败:', error);
    return res.status(500).json({
      success: false,
      message: '生成又拍云上传策略失败',
      error: error.message
    });
  }
};

const handleCallback = (req, res) => {
  try {
    console.log('[Upyun] 回调请求收到:', {
      method: req.method,
      path: req.originalUrl || req.path,
      headers: {
        'content-type': req.headers['content-type'],
        'x-upyun-signature': req.headers['x-upyun-signature'],
        'authorization': req.headers['authorization']
      },
      body: req.body
    });
    
    const callbackPath = (req.originalUrl || req.path || '').split('?')[0] || '/api/storage/callback';
    const verified = upyunService.verifyCallbackRequest({
      method: req.method,
      path: callbackPath,
      headers: req.headers
    });
    if (!verified) {
      console.warn('[Upyun] 回调签名校验失败:', {
        path: callbackPath,
        headers: req.headers
      });
      return res.status(403).json({ success: false, message: '签名校验失败' });
    }

    console.log('[Upyun] 回调签名校验成功');
    const payload = req.body || {};
    const metadata = extractMetadata(payload);
    console.log('[Upyun] 回调数据:', {
      payload: JSON.stringify(payload).substring(0, 500),
      metadata: JSON.stringify(metadata).substring(0, 500)
    });
    const cfg = upyunService.getConfig();
    const bucket = cfg.bucket || '';

    const objectSource =
      payload.url ||
      payload.path ||
      payload['save-key'] ||
      payload['save_key'] ||
      payload['storage-path'] ||
      payload['storage_path'] ||
      '';

    const objectPath = normalizeObjectPath(objectSource, bucket);
    const cdnUrl = objectPath ? upyunService.buildCdnUrl(objectPath) : null;
    const fileSize = parseInteger(
      payload.file_size ||
        payload['file-size'] ||
        payload.size ||
        payload['content-length'] ||
        payload.length
    );
    const fileMd5 =
      resolveMetaValue(metadata, payload, ['file_md5', 'file-md5', 'md5']) || '';
    const fileHash =
      resolveMetaValue(metadata, payload, ['file_sha1', 'file-sha1', 'sha1', 'hash']) || '';
    const mimeType =
      payload['content-type'] ||
      payload.content_type ||
      payload.mime ||
      payload.mimetype ||
      payload['mime-type'] ||
      resolveMetaValue(metadata, payload, ['mime', 'mime_type', 'contentType']) ||
      '';
    const status = payload.status || metadata.status || 'uploaded';
    const operator =
      payload.operator ||
      payload['x-upyun-operator'] ||
      req.headers['x-upyun-operator'] ||
      metadata.operator ||
      '';
    const message = payload.message || payload.error || payload.err || '';

    const photoIdRaw = resolveMetaValue(metadata, payload, [
      'photo',
      'photo_id',
      'photoId',
      'photoID',
      'photo-id'
    ]);
    const albumIdRaw = resolveMetaValue(metadata, payload, [
      'album',
      'album_id',
      'albumId'
    ]);
    const filmRollIdRaw = resolveMetaValue(metadata, payload, [
      'film_roll',
      'filmRoll',
      'film_roll_id',
      'filmRollId',
      'roll_id'
    ]);
    const storageVariantRaw = resolveMetaValue(metadata, payload, [
      'variant',
      'storage_variant',
      'storageVariant'
    ]);

    const photoId = typeof photoIdRaw === 'string' ? photoIdRaw.trim() : photoIdRaw || null;
    const albumId = typeof albumIdRaw === 'string' ? albumIdRaw.trim() : albumIdRaw || null;
    const filmRollId =
      typeof filmRollIdRaw === 'string' ? filmRollIdRaw.trim() : filmRollIdRaw || null;

    let normalizedVariant = null;
    if (storageVariantRaw) {
      try {
        normalizedVariant = ensureVariant(storageVariantRaw);
      } catch (error) {
        normalizedVariant = null;
      }
    }

    const imageWidth = parseInteger(
      resolveMetaValue(metadata, payload, ['image-width', 'image_width', 'width'])
    );
    const imageHeight = parseInteger(
      resolveMetaValue(metadata, payload, ['image-height', 'image_height', 'height'])
    );
    const latitude = parseFloatNumber(
      resolveMetaValue(metadata, payload, ['latitude', 'lat'])
    );
    const longitude = parseFloatNumber(
      resolveMetaValue(metadata, payload, ['longitude', 'lng', 'lon'])
    );
    const takenDate = resolveMetaValue(metadata, payload, ['taken_date', 'taken-date', 'date']);

    const sourceIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';

    const extra = stringifySafe({
      headers: req.headers,
      body: payload,
      metadata
    });

    if (objectPath) {
      try {
        insert(
          `INSERT INTO storage_files (
            id, bucket, object_path, cdn_url, file_size, file_md5, file_hash,
            mime_type, operator, source_ip, user_agent, status, extra,
            photo_id, film_roll_id, album_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(object_path) DO UPDATE SET
            bucket = excluded.bucket,
            cdn_url = excluded.cdn_url,
            file_size = excluded.file_size,
            file_md5 = excluded.file_md5,
            file_hash = excluded.file_hash,
            mime_type = excluded.mime_type,
            operator = excluded.operator,
            source_ip = excluded.source_ip,
            user_agent = excluded.user_agent,
            status = excluded.status,
            extra = excluded.extra,
            photo_id = excluded.photo_id,
            film_roll_id = excluded.film_roll_id,
            album_id = excluded.album_id,
            updated_at = CURRENT_TIMESTAMP
        `,
          [
            crypto.randomUUID(),
            bucket || null,
            objectPath,
            cdnUrl,
            fileSize,
            fileMd5 || null,
            fileHash || null,
            mimeType || null,
            operator || null,
            sourceIp || null,
            userAgent || null,
            status || 'uploaded',
            extra,
            photoId || null,
            filmRollId || null,
            albumId || null
          ]
        );
      } catch (dbError) {
        console.error('[Upyun] 存储文件记录失败:', dbError.message);
      }
    }

    if (photoId) {
      const photoUpdates = [];
      const photoParams = [];
      if (bucket) {
        photoUpdates.push('origin_bucket = ?');
        photoParams.push(bucket);
      }
      if (objectPath) {
        photoUpdates.push('origin_path = ?');
        photoParams.push(objectPath);
      }
      if (normalizedVariant) {
        photoUpdates.push('storage_variant = ?');
        photoParams.push(normalizedVariant);
      }
      if (fileHash && fileHash.length === 64) {
        photoUpdates.push('file_hash = ?');
        photoParams.push(fileHash);
      }
      if (imageWidth) {
        photoUpdates.push('width = ?');
        photoParams.push(imageWidth);
      }
      if (imageHeight) {
        photoUpdates.push('height = ?');
        photoParams.push(imageHeight);
      }
      if (latitude !== null) {
        photoUpdates.push('latitude = ?');
        photoParams.push(latitude);
      }
      if (longitude !== null) {
        photoUpdates.push('longitude = ?');
        photoParams.push(longitude);
      }
      if (takenDate) {
        photoUpdates.push('taken_date = ?');
        photoParams.push(takenDate);
      }
      if (photoUpdates.length > 0) {
        photoUpdates.push('updated_at = CURRENT_TIMESTAMP');
        photoParams.push(photoId);
        try {
          // 先校验 photo_id 是否存在，避免更新不存在的记录
          const existingPhoto = query('SELECT id FROM photos WHERE id = ?', [photoId]);
          if (existingPhoto.length === 0) {
            console.warn(`[Upyun] 回调中的 photo_id 不存在: ${photoId}, object_path: ${objectPath || 'N/A'}`);
            // 记录告警到 storage_actions
            try {
              insert(
                `INSERT INTO storage_actions (id, action, provider, object_path, resource_url, operator, status, message, payload, photo_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  crypto.randomUUID(),
                  'UPLOAD_CALLBACK_WARNING',
                  'UPYUN',
                  objectPath || null,
                  cdnUrl || null,
                  operator || null,
                  'warning',
                  `photo_id不存在: ${photoId}`,
                  stringifySafe({ photo_id: photoId, metadata, payload }),
                  photoId
                ]
              );
            } catch (logError) {
              console.error('[Upyun] 警告日志写入失败:', logError.message);
            }
          } else {
            // photo_id 存在，执行更新
            update(
              `UPDATE photos SET ${photoUpdates.join(', ')} WHERE id = ?`,
              photoParams
            );
            console.log(`[Upyun] 照片记录已更新: photo_id=${photoId}, object_path=${objectPath || 'N/A'}`);
          }
        } catch (dbError) {
          console.error('[Upyun] 更新照片记录失败:', dbError.message);
        }
      }
    }

    try {
      insert(
        `INSERT INTO storage_actions (id, action, provider, object_path, resource_url, operator, status, message, payload, photo_id, film_roll_id, album_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          'UPLOAD_CALLBACK',
          'UPYUN',
          objectPath || null,
          cdnUrl || null,
          operator || null,
          status || 'uploaded',
          message || null,
          extra,
          photoId || null,
          filmRollId || null,
          albumId || null
        ]
      );
    } catch (dbError) {
      console.warn('[Upyun] 回调日志入库失败:', dbError.message);
    }

    return res.json({ success: true, message: '回调处理成功' });
  } catch (error) {
    console.error('[Upyun] 处理回调失败:', error);
    return res.status(500).json({
      success: false,
      message: '处理回调失败',
      error: error.message
    });
  }
};

const getProtectedUrl = (req, res) => {
  try {
    if (!upyunService.isConfigured()) {
      return res.status(500).json({
        success: false,
        message: '又拍云未配置'
      });
    }
    const { path, expiresIn = 300, style, useCdn = false } = req.query || {};
    if (!path) {
      return res.status(400).json({
        success: false,
        message: '缺少 path 参数'
      });
    }
    const signedUrl = upyunService.generateSignedUrl(path, {
      expiresIn: parseInt(expiresIn, 10) || 300,
      style,
      useCdn: parseBoolean(useCdn)
    });
    return res.json({
      success: true,
      data: {
        signedUrl,
        expiresIn: parseInt(expiresIn, 10) || 300
      }
    });
  } catch (error) {
    console.error('[Upyun] 获取签名地址失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取签名地址失败',
      error: error.message
    });
  }
};

const purgeCache = async (req, res) => {
  try {
    if (!upyunService.isConfigured()) {
      return res.status(500).json({
        success: false,
        message: '又拍云未配置'
      });
    }
    const { paths = [], useRaw = false } = req.body || {};
    if (!Array.isArray(paths) || paths.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供待刷新路径数组 paths'
      });
    }
    const cfg = upyunService.getConfig();
    const rawMode = parseBoolean(useRaw);
    const urls = paths
      .map((item) => {
        const value = (item || '').toString().trim();
        if (!value) return null;
        if (/^https?:\/\//i.test(value)) {
          return value;
        }
        const objectPath = normalizeObjectPath(value, cfg.bucket);
        if (!objectPath) return null;
        if (rawMode) {
          const resourcePath = upyunService.buildResourcePath(objectPath);
          return `${upyunService.getBucketDomain()}${resourcePath}`;
        }
        return upyunService.buildCdnUrl(objectPath);
      })
      .filter(Boolean);
    const result = await upyunService.purgeUrls(urls);

    try {
      insert(
        `INSERT INTO storage_actions (id, action, provider, status, payload)
         VALUES (?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          'PURGE_REQUEST',
          'UPYUN',
          'submitted',
          stringifySafe({ paths, resolvedUrls: urls, useRaw: rawMode, response: result })
        ]
      );
    } catch (dbError) {
      console.warn('[Upyun] 刷新日志写入失败:', dbError.message);
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Upyun] 刷新缓存失败:', error);
    return res.status(500).json({
      success: false,
      message: '刷新缓存失败',
      error: error.message
    });
  }
};

module.exports = {
  createPolicy,
  handleCallback,
  getProtectedUrl,
  purgeCache
};

