-- 创建胶卷表
CREATE TABLE IF NOT EXISTS film_rolls (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL COMMENT '胶卷名称',
  brand VARCHAR(100) NOT NULL COMMENT '品牌',
  iso INTEGER NOT NULL COMMENT 'ISO感光度',
  type VARCHAR(50) NOT NULL COMMENT '类型：Color Negative, Black & White, Slide等',
  format VARCHAR(20) NOT NULL COMMENT '格式：35mm, 120, 4x5等',
  status ENUM('unexposed', 'exposed', 'developed', 'archived') DEFAULT 'unexposed' COMMENT '状态',
  exposure_count INTEGER DEFAULT 36 COMMENT '总曝光数',
  exposed_count INTEGER DEFAULT 0 COMMENT '已曝光数',
  date DATE NOT NULL COMMENT '使用日期',
  location VARCHAR(255) COMMENT '使用地点',
  description TEXT COMMENT '描述信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_brand (brand),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_date (date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='胶卷信息表';

-- 插入测试数据
INSERT INTO film_rolls (id, name, brand, iso, type, format, status, exposure_count, exposed_count, date, location, description) VALUES
('roll-001', 'Kodak 200', 'Kodak', 200, 'Color Negative', '35mm', 'exposed', 36, 36, '2025-01-15', '北京', '全球旅行胶卷，色彩鲜艳'),
('roll-002', 'Kodak Professional PORTRA 160', 'Kodak Professional', 160, 'Color Negative', '35mm', 'exposed', 36, 36, '2025-01-10', '上海', '人像摄影专用，肤色还原优秀'),
('roll-003', 'ILFORD PAN 400', 'ILFORD', 400, 'Black & White', '35mm', 'exposed', 36, 36, '2024-12-20', '深圳', '黑白摄影，对比度强烈'),
('roll-004', 'Fujifilm Superia 400', 'Fujifilm', 400, 'Color Negative', '35mm', 'unexposed', 36, 0, '2024-12-15', '广州', '日常拍摄，性价比高'),
('roll-005', 'Kodak Ektachrome 100', 'Kodak', 100, 'Slide', '35mm', 'exposed', 36, 36, '2024-12-10', '杭州', '反转片，色彩饱和度高'),
('roll-006', 'ILFORD HP5 Plus 400', 'ILFORD', 400, 'Black & White', '35mm', 'developed', 36, 36, '2024-11-25', '成都', '黑白摄影，颗粒细腻'),
('roll-007', 'Fujifilm Provia 100F', 'Fujifilm', 100, 'Slide', '35mm', 'archived', 36, 36, '2024-11-15', '西安', '专业反转片，收藏价值高'),
('roll-008', 'Kodak Tri-X 400', 'Kodak', 400, 'Black & White', '35mm', 'exposed', 36, 36, '2024-11-05', '重庆', '经典黑白胶卷，历史悠久'),
('roll-009', 'Fujifilm Neopan 400', 'Fujifilm', 400, 'Black & White', '35mm', 'unexposed', 36, 0, '2024-10-20', '武汉', '黑白摄影，锐度优秀'),
('roll-010', 'Kodak Gold 200', 'Kodak', 200, 'Color Negative', '35mm', 'exposed', 36, 36, '2024-10-10', '南京', '入门级彩色胶卷，适合新手');

-- 更新photos表，添加film_roll_id外键（如果不存在）
ALTER TABLE photos ADD COLUMN IF NOT EXISTS film_roll_id VARCHAR(36) COMMENT '关联的胶卷ID';
ALTER TABLE photos ADD INDEX IF NOT EXISTS idx_film_roll_id (film_roll_id);

-- 为现有照片分配胶卷ID（示例）
UPDATE photos SET film_roll_id = 'roll-001' WHERE id IN (
  SELECT id FROM photos LIMIT 10
);
UPDATE photos SET film_roll_id = 'roll-002' WHERE id IN (
  SELECT id FROM photos LIMIT 10 OFFSET 10
);
UPDATE photos SET film_roll_id = 'roll-003' WHERE id IN (
  SELECT id FROM photos LIMIT 10 OFFSET 20
);
