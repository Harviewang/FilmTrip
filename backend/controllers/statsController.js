const { query, insert, update, delete: deleteRecord } = require('../models/db');

/**
 * 获取仪表板统计数据
 */
const getDashboardStats = (req, res) => {
  try {
    // 获取基础统计数据
    const photoCount = query('SELECT COUNT(*) as count FROM photos')[0].count;
    const filmStockCount = query('SELECT COUNT(*) as count FROM film_stocks')[0].count;
    const filmRollCount = query('SELECT COUNT(*) as count FROM film_rolls')[0].count;
    const cameraCount = query('SELECT COUNT(*) as count FROM cameras')[0].count;
    const scannerCount = query('SELECT COUNT(*) as count FROM scanners')[0].count;
    const userCount = query('SELECT COUNT(*) as count FROM users')[0].count;

    // 获取最近上传的照片
    const recentPhotos = query(`
      SELECT p.id, p.filename, p.title, p.uploaded_at, fr.roll_number as film_roll_number
      FROM photos p
      LEFT JOIN film_rolls fr ON p.film_roll_id = fr.id
      ORDER BY p.uploaded_at DESC 
      LIMIT 5
    `);

    // 获取相机使用统计
    const cameraUsage = query(`
      SELECT 
        c.name,
        c.model,
        COUNT(p.id) as photo_count
      FROM cameras c
      LEFT JOIN photos p ON c.id = p.camera_id
      GROUP BY c.id
      ORDER BY photo_count DESC
      LIMIT 5
    `);

    // 获取胶卷品类统计
    const filmStockStats = query(`
      SELECT 
        fs.brand,
        fs.series,
        COUNT(fr.id) as roll_count
      FROM film_stocks fs
      LEFT JOIN film_rolls fr ON fs.id = fr.film_stock_id
      GROUP BY fs.brand, fs.series
      ORDER BY roll_count DESC
    `);

    res.json({
      success: true,
      data: {
        counts: {
          photos: photoCount,
          filmStocks: filmStockCount,
          filmRolls: filmRollCount,
          cameras: cameraCount,
          scanners: scannerCount,
          users: userCount
        },
        recentPhotos,
        cameraUsage,
        filmStockStats
      }
    });
  } catch (error) {
    console.error('获取仪表板统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取仪表板统计失败',
      error: error.message
    });
  }
};

/**
 * 获取照片趋势统计
 */
const getPhotoTrends = (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFormat, groupBy;
    if (period === 'year') {
      dateFormat = '%Y';
      groupBy = 'year';
    } else if (period === 'month') {
      dateFormat = '%Y-%m';
      groupBy = 'year_month';
    } else {
      dateFormat = '%Y-%m-%d';
      groupBy = 'date';
    }

    // 获取照片上传趋势
    const uploadTrends = query(`
      SELECT 
        strftime('${dateFormat}', uploaded_at) as ${groupBy},
        COUNT(*) as count
      FROM photos 
      WHERE uploaded_at IS NOT NULL
      GROUP BY ${groupBy}
      ORDER BY ${groupBy} DESC
      LIMIT 12
    `);

    // 获取拍摄时间趋势
    const takenTrends = query(`
      SELECT 
        strftime('${dateFormat}', taken_date) as ${groupBy},
        COUNT(*) as count
      FROM photos 
      WHERE taken_date IS NOT NULL
      GROUP BY ${groupBy}
      ORDER BY ${groupBy} DESC
      LIMIT 12
    `);

    res.json({
      success: true,
      data: {
        uploadTrends,
        takenTrends
      }
    });
  } catch (error) {
    console.error('获取照片趋势统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取照片趋势统计失败',
      error: error.message
    });
  }
};

/**
 * 获取存储统计
 */
const getStorageStats = (req, res) => {
  try {
    // 获取胶卷品类存储统计
    const filmStockStorage = query(`
      SELECT 
        fs.brand,
        fs.series,
        fs.iso,
        fs.format,
        COUNT(fr.id) as roll_count,
        fs.created_at
      FROM film_stocks fs
      LEFT JOIN film_rolls fr ON fs.id = fr.film_stock_id
      GROUP BY fs.id
      ORDER BY roll_count DESC
    `);

    // 获取相机存储统计
    const cameraStorage = query(`
      SELECT 
        c.name,
        c.model,
        COUNT(p.id) as photo_count
      FROM cameras c
      LEFT JOIN photos p ON c.id = p.camera_id
      GROUP BY c.id
      ORDER BY photo_count DESC
    `);

    // 获取胶卷品类存储统计
    const filmStockTypeStorage = query(`
      SELECT 
        fs.brand,
        fs.series,
        fs.iso,
        COUNT(fr.id) as roll_count
      FROM film_stocks fs
      LEFT JOIN film_rolls fr ON fs.id = fr.film_stock_id
      GROUP BY fs.brand, fs.series, fs.iso
      ORDER BY roll_count DESC
    `);

    res.json({
      success: true,
      data: {
        filmStockStorage,
        cameraStorage,
        filmStockTypeStorage
      }
    });
  } catch (error) {
    console.error('获取存储统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取存储统计失败',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getPhotoTrends,
  getStorageStats
};
