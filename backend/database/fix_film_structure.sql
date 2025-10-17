-- 修复胶卷数据结构，实现正确的三层架构 (SQLite版本)
-- 1. Film Stock (胶卷品类)
-- 2. Film Roll (胶卷实例) 
-- 3. Photo (照片)

-- 第一步：创建正确的胶卷品类表
CREATE TABLE IF NOT EXISTS film_stocks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  series TEXT,
  iso INTEGER NOT NULL,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 第二步：修改胶卷实例表结构
DROP TABLE IF EXISTS film_rolls;
CREATE TABLE film_rolls (
  id TEXT PRIMARY KEY,
  roll_number TEXT NOT NULL,
  film_stock_id TEXT NOT NULL,
  status TEXT DEFAULT 'unopened' CHECK (status IN ('unopened', 'shooting', 'exposed', 'developed', 'scanned', 'archived')),
  opened_date DATE,
  finished_date DATE,
  location TEXT,
  camera_name TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (film_stock_id) REFERENCES film_stocks(id) ON DELETE CASCADE
);

-- 第三步：插入胶卷品类数据
INSERT INTO film_stocks (id, name, brand, series, iso, type, format, description, image_url) VALUES
('stock-001', 'Kodak 200', 'Kodak', 'Gold', 200, 'Color Negative', '35mm', '入门级彩色胶卷，色彩鲜艳，适合日常拍摄', NULL),
('stock-002', 'Kodak Professional PORTRA 160', 'Kodak Professional', 'PORTRA', 160, 'Color Negative', '35mm', '专业人像胶卷，肤色还原优秀，颗粒细腻', NULL),
('stock-003', 'ILFORD PAN 400', 'ILFORD', 'PAN', 400, 'Black & White', '35mm', '黑白摄影胶卷，对比度强烈，适合街拍', NULL),
('stock-004', 'Fujifilm Superia 400', 'Fujifilm', 'Superia', 400, 'Color Negative', '35mm', '日常拍摄胶卷，性价比高，色彩自然', NULL),
('stock-005', 'Kodak Ektachrome 100', 'Kodak', 'Ektachrome', 100, 'Slide', '35mm', '专业反转片，色彩饱和度高，适合风光摄影', NULL),
('stock-006', 'ILFORD HP5 Plus 400', 'ILFORD', 'HP5 Plus', 400, 'Black & White', '35mm', '经典黑白胶卷，颗粒细腻，宽容度高', NULL),
('stock-007', 'Fujifilm Provia 100F', 'Fujifilm', 'Provia', 100, 'Slide', '35mm', '专业反转片，色彩准确，适合商业摄影', NULL),
('stock-008', 'Kodak Tri-X 400', 'Kodak', 'Tri-X', 400, 'Black & White', '35mm', '经典黑白胶卷，历史悠久，颗粒粗犷', NULL),
('stock-009', 'Fujifilm Neopan 400', 'Fujifilm', 'Neopan', 400, 'Black & White', '35mm', '黑白摄影胶卷，锐度优秀，适合人像', NULL),
('stock-010', 'Kodak Gold 200', 'Kodak', 'Gold', 200, 'Color Negative', '35mm', '入门级彩色胶卷，适合新手，色彩温暖', NULL);

-- 第四步：插入胶卷实例数据
INSERT INTO film_rolls (id, roll_number, film_stock_id, status, opened_date, finished_date, location, camera_name, notes) VALUES
('roll-001', 'KR001', 'stock-001', 'scanned', '2025-01-15', '2025-01-20', '北京', 'Canon AE-1', '全球旅行胶卷，色彩鲜艳'),
('roll-002', 'KP002', 'stock-002', 'scanned', '2025-01-10', '2025-01-18', '上海', 'Nikon F3', '人像摄影专用，肤色还原优秀'),
('roll-003', 'IP003', 'stock-003', 'scanned', '2024-12-20', '2024-12-28', '深圳', 'Leica M6', '黑白摄影，对比度强烈'),
('roll-004', 'FS004', 'stock-004', 'unopened', '2024-12-15', NULL, '广州', NULL, '日常拍摄，性价比高'),
('roll-005', 'KE005', 'stock-005', 'scanned', '2024-12-10', '2024-12-25', '杭州', 'Pentax 67', '反转片，色彩饱和度高'),
('roll-006', 'IH006', 'stock-006', 'developed', '2024-11-25', '2024-12-05', '成都', 'Hasselblad 500C', '黑白摄影，颗粒细腻'),
('roll-007', 'FP007', 'stock-007', 'archived', '2024-11-15', '2024-11-30', '西安', 'Mamiya RB67', '专业反转片，收藏价值高'),
('roll-008', 'KT008', 'stock-008', 'scanned', '2024-11-05', '2024-11-20', '重庆', 'Canon F-1', '经典黑白胶卷，历史悠久'),
('roll-009', 'FN009', 'stock-009', 'unopened', '2024-10-20', NULL, '武汉', NULL, '黑白摄影，锐度优秀'),
('roll-010', 'KG010', 'stock-010', 'scanned', '2024-10-10', '2024-10-25', '南京', 'Olympus OM-1', '入门级彩色胶卷，适合新手');

-- 第五步：更新照片表，确保film_roll_id正确
UPDATE photos SET film_roll_id = 'roll-001' WHERE id IN (
  SELECT id FROM photos LIMIT 10
);
UPDATE photos SET film_roll_id = 'roll-002' WHERE id IN (
  SELECT id FROM photos LIMIT 10 OFFSET 10
);
UPDATE photos SET film_roll_id = 'roll-003' WHERE id IN (
  SELECT id FROM photos LIMIT 10 OFFSET 20
);

-- 第六步：创建索引优化查询性能 (SQLite语法)
CREATE INDEX IF NOT EXISTS idx_film_roll_id ON photos(film_roll_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON photos(created_at);
CREATE INDEX IF NOT EXISTS idx_date ON photos(date);
CREATE INDEX IF NOT EXISTS idx_film_stock_id ON film_rolls(film_stock_id);
CREATE INDEX IF NOT EXISTS idx_status ON film_rolls(status);
CREATE INDEX IF NOT EXISTS idx_opened_date ON film_rolls(opened_date);

-- 验证数据结构
SELECT 
  'Film Stocks' as table_name,
  COUNT(*) as count
FROM film_stocks
UNION ALL
SELECT 
  'Film Rolls' as table_name,
  COUNT(*) as count
FROM film_rolls
UNION ALL
SELECT 
  'Photos' as table_name,
  COUNT(*) as count
FROM photos;
