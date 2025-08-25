const fetch = require('node-fetch');

const testSystem = async () => {
  console.log('🧪 开始系统测试...\n');
  
  try {
    // 测试后端API
    console.log('1️⃣ 测试后端API...');
    const photosResponse = await fetch('http://localhost:3001/api/photos');
    const photosData = await photosResponse.json();
    
    if (photosResponse.ok && photosData.success) {
      console.log('✅ 后端API正常');
      console.log(`📸 照片数量: ${photosData.data.length}`);
      console.log(`📸 第一张照片: ${photosData.data[0].title}`);
      console.log(`📸 图片路径: ${photosData.data[0].original}`);
    } else {
      console.log('❌ 后端API异常:', photosData);
    }
    
    // 测试图片文件访问
    console.log('\n2️⃣ 测试图片文件访问...');
    if (photosData.success && photosData.data.length > 0) {
      const imageUrl = `http://localhost:3001${photosData.data[0].original}`;
      const imageResponse = await fetch(imageUrl);
      
      if (imageResponse.ok) {
        console.log('✅ 图片文件可以正常访问');
        console.log(`📸 图片大小: ${imageResponse.headers.get('content-length')} bytes`);
      } else {
        console.log('❌ 图片文件访问失败:', imageResponse.status);
      }
    }
    
    // 测试前端页面
    console.log('\n3️⃣ 测试前端页面...');
    const frontendResponse = await fetch('http://localhost:3002/photos');
    
    if (frontendResponse.ok) {
      console.log('✅ 前端页面可以访问');
      const frontendHtml = await frontendResponse.text();
      
      // 检查是否包含照片数据
      if (frontendHtml.includes('北京街景') || frontendHtml.includes('北京建筑')) {
        console.log('✅ 前端页面包含照片数据');
      } else {
        console.log('⚠️ 前端页面可能没有正确显示照片数据');
      }
    } else {
      console.log('❌ 前端页面访问失败:', frontendResponse.status);
    }
    
    // 测试胶卷API
    console.log('\n4️⃣ 测试胶卷API...');
    const filmRollsResponse = await fetch('http://localhost:3001/api/filmRolls');
    const filmRollsData = await filmRollsResponse.json();
    
    if (filmRollsResponse.ok && filmRollsData.success) {
      console.log('✅ 胶卷API正常');
      console.log(`🎞️ 胶卷数量: ${filmRollsData.data.length}`);
      console.log(`🎞️ 第一个胶卷: ${filmRollsData.data[0].name}`);
    } else {
      console.log('❌ 胶卷API异常:', filmRollsData);
    }
    
  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
  
  console.log('\n🏁 系统测试完成');
};

testSystem();
