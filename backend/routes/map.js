const express = require('express');
const router = express.Router();
const { db } = require('../models/db');
const { adminAuth } = require('../middleware/auth');

// 获取地图上的所有照片位置
router.get('/photos', async (req, res) => {
  try {
    const { bounds, zoom, lightweight } = req.query;
    const isLightweight = lightweight === 'true' || lightweight === true;
    
    // 轻量级模式：只返回位置信息（用于地图标点）
    if (isLightweight) {
      let sql = `
        SELECT 
          p.id,
          p.latitude,
          p.longitude
        FROM photos p
        LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
        WHERE p.latitude IS NOT NULL 
          AND p.longitude IS NOT NULL
          AND p.latitude != 0 
          AND p.longitude != 0
          AND p.latitude BETWEEN -90 AND 90
          AND p.longitude BETWEEN -180 AND 180
          AND (p.is_protected = 0 OR p.is_protected IS NULL)
          AND (fr.is_protected = 0 OR fr.is_protected IS NULL)
      `;
      
      const params = [];
      
      // 如果提供了边界范围，添加边界过滤
      if (bounds) {
        const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number);
        sql += ` AND p.latitude BETWEEN ? AND ? AND p.longitude BETWEEN ? AND ?`;
        params.push(swLat, neLat, swLng, neLng);
      }
      
      // 优化：如果没有bounds，限制返回数量（避免加载所有照片）
      // 如果以后有3000张照片，初始加载时不传递bounds会查询所有，导致性能问题
      if (!bounds) {
        // 没有bounds时，限制返回前500个（根据实际需求调整）
        sql += ` ORDER BY p.taken_date DESC LIMIT 500`;
      } else {
        sql += ` ORDER BY p.taken_date DESC`;
      }
      
      const photos = db.prepare(sql).all(params);
      
      res.json({
        success: true,
        data: photos,
        count: photos.length
      });
      return;
    }
    
    // 完整模式：返回所有信息（保持向后兼容）
    let sql = `
      SELECT 
        p.id,
        p.filename,
        p.title,
        p.latitude,
        p.longitude,
        p.location_name,
        p.taken_date,
        p.rating,
        c.name as camera_name,
        c.brand as camera_brand,
        fr.roll_number as film_roll_name
      FROM photos p
      LEFT JOIN cameras c ON p.camera_id = c.id
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      WHERE p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
        AND p.latitude != 0 
        AND p.longitude != 0
        AND p.latitude BETWEEN -90 AND 90
        AND p.longitude BETWEEN -180 AND 180
        AND (p.is_protected = 0 OR p.is_protected IS NULL)
        AND (fr.is_protected = 0 OR fr.is_protected IS NULL)
    `;
    
    const params = [];
    
    // 如果提供了边界范围，添加边界过滤
    if (bounds) {
      const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number);
      sql += ` AND p.latitude BETWEEN ? AND ? AND p.longitude BETWEEN ? AND ?`;
      params.push(swLat, neLat, swLng, neLng);
    }
    
    sql += ` ORDER BY p.taken_date DESC`;
    
    const photos = db.prepare(sql).all(params);
    
    // 为每个照片添加图片URL
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      thumbnail: photo.filename ? `/uploads/thumbnails/${photo.id}_thumb.jpg` : null,
      original: photo.filename ? `/uploads/${photo.filename}` : null
    }));
    
    res.json({
      success: true,
      data: photosWithUrls,
      count: photosWithUrls.length
    });
  } catch (error) {
    console.error('获取地图照片失败:', error);
    res.status(500).json({
      success: false,
      message: '获取地图照片失败',
      error: error.message
    });
  }
});
// 获取地图聚合数据（按区域分组）
router.get('/aggregate', async (req, res) => {
  try {
    const { bounds, zoom = 12 } = req.query;
    
    // 根据缩放级别计算聚合精度
    let precision;
    if (zoom >= 16) precision = 0.001;      // 街道级别
    else if (zoom >= 14) precision = 0.01;   // 区域级别
    else if (zoom >= 12) precision = 0.1;    // 城市级别
    else precision = 1;                       // 省份级别
    
    let sql = `
      SELECT 
        ROUND(latitude / ?) * ? as lat_group,
        ROUND(longitude / ?) * ? as lng_group,
        COUNT(*) as photo_count,
        AVG(rating) as avg_rating,
        MIN(taken_date) as earliest_date,
        MAX(taken_date) as latest_date
      FROM photos 
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
    `;
    
    const params = [precision, precision, precision, precision];
    
    // 如果提供了边界范围，添加边界过滤
    if (bounds) {
      const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number);
      sql += ` AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?`;
      params.push(swLat, neLat, swLng, neLng);
    }
    
    sql += ` GROUP BY lat_group, lng_group HAVING photo_count > 0 ORDER BY photo_count DESC`;
    
    const aggregates = db.prepare(sql).all(params);
    
    res.json({
      success: true,
      data: aggregates,
      precision: precision,
      zoom: zoom
    });
  } catch (error) {
    console.error('获取地图聚合数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取地图聚合数据失败',
      error: error.message
    });
  }
});

// 搜索地点
router.get('/search', async (req, res) => {
  try {
    const { q, lat, lng, radius = 5000 } = req.query;
    
    let sql = `
      SELECT 
        p.id,
        p.filename,
        p.title,
        p.latitude,
        p.longitude,
        p.location_name,
        p.taken_date,
        p.rating,
        c.name as camera_name,
        c.brand as camera_brand,
        fr.roll_number as film_roll_name
      FROM photos p
      LEFT JOIN cameras c ON p.camera_id = c.id
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      WHERE p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
    `;
    
    const params = [];
    
    // 如果提供了搜索关键词
    if (q) {
      sql += ` AND (p.title LIKE ? OR p.location_name LIKE ? OR p.description LIKE ?)`;
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // 如果提供了中心点和半径
    if (lat && lng) {
      sql += ` AND (
        (p.latitude - ?) * (p.latitude - ?) + 
        (p.longitude - ?) * (p.longitude - ?) <= (? * ?)
      )`;
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusKm = radius / 1000;
      params.push(latNum, latNum, lngNum, lngNum, radiusKm, radiusKm);
    }
    
    sql += ` ORDER BY p.taken_date DESC LIMIT 100`;
    
    const photos = db.prepare(sql).all(params);
    
    // 为每个照片添加图片URL
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      thumbnail: photo.filename ? `/uploads/thumbnails/${photo.id}_thumb.jpg` : null,
      original: photo.filename ? `/uploads/${photo.filename}` : null
    }));
    
    res.json({
      success: true,
      data: photosWithUrls,
      count: photosWithUrls.length
    });
  } catch (error) {
    console.error('搜索地点失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索地点失败',
      error: error.message
    });
  }
});

// 获取照片的地理位置信息
router.get('/photos/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        p.id,
        p.latitude,
        p.longitude,
        p.location_name,
        p.taken_date,
        p.title
      FROM photos p
      WHERE p.id = ? AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
    `;
    
    const photo = db.prepare(sql).get([id]);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: '照片或位置信息不存在'
      });
    }
    
    res.json({
      success: true,
      data: photo
    });
  } catch (error) {
    console.error('获取照片位置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取照片位置失败',
      error: error.message
    });
  }
});

// 更新照片的地理位置信息
router.put('/photos/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, location_name } = req.body;
    
    // 验证经纬度
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: '经纬度不能为空'
      });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: '经纬度范围无效'
      });
    }
    
    const sql = `
      UPDATE photos 
      SET latitude = ?, longitude = ?, location_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const result = db.prepare(sql).run([latitude, longitude, location_name, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: '照片不存在'
      });
    }
    
    res.json({
      success: true,
      message: '位置信息更新成功'
    });
  } catch (error) {
    console.error('更新照片位置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新照片位置失败',
      error: error.message
    });
  }
});

/**
 * 批量为测试数据打上地理位置（仅管理员）
 * POST /api/map/seed/locations
 * body: { scope: 'all'|'missing', region: 'china'|'world', jitterMeters?: number }
 */
router.post('/seed/locations', adminAuth, (req, res) => {
  try {
    const { scope = 'missing', region = 'china', jitterMeters = 5000 } = req.body || {};

    // 城市坐标集（简化版）
    const citiesChina = [
      { name: '北京', lat: 39.9042, lng: 116.4074 },
      { name: '上海', lat: 31.2304, lng: 121.4737 },
      { name: '深圳', lat: 22.5431, lng: 114.0579 },
      { name: '广州', lat: 23.1291, lng: 113.2644 },
      { name: '成都', lat: 30.5728, lng: 104.0668 },
      { name: '杭州', lat: 30.2741, lng: 120.1551 },
      { name: '西安', lat: 34.3416, lng: 108.9398 },
      { name: '武汉', lat: 30.5928, lng: 114.3055 },
      { name: '重庆', lat: 29.5630, lng: 106.5516 },
      { name: '青岛', lat: 36.0671, lng: 120.3826 }
    ];
    const citiesWorld = [
      { name: 'Tokyo', lat: 35.6895, lng: 139.6917 },
      { name: 'Seoul', lat: 37.5665, lng: 126.9780 },
      { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
      { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { name: 'London', lat: 51.5074, lng: -0.1278 },
      { name: 'Paris', lat: 48.8566, lng: 2.3522 },
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
      { name: 'Vancouver', lat: 49.2827, lng: -123.1207 }
    ];
    const pool = region === 'world' ? citiesWorld : citiesChina;

    const pickCity = (seed) => pool[seed % pool.length];
    const jitter = (meters, lat) => {
      const r = meters / 111320; // deg latitude per meter
      const jlat = (Math.random() - 0.5) * 2 * r;
      const jlng = (Math.random() - 0.5) * 2 * (meters / (111320 * Math.cos((lat || 0) * Math.PI / 180)));
      return { jlat, jlng };
    };

    const selectSql = scope === 'all'
      ? `SELECT id FROM photos`
      : `SELECT id FROM photos WHERE latitude IS NULL OR longitude IS NULL`;

    const rows = db.prepare(selectSql).all();
    if (!rows || rows.length === 0) {
      return res.json({ success: true, updated: 0, message: '没有需要更新的记录' });
    }

    const update = db.prepare(`UPDATE photos SET latitude = ?, longitude = ?, location_name = COALESCE(location_name, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    const tx = db.transaction((ids) => {
      ids.forEach((r, idx) => {
        const c = pickCity(idx);
        const { jlat, jlng } = jitter(jitterMeters, c.lat);
        const lat = c.lat + jlat;
        const lng = c.lng + jlng;
        update.run(lat, lng, c.name, r.id);
      });
    });

    tx(rows);

    return res.json({ success: true, updated: rows.length, region, scope, jitterMeters });
  } catch (error) {
    console.error('批量定位失败:', error);
    res.status(500).json({ success: false, message: '批量定位失败', error: error.message });
  }
});

module.exports = router;
