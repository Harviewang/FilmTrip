#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { db } = require('../models/db');
const {
  ensureVariant,
  calcHashes,
  generateObjectPath,
  generateShortCode
} = require('../storage/namingService');

const DEFAULT_BUCKET = process.env.DEFAULT_BUCKET || 'local-dev';
const uploadsDir = path.join(__dirname, '../uploads');

const selectStmt = db.prepare(`
  SELECT id, filename, file_hash, storage_variant, short_code, origin_bucket, origin_path
  FROM photos
`);

const updateStmt = db.prepare(`
  UPDATE photos
     SET file_hash = ?,
         storage_variant = ?,
         short_code = ?,
         origin_bucket = ?,
         origin_path = ?
   WHERE id = ?
`);

const logErrorStmt = db.prepare(`
  INSERT INTO storage_variant_errors (photo_id, variant, message)
  VALUES (?, ?, ?)
`);

const existsShortCode = (code) => {
  const row = db.prepare('SELECT 1 FROM photos WHERE short_code = ? LIMIT 1').get(code);
  return !!row;
};

const ensureUploadExists = () => {
  if (!fs.existsSync(uploadsDir)) {
    throw new Error(`Uploads 目录不存在: ${uploadsDir}`);
  }
};

const backfill = async () => {
  ensureUploadExists();
  const photos = selectStmt.all();
  let updated = 0;
  let skipped = 0;
  let missingFiles = 0;

  for (const photo of photos) {
    const nextVariant = ensureVariant(photo.storage_variant || 'WEB');

    const localPath = photo.filename ? path.join(uploadsDir, photo.filename) : null;
    if (!localPath || !fs.existsSync(localPath)) {
      console.warn(`[WARN] 找不到文件: id=${photo.id}, filename=${photo.filename}`);
      missingFiles += 1;
      skipped += 1;
      continue;
    }

    const buffer = fs.readFileSync(localPath);
    const hashes = calcHashes(buffer);

    const conflict = db
      .prepare('SELECT id FROM photos WHERE file_hash = ? AND storage_variant = ? AND id != ? LIMIT 1')
      .get(hashes.sha256, nextVariant, photo.id);

    if (conflict) {
      console.warn(`[WARN] 哈希冲突: current=${photo.id}, conflict=${conflict.id}, hash=${hashes.sha256}`);
      logErrorStmt.run(photo.id, nextVariant, `HASH_CONFLICT:${hashes.sha256}`);
      skipped += 1;
      continue;
    }

    let shortCode = photo.short_code;
    if (!shortCode) {
      shortCode = await generateShortCode({
        exists: (code) => existsShortCode(code)
      });
    }

    const originPath = photo.origin_path || generateObjectPath({
      variant: nextVariant,
      extension: path.extname(photo.filename) || '.jpg'
    }).objectPath;

    updateStmt.run(
      hashes.sha256,
      nextVariant,
      shortCode,
      photo.origin_bucket || DEFAULT_BUCKET,
      originPath,
      photo.id
    );

    updated += 1;
  }

  console.log('--- 回填完成 ---');
  console.log(`总计扫描: ${photos.length}`);
  console.log(`已更新: ${updated}`);
  console.log(`跳过(缺失文件): ${missingFiles}`);
  console.log(`其他跳过: ${skipped - missingFiles}`);
};

backfill()
  .then(() => {
    console.log('回填任务结束');
    process.exit(0);
  })
  .catch((err) => {
    console.error('回填过程发生错误:', err);
    process.exit(1);
  });
