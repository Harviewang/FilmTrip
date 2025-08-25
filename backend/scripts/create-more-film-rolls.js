const { insert } = require('../models/db');

const createMoreFilmRolls = async () => {
  try {
    console.log('🔄 开始创建更多胶卷记录...');
    
    const newFilmRolls = [
      {
        id: 'roll-006',
        name: 'Harvie 海伟 彩负四',
        brand: 'Fujifilm',
        iso: 400,
        type: 'Color Negative',
        format: '135mm',
        status: 'developed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2025-01-20',
        location: '北京',
        description: 'Harvie海伟拍摄的彩色负片第四卷，已冲洗完成'
      },
      {
        id: 'roll-007',
        name: 'Harvie海伟 彩负三',
        brand: 'Kodak',
        iso: 200,
        type: 'Color Negative',
        format: '135mm',
        status: 'developed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2025-01-18',
        location: '北京',
        description: 'Harvie海伟拍摄的彩色负片第三卷，已冲洗完成'
      },
      {
        id: 'roll-008',
        name: 'Harvie，彩负三',
        brand: 'Fujifilm',
        iso: 400,
        type: 'Color Negative',
        format: '135mm',
        status: 'developed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2025-01-16',
        location: '北京',
        description: 'Harvie拍摄的彩色负片第三卷，已冲洗完成'
      },
      {
        id: 'roll-009',
        name: '彩负二 黑白一',
        brand: 'ILFORD',
        iso: 100,
        type: 'Black & White',
        format: '135mm',
        status: 'developed',
        exposure_count: 36,
        exposed_count: 36,
        date: '2025-01-14',
        location: '北京',
        description: '彩色负片第二卷和黑白第一卷，已冲洗完成'
      }
    ];
    
    console.log(`🎞️ 准备创建 ${newFilmRolls.length} 个胶卷记录`);
    
    // 插入胶卷记录
    let successCount = 0;
    for (const filmRoll of newFilmRolls) {
      try {
        const sql = `INSERT INTO film_rolls (id, name, brand, iso, type, format, status, exposure_count, exposed_count, date, location, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [filmRoll.id, filmRoll.name, filmRoll.brand, filmRoll.iso, filmRoll.type, filmRoll.format, filmRoll.status, filmRoll.exposure_count, filmRoll.exposed_count, filmRoll.date, filmRoll.location, filmRoll.description];
        insert(sql, params);
        
        console.log(`✅ 创建胶卷: ${filmRoll.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ 创建胶卷失败 ${filmRoll.id}:`, error.message);
      }
    }
    
    console.log(`\n📊 胶卷创建完成:`);
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`🎞️ 总计: ${successCount + 5} 个胶卷 (包含之前的5个)`);
    
  } catch (error) {
    console.error('❌ 创建胶卷记录过程出错:', error);
  } finally {
    process.exit(0);
  }
};

createMoreFilmRolls();
