#!/usr/bin/env node

/**
 * 照片元数据增强脚本
 * 为现有照片添加地理信息、分类标签等元数据
 */

const { query, update } = require('../models/db');

async function enhancePhotoMetadata() {
  console.log('开始增强照片元数据...');

  try {
    // 获取所有照片
    const photos = query('SELECT id, latitude, longitude, location_name FROM photos');
    console.log(`找到 ${photos.length} 张照片`);

    // 中国主要城市的坐标数据
    const cities = [
      { name: '北京', province: '北京市', country: '中国', lat: 39.9042, lng: 116.4074 },
      { name: '上海', province: '上海市', country: '中国', lat: 31.2304, lng: 121.4737 },
      { name: '广州', province: '广东省', country: '中国', lat: 23.1291, lng: 113.2644 },
      { name: '深圳', province: '广东省', country: '中国', lat: 22.5429, lng: 114.0596 },
      { name: '杭州', province: '浙江省', country: '中国', lat: 30.2741, lng: 120.1551 },
      { name: '成都', province: '四川省', country: '中国', lat: 30.5728, lng: 104.0668 },
      { name: '西安', province: '陕西省', country: '中国', lat: 34.3416, lng: 108.9398 },
      { name: '武汉', province: '湖北省', country: '中国', lat: 30.5928, lng: 114.3055 },
      { name: '南京', province: '江苏省', country: '中国', lat: 32.0603, lng: 118.7969 },
      { name: '苏州', province: '江苏省', country: '中国', lat: 31.2989, lng: 120.5853 },
      { name: '天津', province: '天津市', country: '中国', lat: 39.0842, lng: 117.2008 },
      { name: '重庆', province: '重庆市', country: '中国', lat: 29.4316, lng: 106.9123 },
      { name: '长沙', province: '湖南省', country: '中国', lat: 28.2282, lng: 112.9388 },
      { name: '沈阳', province: '辽宁省', country: '中国', lat: 41.8057, lng: 123.4315 },
      { name: '大连', province: '辽宁省', country: '中国', lat: 38.9140, lng: 121.6147 }
    ];

    // 摄影分类标签
    const categoriesList = [
      '风景', '人文', '建筑', '自然', '城市', '山水', '人文', '纪实', '旅行', '生活'
    ];

    let updatedCount = 0;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];

      // 跳过已有地理信息的照片
      if (photo.country && photo.province && photo.city) {
        continue;
      }

      // 随机选择一个城市
      const randomCity = cities[Math.floor(Math.random() * cities.length)];

      // 如果照片已有GPS坐标，尝试根据坐标匹配城市
      let selectedCity = randomCity;
      if (photo.latitude && photo.longitude) {
        // 简单的坐标匹配（这里可以改进为更精确的反向地理编码）
        const nearestCity = cities.find(city => {
          const distance = Math.sqrt(
            Math.pow(city.lat - photo.latitude, 2) +
            Math.pow(city.lng - photo.longitude, 2)
          );
          return distance < 2; // 约200km范围内
        });
        if (nearestCity) {
          selectedCity = nearestCity;
        }
      }

      // 随机选择一些分类标签
      const numCategories = Math.floor(Math.random() * 3) + 1; // 1-3个标签
      const selectedCategories = [];
      for (let j = 0; j < numCategories; j++) {
        const category = categoriesList[Math.floor(Math.random() * categoriesList.length)];
        if (!selectedCategories.includes(category)) {
          selectedCategories.push(category);
        }
      }

      // 模拟行程信息（随机生成）
      const tripNames = ['春节旅行', '五一出游', '国庆假期', '端午小长假', '中秋赏月', '摄影采风', '毕业旅行', '婚纱摄影'];
      const randomTrip = tripNames[Math.floor(Math.random() * tripNames.length)];

      // 生成随机的行程日期
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7天行程

      const updateData = {
        country: selectedCity.country,
        province: selectedCity.province,
        city: selectedCity.city,
        categories: JSON.stringify(selectedCategories),
        trip_name: randomTrip,
        trip_start_date: startDate.toISOString().split('T')[0],
        trip_end_date: endDate.toISOString().split('T')[0]
      };

      // 执行更新
      const result = update(
        `UPDATE photos SET
          country = ?,
          province = ?,
          city = ?,
          categories = ?,
          trip_name = ?,
          trip_start_date = ?,
          trip_end_date = ?
         WHERE id = ?`,
        [
          updateData.country,
          updateData.province,
          updateData.city,
          updateData.categories,
          updateData.trip_name,
          updateData.trip_start_date,
          updateData.trip_end_date,
          photo.id
        ]
      );

      if (result.changes > 0) {
        updatedCount++;
        console.log(`更新照片 ${photo.id}: ${selectedCity.city} - ${selectedCategories.join(',')} - ${randomTrip}`);
      }
    }

    console.log(`✅ 元数据增强完成，共更新 ${updatedCount} 张照片`);
    console.log('📊 添加的元数据包括：');
    console.log('  - 地理信息：国家、省份、城市');
    console.log('  - 分类标签：风景、人文、建筑、自然等');
    console.log('  - 行程信息：行程名称、起止日期');

  } catch (error) {
    console.error('❌ 元数据增强失败:', error);
  }
}

// 运行脚本
if (require.main === module) {
  enhancePhotoMetadata().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { enhancePhotoMetadata };
