const { insert } = require('../models/db');

const createFilmStocks = async () => {
  try {
    console.log('🔄 开始创建胶卷类型数据...');
    
    const filmStocks = [
      {
        id: 'stock-001',
        stock_serial_number: 'KODAK-200-135',
        brand: 'Kodak',
        series: 'Kodak 200',
        iso: 200,
        format: '135mm',
        type: 'Color Negative',
        description: '柯达200度彩色负片，色彩鲜艳，适合日常拍摄',
        package_image: 'Kodak_200_135mm.jpg',
        cartridge_image: 'Kodak_200_cartridge.jpg'
      },
      {
        id: 'stock-002',
        stock_serial_number: 'KODAK-PORTRA-160-135',
        brand: 'Kodak Professional',
        series: 'PORTRA 160',
        iso: 160,
        format: '135mm',
        type: 'Color Negative',
        description: '柯达专业人像胶片，肤色还原优秀，适合人像摄影',
        package_image: 'Kodak_Portra_160_135mm.jpg',
        cartridge_image: 'Kodak_Portra_160_cartridge.jpg'
      },
      {
        id: 'stock-003',
        stock_serial_number: 'ILFORD-PAN-400-135',
        brand: 'ILFORD',
        series: 'PAN 400',
        iso: 400,
        format: '135mm',
        type: 'Black & White',
        description: 'ILFORD黑白胶片，对比度强烈，颗粒细腻',
        package_image: 'ILFORD_PAN_400_135mm.jpg',
        cartridge_image: 'ILFORD_PAN_400_cartridge.jpg'
      },
      {
        id: 'stock-004',
        stock_serial_number: 'FUJIFILM-SUPERIA-400-135',
        brand: 'Fujifilm',
        series: 'Superia 400',
        iso: 400,
        format: '135mm',
        type: 'Color Negative',
        description: '富士Superia 400度彩色负片，日常拍摄，性价比高',
        package_image: 'Fujifilm_Superia_400_135mm.jpg',
        cartridge_image: 'Fujifilm_Superia_400_cartridge.jpg'
      },
      {
        id: 'stock-005',
        stock_serial_number: 'KODAK-EKTACHROME-100-135',
        brand: 'Kodak',
        series: 'Ektachrome 100',
        iso: 100,
        format: '135mm',
        type: 'Slide',
        description: '柯达Ektachrome反转片，色彩饱和度高，适合风光摄影',
        package_image: 'Kodak_Ektachrome_100_135mm.jpg',
        cartridge_image: 'Kodak_Ektachrome_100_cartridge.jpg'
      }
    ];
    
    console.log(`🎞️ 准备创建 ${filmStocks.length} 个胶卷类型`);
    
    // 插入胶卷类型记录
    let successCount = 0;
    for (const filmStock of filmStocks) {
      try {
        const sql = `INSERT INTO film_stocks (id, stock_serial_number, brand, series, iso, format, type, description, package_image, cartridge_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [filmStock.id, filmStock.stock_serial_number, filmStock.brand, filmStock.series, filmStock.iso, filmStock.format, filmStock.type, filmStock.description, filmStock.package_image, filmStock.cartridge_image];
        insert(sql, params);
        
        console.log(`✅ 创建胶卷类型: ${filmStock.series}`);
        successCount++;
      } catch (error) {
        console.error(`❌ 创建胶卷类型失败 ${filmStock.id}:`, error.message);
      }
    }
    
    console.log(`\n📊 胶卷类型创建完成:`);
    console.log(`✅ 成功: ${successCount} 个`);
    
  } catch (error) {
    console.error('❌ 创建胶卷类型过程出错:', error);
  } finally {
    process.exit(0);
  }
};

createFilmStocks();
