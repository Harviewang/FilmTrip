-- 创建胶卷表 (SQLite兼容版本)
CREATE TABLE IF NOT EXISTS film_rolls (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  iso INTEGER NOT NULL,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT DEFAULT 'unexposed',
  exposure_count INTEGER DEFAULT 36,
  exposed_count INTEGER DEFAULT 0,
  date TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 插入测试数据
INSERT INTO film_rolls (id, name, brand, iso, type, format, status, exposure_count, exposed_count, date, location, description) VALUES
('roll-001', 'Kodak 200', 'Kodak', 200, 'Color Negative', '35mm', 'exposed', 36, 36, '2025-01-15', '北京', '全球旅行胶卷，色彩鲜艳'),
('roll-002', 'Kodak Professional PORTRA 160', 'Kodak Professional', 160, 'Color Negative', '35mm', 'exposed', 36, 36, '2025-01-10', '上海', '人像摄影专用，肤色还原优秀'),
('roll-003', 'ILFORD PAN 400', 'ILFORD', 400, 'Black & White', '35mm', 'exposed', 36, 36, '2024-12-20', '深圳', '黑白摄影，对比度强烈'),
('roll-004', 'Fujifilm Superia 400', 'Fujifilm', 400, 'Color Negative', '35mm', 'unexposed', 36, 0, '2024-12-15', '广州', '日常拍摄，性价比高'),
('roll-005', 'Kodak Ektachrome 100', 'Kodak', 100, 'Slide', '35mm', 'exposed', 36, 36, '2024-12-10', '杭州', '反转片，色彩饱和度高');

-- 创建照片表
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
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (film_roll_id) REFERENCES film_rolls(id)
);

-- 插入测试照片数据
INSERT INTO photos (id, film_roll_id, photo_number, filename, original_name, title, description, taken_date, aperture, shutter_speed, focal_length, iso, latitude, longitude, location_name, rating, tags) VALUES
('photo-001', 'roll-001', 1, '169d5c88-15c0-452e-9958-0f850dcf8dd9_001.JPG', '169d5c88-15c0-452e-9958-0f850dcf8dd9_001.JPG', '北京街景', '北京城市风光', '2025-01-15', 'f/2.8', '1/125', '50mm', 200, 39.9042, 116.4074, '北京', 4, '城市,风景'),
('photo-002', 'roll-001', 2, '2424f90a-1ef7-4843-bfb9-3e0668276eda_002.JPG', '2424f90a-1ef7-4843-bfb9-3e0668276eda_002.JPG', '北京建筑', '北京现代建筑', '2025-01-15', 'f/4.0', '1/60', '35mm', 400, 39.9042, 116.4074, '北京', 5, '建筑,城市'),
('photo-003', 'roll-002', 1, '2ba64d10-dafb-40c9-9f9a-f0c525b7d19e_003.JPG', '2ba64d10-dafb-40c9-9f9a-f0c525b7d19e_003.JPG', '上海夜景', '上海外滩夜景', '2025-01-10', 'f/5.6', '1/250', '85mm', 160, 31.2304, 121.4737, '上海', 3, '夜景,城市');
