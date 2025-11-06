-- 创建品牌表
CREATE TABLE IF NOT EXISTS film_brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建系列表（关联品牌）
CREATE TABLE IF NOT EXISTS film_series (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES film_brands(id) ON DELETE CASCADE,
  UNIQUE(brand_id, name)
);

-- 插入常见品牌数据
INSERT OR IGNORE INTO film_brands (id, name, code) VALUES
('brand-kodak', 'Kodak', 'KOD'),
('brand-kodak-pro', 'Kodak Professional', 'KOD'),
('brand-ilford', 'ILFORD', 'ILF'),
('brand-fujifilm', 'Fujifilm', 'FUJ'),
('brand-foma', 'Foma', 'FOM'),
('brand-rollei', 'Rollei', 'ROL'),
('brand-adox', 'Adox', 'ADO'),
('brand-arianet', 'Arianet', 'ARI'),
('brand-kentmere', 'Kentmere', 'KEN');

-- 插入常见系列数据（需要先有品牌）
INSERT OR IGNORE INTO film_series (id, brand_id, name, code) VALUES
-- Kodak系列
('series-gold', 'brand-kodak', 'Gold', 'GOL'),
('series-portra', 'brand-kodak-pro', 'Portra', 'POR'),
('series-ektar', 'brand-kodak', 'Ektar', 'EKT'),
('series-ektachrome', 'brand-kodak', 'Ektachrome', 'EKT'),
('series-tmax', 'brand-kodak', 'T-Max', 'TMA'),
('series-tri-x', 'brand-kodak', 'Tri-X', 'TRI'),
-- ILFORD系列
('series-hp5', 'brand-ilford', 'HP5 Plus', 'HP5'),
('series-pan', 'brand-ilford', 'PAN', 'PAN'),
('series-delta', 'brand-ilford', 'Delta', 'DEL'),
('series-fp4', 'brand-ilford', 'FP4 Plus', 'FP4'),
-- Fujifilm系列
('series-superia', 'brand-fujifilm', 'Superia', 'SUP'),
('series-provia', 'brand-fujifilm', 'Provia', 'PRO'),
('series-velvia', 'brand-fujifilm', 'Velvia', 'VEL'),
('series-neopan', 'brand-fujifilm', 'Neopan', 'NEO');

-- 更新film_stocks表，添加brand_id和series_id字段
-- 注意：这是迁移脚本，实际使用时需要先备份数据
-- ALTER TABLE film_stocks ADD COLUMN brand_id TEXT;
-- ALTER TABLE film_stocks ADD COLUMN series_id TEXT;

