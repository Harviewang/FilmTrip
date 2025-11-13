-- PostgreSQL表结构迁移脚本
-- 从SQLite迁移到PostgreSQL
-- 执行方法: psql $DATABASE_URL < migrate-to-postgresql-schema.sql
-- 或者使用: node scripts/migrate-to-postgresql-schema.js

-- 开始事务
BEGIN;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. 胶卷品类表
-- ============================================
CREATE TABLE IF NOT EXISTS film_stocks (
  id TEXT PRIMARY KEY,
  stock_serial_number TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  series TEXT NOT NULL,
  iso INTEGER NOT NULL,
  format TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  package_image TEXT,
  cartridge_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. 相机表
-- ============================================
CREATE TABLE IF NOT EXISTS cameras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  brand TEXT,
  type TEXT,
  format TEXT,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. 扫描仪表
-- ============================================
CREATE TABLE IF NOT EXISTS scanners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. 胶卷实例表
-- ============================================
CREATE TABLE IF NOT EXISTS film_rolls (
  id TEXT PRIMARY KEY,
  film_stock_id TEXT NOT NULL,
  roll_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  opened_date TEXT,
  finished_date TEXT,
  location TEXT,
  camera_id TEXT,
  camera_name TEXT,
  developed_date TEXT,
  developer TEXT,
  development_method TEXT,
  scanner_id TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_protected INTEGER DEFAULT 0,
  protection_level INTEGER DEFAULT 0,
  status TEXT DEFAULT '未启封',
  notes TEXT,
  package_image TEXT,
  cartridge_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (film_stock_id) REFERENCES film_stocks(id),
  FOREIGN KEY (camera_id) REFERENCES cameras(id),
  FOREIGN KEY (scanner_id) REFERENCES scanners(id)
);

-- ============================================
-- 6. 照片表
-- ============================================
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  film_roll_id TEXT NOT NULL,
  photo_number INTEGER,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  taken_date TEXT,
  camera_id TEXT,
  camera_model TEXT,
  lens_model TEXT,
  lens_focal_length TEXT,
  aperture TEXT,
  shutter_speed TEXT,
  focal_length TEXT,
  iso INTEGER,
  exposure_compensation TEXT,
  metering_mode TEXT,
  focus_mode TEXT,
  latitude REAL,
  longitude REAL,
  location_name TEXT,
  country TEXT,
  province TEXT,
  city TEXT,
  district TEXT,
  street TEXT,
  township TEXT,
  rating INTEGER DEFAULT 0,
  categories TEXT,
  trip_name TEXT,
  trip_start_date TEXT,
  trip_end_date TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_protected INTEGER DEFAULT 0,
  protection_level TEXT DEFAULT NULL,
  tags TEXT,
  width INTEGER,
  height INTEGER,
  orientation INTEGER DEFAULT 1,
  rotation INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_hash TEXT,
  storage_variant TEXT NOT NULL DEFAULT 'WEB',
  short_code TEXT,
  origin_bucket TEXT DEFAULT 'local-dev',
  origin_path TEXT,
  deleted_at TIMESTAMP,
  FOREIGN KEY (film_roll_id) REFERENCES film_rolls(id),
  FOREIGN KEY (camera_id) REFERENCES cameras(id)
);

-- ============================================
-- 7. 存储操作记录表
-- ============================================
CREATE TABLE IF NOT EXISTS storage_actions (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  provider TEXT NOT NULL,
  object_path TEXT,
  resource_url TEXT,
  operator TEXT,
  status TEXT DEFAULT 'logged',
  message TEXT,
  payload TEXT,
  photo_id TEXT,
  film_roll_id TEXT,
  album_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. 存储文件记录表
-- ============================================
CREATE TABLE IF NOT EXISTS storage_files (
  id TEXT PRIMARY KEY,
  bucket TEXT,
  object_path TEXT NOT NULL UNIQUE,
  cdn_url TEXT,
  file_size INTEGER,
  file_md5 TEXT,
  file_hash TEXT,
  mime_type TEXT,
  operator TEXT,
  source_ip TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'uploaded',
  extra TEXT,
  photo_id TEXT,
  film_roll_id TEXT,
  album_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. 存储变体错误记录表
-- ============================================
CREATE TABLE IF NOT EXISTS storage_variant_errors (
  id SERIAL PRIMARY KEY,
  photo_id TEXT,
  variant TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  message TEXT
);

-- ============================================
-- 索引创建
-- ============================================

-- Photos表索引
CREATE INDEX IF NOT EXISTS idx_photos_film_roll_id ON photos(film_roll_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_taken_date ON photos(taken_date DESC);
CREATE INDEX IF NOT EXISTS idx_photos_camera_id ON photos(camera_id);
CREATE INDEX IF NOT EXISTS idx_photos_latitude ON photos(latitude);
CREATE INDEX IF NOT EXISTS idx_photos_longitude ON photos(longitude);
CREATE INDEX IF NOT EXISTS idx_photos_lat_lng ON photos(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_photos_short_code ON photos(short_code) WHERE short_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_photos_storage_variant ON photos(storage_variant);
CREATE INDEX IF NOT EXISTS idx_photos_origin_bucket ON photos(origin_bucket);

-- Film Rolls表索引
CREATE INDEX IF NOT EXISTS idx_film_rolls_film_stock_id ON film_rolls(film_stock_id);
CREATE INDEX IF NOT EXISTS idx_film_rolls_status ON film_rolls(status);
CREATE INDEX IF NOT EXISTS idx_film_rolls_camera_id ON film_rolls(camera_id);
CREATE INDEX IF NOT EXISTS idx_film_rolls_scanner_id ON film_rolls(scanner_id);

-- Storage Actions表索引
CREATE INDEX IF NOT EXISTS idx_storage_actions_created_at ON storage_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_storage_actions_action ON storage_actions(action);
CREATE INDEX IF NOT EXISTS idx_storage_actions_photo_id ON storage_actions(photo_id);
CREATE INDEX IF NOT EXISTS idx_storage_actions_film_roll_id ON storage_actions(film_roll_id);

-- Storage Files表索引
CREATE INDEX IF NOT EXISTS idx_storage_files_object_path ON storage_files(object_path);
CREATE INDEX IF NOT EXISTS idx_storage_files_file_hash ON storage_files(file_hash);
CREATE INDEX IF NOT EXISTS idx_storage_files_photo_id ON storage_files(photo_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_film_roll_id ON storage_files(film_roll_id);

-- 唯一索引（PostgreSQL使用WHERE子句创建部分唯一索引）
CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_file_hash_variant 
  ON photos(file_hash, storage_variant) 
  WHERE file_hash IS NOT NULL AND storage_variant IS NOT NULL;

-- ============================================
-- 约束检查（PostgreSQL中使用CHECK约束替代SQLite的触发器）
-- ============================================

-- Storage Variant约束
ALTER TABLE photos 
  DROP CONSTRAINT IF EXISTS chk_photos_storage_variant;

ALTER TABLE photos 
  ADD CONSTRAINT chk_photos_storage_variant 
  CHECK (storage_variant IN ('RAW', 'WEB', 'THUMB', 'SHARE'));

-- File Hash约束（如果提供，必须是64字符）
ALTER TABLE photos 
  DROP CONSTRAINT IF EXISTS chk_photos_file_hash;

ALTER TABLE photos 
  ADD CONSTRAINT chk_photos_file_hash 
  CHECK (file_hash IS NULL OR LENGTH(file_hash) = 64);

-- Short Code约束（如果提供，必须是5字符）
ALTER TABLE photos 
  DROP CONSTRAINT IF EXISTS chk_photos_short_code;

ALTER TABLE photos 
  ADD CONSTRAINT chk_photos_short_code 
  CHECK (short_code IS NULL OR LENGTH(short_code) = 5);

-- 提交事务
COMMIT;

-- 输出成功信息
\echo '✅ PostgreSQL表结构迁移完成！'

