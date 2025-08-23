const betterSqlite3 = require('better-sqlite3');
const path = require('path');

// 数据库连接
const dbPath = path.join(__dirname, '../database.sqlite');
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
                location TEXT,
                camera_id TEXT,
                developed_date TEXT,
                developer TEXT,
                development_method TEXT,
                scanner_id TEXT,
                is_encrypted BOOLEAN DEFAULT 0,
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
        aperture TEXT,
        shutter_speed TEXT,
        focal_length TEXT,
        iso INTEGER,
        latitude REAL,
        longitude REAL,
        location_name TEXT,
        rating INTEGER DEFAULT 0,
        is_encrypted BOOLEAN DEFAULT 0,
        tags TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (film_roll_id) REFERENCES film_rolls(id),
        FOREIGN KEY (camera_id) REFERENCES cameras(id)
      );
    `);

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
