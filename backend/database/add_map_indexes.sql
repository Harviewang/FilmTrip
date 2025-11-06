-- 添加地图相关的索引，优化地图查询性能

-- photos表的latitude和longitude索引（用于地图标点查询）
CREATE INDEX IF NOT EXISTS idx_photos_latitude ON photos(latitude);
CREATE INDEX IF NOT EXISTS idx_photos_longitude ON photos(longitude);

-- 复合索引：用于地图边界查询（latitude BETWEEN ... AND longitude BETWEEN ...）
CREATE INDEX IF NOT EXISTS idx_photos_lat_lng ON photos(latitude, longitude);

-- 复合索引：用于过滤protected照片的地图查询
CREATE INDEX IF NOT EXISTS idx_photos_map_query ON photos(latitude, longitude, is_protected) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND latitude != 0 AND longitude != 0;

-- 优化：taken_date索引（如果ORDER BY taken_date需要）
CREATE INDEX IF NOT EXISTS idx_photos_taken_date ON photos(taken_date DESC);

