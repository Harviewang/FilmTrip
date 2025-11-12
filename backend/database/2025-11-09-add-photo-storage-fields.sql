-- NAMING-1 阶段：photos 表扩展与数据清洗
-- 执行前请备份 backend/data/filmtrip.db

BEGIN TRANSACTION;

-- 1. 新增命名与存储相关字段
ALTER TABLE photos ADD COLUMN file_hash TEXT;
ALTER TABLE photos ADD COLUMN storage_variant TEXT NOT NULL DEFAULT 'WEB';
ALTER TABLE photos ADD COLUMN short_code TEXT;
ALTER TABLE photos ADD COLUMN origin_bucket TEXT DEFAULT 'local-dev';
ALTER TABLE photos ADD COLUMN origin_path TEXT;
ALTER TABLE photos ADD COLUMN deleted_at TIMESTAMP NULL;

-- 2. 统一布尔值取值范围（0/1）
UPDATE photos
SET is_encrypted = CASE WHEN is_encrypted IN ('1', 'true', 'TRUE', 1) THEN 1 ELSE 0 END,
    is_private = CASE WHEN is_private IN ('1', 'true', 'TRUE', 1) THEN 1 ELSE 0 END,
    is_protected = CASE WHEN is_protected IN ('1', 'true', 'TRUE', 1) THEN 1 ELSE 0 END;

UPDATE film_rolls
SET is_encrypted = CASE WHEN is_encrypted IN ('1', 'true', 'TRUE', 1) THEN 1 ELSE 0 END,
    is_private = CASE WHEN is_private IN ('1', 'true', 'TRUE', 1) THEN 1 ELSE 0 END,
    is_protected = CASE WHEN is_protected IN ('1', 'true', 'TRUE', 1) THEN 1 ELSE 0 END;

-- 3. 建立唯一索引与辅助索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_file_hash_variant
  ON photos(file_hash, storage_variant)
  WHERE file_hash IS NOT NULL AND storage_variant IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_short_code
  ON photos(short_code)
  WHERE short_code IS NOT NULL;

-- 4. 存储枚举与哈希格式校验（SQLite 通过触发器约束）
CREATE TABLE IF NOT EXISTS storage_variant_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id TEXT,
  variant TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  message TEXT
);

CREATE TRIGGER IF NOT EXISTS trg_photos_storage_variant_insert
BEFORE INSERT ON photos
FOR EACH ROW
BEGIN
  SELECT CASE
    WHEN NEW.storage_variant IN ('RAW','WEB','THUMB','SHARE') THEN 0
    ELSE RAISE(ABORT, 'INVALID_STORAGE_VARIANT')
  END;
  SELECT CASE
    WHEN NEW.file_hash IS NULL OR LENGTH(NEW.file_hash) = 64 THEN 0
    ELSE RAISE(ABORT, 'INVALID_FILE_HASH')
  END;
  SELECT CASE
    WHEN NEW.short_code IS NULL OR LENGTH(NEW.short_code) = 5 THEN 0
    ELSE RAISE(ABORT, 'INVALID_SHORT_CODE_LENGTH')
  END;
END;

CREATE TRIGGER IF NOT EXISTS trg_photos_storage_variant_update
BEFORE UPDATE ON photos
FOR EACH ROW
BEGIN
  SELECT CASE
    WHEN NEW.storage_variant IN ('RAW','WEB','THUMB','SHARE') THEN 0
    ELSE RAISE(ABORT, 'INVALID_STORAGE_VARIANT')
  END;
  SELECT CASE
    WHEN NEW.file_hash IS NULL OR LENGTH(NEW.file_hash) = 64 THEN 0
    ELSE RAISE(ABORT, 'INVALID_FILE_HASH')
  END;
  SELECT CASE
    WHEN NEW.short_code IS NULL OR LENGTH(NEW.short_code) = 5 THEN 0
    ELSE RAISE(ABORT, 'INVALID_SHORT_CODE_LENGTH')
  END;
END;

COMMIT;

-- 回滚脚本（需单独执行）
-- BEGIN TRANSACTION;
-- DROP TRIGGER IF EXISTS trg_photos_storage_variant_insert;
-- DROP TRIGGER IF EXISTS trg_photos_storage_variant_update;
-- DROP INDEX IF EXISTS idx_photos_file_hash_variant;
-- DROP INDEX IF EXISTS idx_photos_short_code;
-- -- 注意：SQLite 不支持直接删除列，需重建表，在回滚脚本中请使用备份恢复。
-- COMMIT;
