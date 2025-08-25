-- 更新胶卷数据，使用真实的胶卷信息
UPDATE film_rolls SET 
  name = '1030 彩负',
  brand = 'Kodak',
  iso = 200,
  type = 'Color Negative',
  format = '135mm',
  status = 'developed',
  exposure_count = 36,
  exposed_count = 36,
  date = '2024-10-30',
  location = '北京',
  description = '1030拍摄的彩色负片，已冲洗完成'
WHERE id = 'roll-001';

UPDATE film_rolls SET 
  name = '20231218 彩负',
  brand = 'Fujifilm',
  iso = 400,
  type = 'Color Negative',
  format = '135mm',
  status = 'developed',
  exposure_count = 36,
  exposed_count = 36,
  date = '2023-12-18',
  location = '上海',
  description = '2023年12月18日拍摄的彩色负片，已冲洗完成'
WHERE id = 'roll-002';

UPDATE film_rolls SET 
  name = '230907 PAN100',
  brand = 'ILFORD',
  iso = 100,
  type = 'Black & White',
  format = '135mm',
  status = 'developed',
  exposure_count = 36,
  exposed_count = 36,
  date = '2023-09-07',
  location = '深圳',
  description = '2023年9月7日拍摄的黑白胶片，已冲洗完成'
WHERE id = 'roll-003';

UPDATE film_rolls SET 
  name = '240217 Thailand',
  brand = 'Kodak',
  iso = 200,
  type = 'Color Negative',
  format = '135mm',
  status = 'developed',
  exposure_count = 36,
  exposed_count = 36,
  date = '2024-02-17',
  location = '泰国',
  description = '2024年2月17日泰国旅行拍摄，已冲洗完成'
WHERE id = 'roll-004';

UPDATE film_rolls SET 
  name = 'Harvie 彩负二 2025.1.13',
  brand = 'Fujifilm',
  iso = 400,
  type = 'Color Negative',
  format = '135mm',
  status = 'developed',
  exposure_count = 36,
  exposed_count = 36,
  date = '2025-01-13',
  location = '北京',
  description = 'Harvie拍摄的彩色负片第二卷，已冲洗完成'
WHERE id = 'roll-005';

-- 更新照片数据，使用真实的文件名
UPDATE photos SET 
  filename = 'R1-00439-0001.JPG',
  title = '北京街景',
  description = '北京城市风光',
  taken_date = '2024-10-30',
  aperture = 'f/2.8',
  shutter_speed = '1/125',
  focal_length = '50mm',
  iso = 200,
  latitude = 39.9042,
  longitude = 116.4074,
  location_name = '北京',
  rating = 4,
  tags = '城市,风景,街拍'
WHERE id = 'photo-001';

UPDATE photos SET 
  filename = 'R1-00439-0002.JPG',
  title = '北京建筑',
  description = '北京现代建筑',
  taken_date = '2024-10-30',
  aperture = 'f/4.0',
  shutter_speed = '1/60',
  focal_length = '35mm',
  iso = 400,
  latitude = 39.9042,
  longitude = 116.4074,
  location_name = '北京',
  rating = 5,
  tags = '建筑,城市,现代'
WHERE id = 'photo-002';

UPDATE photos SET 
  filename = 'R1-00439-0003.JPG',
  title = '上海夜景',
  description = '上海外滩夜景',
  taken_date = '2023-12-18',
  aperture = 'f/5.6',
  shutter_speed = '1/250',
  focal_length = '85mm',
  iso = 160,
  latitude = 31.2304,
  longitude = 121.4737,
  location_name = '上海',
  rating = 3,
  tags = '夜景,城市,外滩'
WHERE id = 'photo-003';
