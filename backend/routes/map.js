const express = require('express');
const router = express.Router();
const { db } = require('../models/db');

// 获取地图上的所有照片位置
router.get('/photos', async (req, res) => {
  try {
    const { bounds, zoom } = req.query;
    
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
        fr.name as film_roll_name
      FROM photos p
      LEFT JOIN cameras c ON p.camera_id = c.id
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      WHERE p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
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
        fr.name as film_roll_name
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

module.exports = router;
