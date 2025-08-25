const { query, insert, update, delete: deleteRecord } = require('../models/db');

const createFilmRollsData = async () => {
  try {
    console.log('开始创建胶卷测试数据...');
    
    // 删除现有表并重新创建
    const db = require('../models/db').db;
    try {
      db.exec('DROP TABLE IF EXISTS film_rolls');
      console.log('删除现有表');
    } catch (error) {
      console.log('删除表时出现警告:', error.message);
    }
    
    // 等待一下确保删除完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 创建新的胶卷表
    db.exec(`
      CREATE TABLE film_rolls (
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
      )
    `);
    
    console.log('胶卷表创建成功');
    
    // 清空现有数据（先删除引用，再删除主表）
    try {
      deleteRecord('DELETE FROM photos WHERE film_roll_id IS NOT NULL');
      deleteRecord('DELETE FROM film_rolls');
      console.log('清空现有数据');
    } catch (error) {
      console.log('清空数据时出现警告（可能是首次运行）:', error.message);
    }
    
    // 插入测试数据
    const filmRolls = [
      {
        id: 'roll-001',
        name: 'Kodak 200',
        brand: 'Kodak',
        iso: 200,
        type: 'Color Negative',
        format: '35mm',
        status: 'exposed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2025-01-15',
        location: '北京',
        description: '全球旅行胶卷，色彩鲜艳'
      },
      {
        id: 'roll-002',
        name: 'Kodak Professional PORTRA 160',
        brand: 'Kodak Professional',
        iso: 160,
        type: 'Color Negative',
        format: '35mm',
        status: 'exposed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2025-01-10',
        location: '上海',
        description: '人像摄影专用，肤色还原优秀'
      },
      {
        id: 'roll-003',
        name: 'ILFORD PAN 400',
        brand: 'ILFORD',
        iso: 400,
        type: 'Black & White',
        format: '35mm',
        status: 'exposed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2024-12-20',
        location: '深圳',
        description: '黑白摄影，对比度强烈'
      },
      {
        id: 'roll-004',
        name: 'Fujifilm Superia 400',
        brand: 'Fujifilm',
        iso: 400,
        type: 'Color Negative',
        format: '35mm',
        status: 'unexposed',
        exposure_count: 36,
        exposed_count: 0,
        date: '2024-12-15',
        location: '广州',
        description: '日常拍摄，性价比高'
      },
      {
        id: 'roll-005',
        name: 'Kodak Ektachrome 100',
        brand: 'Kodak',
        iso: 100,
        type: 'Slide',
        format: '35mm',
        status: 'exposed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2024-12-10',
        location: '杭州',
        description: '反转片，色彩饱和度高'
      },
      {
        id: 'roll-006',
        name: 'ILFORD HP5 Plus 400',
        brand: 'ILFORD',
        iso: 400,
        type: 'Black & White',
        format: '35mm',
        status: 'developed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2024-11-25',
        location: '成都',
        description: '黑白摄影，颗粒细腻'
      },
      {
        id: 'roll-007',
        name: 'Fujifilm Provia 100F',
        brand: 'Fujifilm',
        iso: 100,
        type: 'Slide',
        format: '35mm',
        status: 'archived',
        exposure_count: 36,
        exposed_count: 36,
        date: '2024-11-15',
        location: '西安',
        description: '专业反转片，收藏价值高'
      },
      {
        id: 'roll-008',
        name: 'Kodak Tri-X 400',
        brand: 'Kodak',
        iso: 400,
        type: 'Black & White',
        format: '35mm',
        status: 'exposed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2024-11-05',
        location: '重庆',
        description: '经典黑白胶卷，历史悠久'
      },
      {
        id: 'roll-009',
        name: 'Fujifilm Neopan 400',
        brand: 'Fujifilm',
        iso: 400,
        type: 'Black & White',
        format: '35mm',
        status: 'unexposed',
        exposure_count: 36,
        exposed_count: 0,
        date: '2024-10-20',
        location: '武汉',
        description: '黑白摄影，锐度优秀'
      },
      {
        id: 'roll-010',
        name: 'Kodak Gold 200',
        brand: 'Kodak',
        iso: 200,
        type: 'Color Negative',
        format: '35mm',
        status: 'exposed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2024-10-10',
        location: '南京',
        description: '入门级彩色胶卷，适合新手'
      }
    ];
    
    for (const filmRoll of filmRolls) {
      insert(`
        INSERT INTO film_rolls (
          id, name, brand, iso, type, format, status, 
          exposure_count, exposed_count, date, location, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        filmRoll.id, filmRoll.name, filmRoll.brand, filmRoll.iso,
        filmRoll.type, filmRoll.format, filmRoll.status,
        filmRoll.exposure_count, filmRoll.exposed_count,
        filmRoll.date, filmRoll.location, filmRoll.description
      ]);
    }
    
    console.log(`成功创建 ${filmRolls.length} 条胶卷数据`);
    
    // 验证数据
    const result = await query('SELECT COUNT(*) as count FROM film_rolls');
    console.log(`数据库中共有 ${result[0].count} 条胶卷记录`);
    
    // 显示部分数据
    const sampleData = await query('SELECT id, name, brand, iso, status FROM film_rolls LIMIT 5');
    console.log('示例数据:', sampleData);
    
  } catch (error) {
    console.error('创建胶卷数据失败:', error);
  } finally {
    process.exit(0);
  }
};

createFilmRollsData();
