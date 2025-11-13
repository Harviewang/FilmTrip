const betterSqlite3 = require('better-sqlite3');
const path = require('path');

// 数据库连接
const dbPath = path.join(__dirname, '../data/filmtrip.db');
const db = betterSqlite3(dbPath);

// 数据库初始化
const initialize = () => {
  try {
    // 创建用户表
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

                // 创建胶卷品类表
            db.exec(`
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
            `);

                // 创建相机表
            db.exec(`
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
            `);

    // 创建扫描仪表
    db.exec(`
      CREATE TABLE IF NOT EXISTS scanners (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        model TEXT NOT NULL,
        type TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

                // 创建胶卷实例表
            db.exec(`
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
                is_encrypted BOOLEAN DEFAULT 0,
                is_private BOOLEAN DEFAULT 0,
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
            `);

    // 创建照片表
    db.exec(`
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
        is_encrypted BOOLEAN DEFAULT 0,
        is_private BOOLEAN DEFAULT 0,
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
    `);

    db.exec(`
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
    `);

    db.exec(`
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
    `);

    // 创建索引优化查询性能
    try {
      db.exec(`
        -- photos表的latitude和longitude索引（用于地图标点查询）
        CREATE INDEX IF NOT EXISTS idx_photos_latitude ON photos(latitude);
        CREATE INDEX IF NOT EXISTS idx_photos_longitude ON photos(longitude);
        
        -- 复合索引：用于地图边界查询（latitude BETWEEN ... AND longitude BETWEEN ...）
        CREATE INDEX IF NOT EXISTS idx_photos_lat_lng ON photos(latitude, longitude);
        
        -- 优化：taken_date索引（如果ORDER BY taken_date需要）
        CREATE INDEX IF NOT EXISTS idx_photos_taken_date ON photos(taken_date DESC);
        
        -- 命名与存储规范相关索引
        CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_file_hash_variant
          ON photos(file_hash, storage_variant)
          WHERE file_hash IS NOT NULL AND storage_variant IS NOT NULL;

        CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_short_code
          ON photos(short_code)
          WHERE short_code IS NOT NULL;

        CREATE INDEX IF NOT EXISTS idx_storage_actions_created_at
          ON storage_actions(created_at);

        CREATE INDEX IF NOT EXISTS idx_storage_actions_action
          ON storage_actions(action);

        CREATE INDEX IF NOT EXISTS idx_storage_actions_photo_id
          ON storage_actions(photo_id);

        CREATE INDEX IF NOT EXISTS idx_storage_actions_film_roll_id
          ON storage_actions(film_roll_id);

        CREATE INDEX IF NOT EXISTS idx_storage_files_object_path
          ON storage_files(object_path);

        CREATE INDEX IF NOT EXISTS idx_storage_files_file_hash
          ON storage_files(file_hash);

        CREATE INDEX IF NOT EXISTS idx_storage_files_photo_id
          ON storage_files(photo_id);

        CREATE INDEX IF NOT EXISTS idx_storage_files_film_roll_id
          ON storage_files(film_roll_id);

        -- 命名与存储规范错误记录表
        CREATE TABLE IF NOT EXISTS storage_variant_errors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          photo_id TEXT,
          variant TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          message TEXT
        );

        -- 重新创建存储变体与短链触发器约束
        DROP TRIGGER IF EXISTS trg_photos_storage_variant_insert;
        DROP TRIGGER IF EXISTS trg_photos_storage_variant_update;

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
      `);
      console.log('地图相关索引创建成功');
    } catch (indexError) {
      console.warn('创建索引时出错（可能已存在）:', indexError.message);
    }

    console.log('数据库初始化成功');
    
    // 创建默认管理员用户
    try {
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      
      // 检查是否已存在admin用户
      const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').all(['admin']);
      
      if (existingAdmin.length === 0) {
        // 创建默认管理员用户
        const adminId = uuidv4();
        const hashedPassword = bcrypt.hashSync('admin123', 12);
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        db.prepare('INSERT INTO users (id, username, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(
          [adminId, 'admin', hashedPassword, now, now]
        );
        
        console.log('默认管理员用户创建成功: admin/admin123');
      } else {
        console.log('默认管理员用户已存在');
      }

    } catch (error) {
      console.error('创建默认管理员用户失败:', error.message);
    }

    // 数据库迁移：添加缺失的字段
    try {
      // 检查并添加 camera_name 字段
      const cameraNameExists = db.prepare("PRAGMA table_info(film_rolls)").all()
        .some(column => column.name === 'camera_name');
      if (!cameraNameExists) {
        db.exec('ALTER TABLE film_rolls ADD COLUMN camera_name TEXT');
        console.log('已添加 camera_name 字段到 film_rolls 表');
      }

      // 检查并添加 finished_date 字段
      const finishedDateExists = db.prepare("PRAGMA table_info(film_rolls)").all()
        .some(column => column.name === 'finished_date');
      if (!finishedDateExists) {
        db.exec('ALTER TABLE film_rolls ADD COLUMN finished_date TEXT');
        console.log('已添加 finished_date 字段到 film_rolls 表');
      }

      const nameExists = db.prepare("PRAGMA table_info(film_rolls)").all()
        .some(column => column.name === 'name');
      if (!nameExists) {
        db.exec("ALTER TABLE film_rolls ADD COLUMN name TEXT DEFAULT ''");
        db.exec("UPDATE film_rolls SET name = roll_number WHERE name = '' OR name IS NULL");
        console.log('已添加 name 字段到 film_rolls 表并回填');
      }

      // 添加 is_private 到 film_rolls（若不存在）
      const rollPrivateExists = db.prepare("PRAGMA table_info(film_rolls)").all()
        .some(column => column.name === 'is_private');
      if (!rollPrivateExists) {
        db.exec('ALTER TABLE film_rolls ADD COLUMN is_private BOOLEAN DEFAULT 0');
        console.log('已添加 is_private 字段到 film_rolls 表');
      }

      // 添加 is_private 到 photos（若不存在）
      const photoPrivateExists = db.prepare("PRAGMA table_info(photos)").all()
        .some(column => column.name === 'is_private');
      if (!photoPrivateExists) {
        db.exec('ALTER TABLE photos ADD COLUMN is_private BOOLEAN DEFAULT 0');
        console.log('已添加 is_private 字段到 photos 表');
      }

      // 添加增强的元数据字段
      const metadataFields = [
        { name: 'camera_model', type: 'TEXT' },
        { name: 'lens_model', type: 'TEXT' },
        { name: 'lens_focal_length', type: 'TEXT' },
        { name: 'exposure_compensation', type: 'TEXT' },
        { name: 'metering_mode', type: 'TEXT' },
        { name: 'focus_mode', type: 'TEXT' },
        { name: 'country', type: 'TEXT' },
        { name: 'province', type: 'TEXT' },
        { name: 'city', type: 'TEXT' },
        { name: 'categories', type: 'TEXT' },
        { name: 'trip_name', type: 'TEXT' },
        { name: 'trip_start_date', type: 'TEXT' },
        { name: 'trip_end_date', type: 'TEXT' }
      ];

      const existingColumns = db.prepare("PRAGMA table_info(photos)").all()
        .map(column => column.name);

      metadataFields.forEach(field => {
        if (!existingColumns.includes(field.name)) {
          db.exec(`ALTER TABLE photos ADD COLUMN ${field.name} ${field.type}`);
          console.log(`已添加 ${field.name} 字段到 photos 表`);
        }
      });

      const storageFields = [
        { name: 'file_hash', type: 'TEXT' },
        { name: 'storage_variant', type: "TEXT DEFAULT 'WEB'" },
        { name: 'short_code', type: 'TEXT' },
        { name: 'origin_bucket', type: "TEXT DEFAULT 'local-dev'" },
        { name: 'origin_path', type: 'TEXT' },
        { name: 'deleted_at', type: 'TIMESTAMP' }
      ];

      storageFields.forEach(field => {
        if (!existingColumns.includes(field.name)) {
          db.exec(`ALTER TABLE photos ADD COLUMN ${field.name} ${field.type}`);
          console.log(`已添加 ${field.name} 字段到 photos 表`);
        }
      });

      if (!existingColumns.includes('storage_variant')) {
        db.exec("UPDATE photos SET storage_variant = 'WEB' WHERE storage_variant IS NULL");
        console.log('已回填 storage_variant 默认值 WEB');
      }

      // 2025-10-23 添加照片尺寸和方向相关字段
      const sizeOrientationFields = [
        { name: 'width', type: 'INTEGER' },
        { name: 'height', type: 'INTEGER' },
        { name: 'orientation', type: 'INTEGER DEFAULT 1' },
        { name: 'rotation', type: 'INTEGER DEFAULT 0' }
      ];

      sizeOrientationFields.forEach(field => {
        if (!existingColumns.includes(field.name)) {
          db.exec(`ALTER TABLE photos ADD COLUMN ${field.name} ${field.type}`);
          console.log(`已添加 ${field.name} 字段到 photos 表`);
        }
      });

      // 2025-10-23 添加照片保护相关字段
      const protectionFields = [
        { name: 'is_protected', type: 'INTEGER DEFAULT 0' },
        { name: 'protection_level', type: 'INTEGER DEFAULT 0' }
      ];

      protectionFields.forEach(field => {
        if (!existingColumns.includes(field.name)) {
          db.exec(`ALTER TABLE photos ADD COLUMN ${field.name} ${field.type}`);
          console.log(`已添加 ${field.name} 字段到 photos 表`);
        }
      });

      // 添加胶卷保护相关字段
      const rollColumns = db.prepare("PRAGMA table_info(film_rolls)").all()
        .map(column => column.name);

      const rollProtectionFields = [
        { name: 'is_protected', type: 'INTEGER DEFAULT 0' },
        { name: 'protection_level', type: 'INTEGER DEFAULT 0' }
      ];

      rollProtectionFields.forEach(field => {
        if (!rollColumns.includes(field.name)) {
          db.exec(`ALTER TABLE film_rolls ADD COLUMN ${field.name} ${field.type}`);
          console.log(`已添加 ${field.name} 字段到 film_rolls 表`);
        }
      });

    } catch (migrationError) {
      console.error('数据库迁移失败:', migrationError);
    }

  } catch (error) {
    console.error('数据库初始化失败:', error.message);
  }
};

// 通用查询方法
const query = (sql, params = []) => {
  return db.prepare(sql).all(params);
};

// 通用插入方法
const insert = (sql, params = []) => {
  return db.prepare(sql).run(params);
};

// 通用更新方法
const update = (sql, params = []) => {
  return db.prepare(sql).run(params);
};

// 通用删除方法
const deleteRecord = (sql, params = []) => {
  return db.prepare(sql).run(params);
};

module.exports = {
  db,
  initialize,
  query,
  insert,
  update,
  delete: deleteRecord
};
