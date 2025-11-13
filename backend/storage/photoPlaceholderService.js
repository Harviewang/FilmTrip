const crypto = require('crypto');
const path = require('path');
const { ensureVariant, generateShortCode } = require('./namingService');
const { query, insert, update } = require('../models/db');

const padPhotoNumber = (num) => num.toString().padStart(3, '0');

const toNullableString = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  return null;
};

const normalizeListString = (value) => {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) {
    return value
      .map((item) => (item === undefined || item === null ? '' : item.toString().trim()))
      .filter((item) => item.length > 0)
      .join(',');
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  return null;
};

const createPhotoPlaceholder = async ({
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
  isProtected,
  protectionLevel,
  storageVariant,
  bucket,
  saveKey,
  originalName
}) => {
  const filmRollRows = query('SELECT id, roll_number, name FROM film_rolls WHERE id = ?', [filmRollId]);
  if (!filmRollRows || filmRollRows.length === 0) {
    const error = new Error('胶卷实例不存在');
    error.code = 'FILM_ROLL_NOT_FOUND';
    throw error;
  }
  const filmRoll = filmRollRows[0];

  const maxPerRoll = 36;
  const countRow = query('SELECT COUNT(*) as cnt FROM photos WHERE film_roll_id = ?', [filmRollId]);
  const existingCount = countRow[0]?.cnt || 0;
  if (existingCount >= maxPerRoll) {
    const error = new Error('胶卷已满，无法添加更多照片');
    error.code = 'FILM_ROLL_CAPACITY_FULL';
    throw error;
  }

  const lastPhoto = query(
    'SELECT photo_number FROM photos WHERE film_roll_id = ? ORDER BY photo_number DESC LIMIT 1',
    [filmRollId]
  );
  const nextNumber = lastPhoto.length > 0 ? lastPhoto[0].photo_number + 1 : 1;

  const id = crypto.randomUUID();
  const shortCode = await generateShortCode({
    exists: (code) => query('SELECT 1 FROM photos WHERE short_code = ?', [code]).length > 0
  });
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const baseName = toNullableString(path.basename(saveKey || originalName || `${id}.jpg`)) || `${id}.jpg`;
  const resolvedVariant = ensureVariant(storageVariant || 'WEB');
  const isProtectedFlag = isProtected ? 1 : 0;
  const protectionLevelValue = isProtectedFlag ? toNullableString(protectionLevel) : null;

  insert(
    `INSERT INTO photos (
      id, film_roll_id, photo_number, filename, original_name, title, description,
      taken_date, camera_id, location_name, country, province, city, district, township,
      categories, trip_name, trip_start_date, trip_end_date,
      tags, is_protected, protection_level,
      storage_variant, short_code, origin_bucket, origin_path,
      uploaded_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      filmRollId,
      nextNumber,
      baseName,
      toNullableString(originalName) || baseName,
      toNullableString(title) || baseName,
      toNullableString(description),
      toNullableString(takenDate),
      toNullableString(cameraId),
      toNullableString(locationName),
      toNullableString(country),
      toNullableString(province),
      toNullableString(city),
      toNullableString(district),
      toNullableString(township),
      normalizeListString(categories),
      toNullableString(tripName),
      toNullableString(tripStartDate),
      toNullableString(tripEndDate),
      normalizeListString(tags),
      isProtectedFlag,
      protectionLevelValue,
      resolvedVariant,
      shortCode,
      bucket || null, // 占位符阶段，设置 origin_bucket 为 bucket（如果提供）
      saveKey || null, // 占位符阶段，设置 origin_path 为 saveKey，这样可以在回调前显示图片
      now,
      now
    ]
  );

  const photoSerialNumber = filmRoll.roll_number
    ? `${filmRoll.roll_number}-${padPhotoNumber(nextNumber)}`
    : null;

  const optionalUpdates = [];
  const optionalParams = [];

  if (latitude !== undefined && latitude !== null && latitude !== '') {
    optionalUpdates.push('latitude = ?');
    optionalParams.push(Number(latitude));
  }
  if (longitude !== undefined && longitude !== null && longitude !== '') {
    optionalUpdates.push('longitude = ?');
    optionalParams.push(Number(longitude));
  }

  if (optionalUpdates.length > 0) {
    optionalUpdates.push('updated_at = CURRENT_TIMESTAMP');
    optionalParams.push(id);
    update(`UPDATE photos SET ${optionalUpdates.join(', ')} WHERE id = ?`, optionalParams);
  }

  return {
    id,
    photo_number: nextNumber,
    short_code: shortCode,
    photo_serial_number: photoSerialNumber,
    roll_number: filmRoll.roll_number
  };
};

module.exports = {
  createPhotoPlaceholder,
  normalizeListString,
  toNullableString,
  padPhotoNumber
};

