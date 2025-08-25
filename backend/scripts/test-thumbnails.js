const http = require('http');
const { query } = require('../models/db');
const path = require('path'); // Added missing import for path

/**
 * 测试缩略图是否能正常访问
 */
const testThumbnails = async () => {
  try {
    console.log('🧪 开始测试缩略图访问...');
    
    // 获取一些照片的缩略图URL
    const photos = query('SELECT id, photo_number FROM photos LIMIT 5');
    console.log(`📸 测试 ${photos.length} 张照片的缩略图`);
    
    const baseUrl = 'http://localhost:3001';
    let successCount = 0;
    let errorCount = 0;
    
    for (const photo of photos) {
      const thumbnailUrl = `${baseUrl}/uploads/thumbnails/${photo.id}_${photo.photo_number.toString().padStart(3, '0')}_thumb.jpg`;
      
      try {
        const result = await testUrl(thumbnailUrl);
        if (result.success) {
          console.log(`✅ 缩略图访问成功: ${path.basename(thumbnailUrl)} (${result.size} bytes)`);
          successCount++;
        } else {
          console.log(`❌ 缩略图访问失败: ${path.basename(thumbnailUrl)} - ${result.error}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ 缩略图访问异常: ${path.basename(thumbnailUrl)} - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 测试结果:');
    console.log(`✅ 成功访问: ${successCount}`);
    console.log(`❌ 访问失败: ${errorCount}`);
    console.log(`📸 总测试数: ${photos.length}`);
    
    if (successCount === photos.length) {
      console.log('\n🎉 所有缩略图都能正常访问！前端应该能正常显示照片了。');
    } else {
      console.log('\n⚠️  部分缩略图无法访问，需要进一步排查。');
    }
    
  } catch (error) {
    console.error('❌ 测试缩略图时出错:', error);
  }
};

/**
 * 测试URL是否可访问
 */
const testUrl = (url) => {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({
            success: true,
            size: data.length,
            statusCode: res.statusCode
          });
        } else {
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}`,
            statusCode: res.statusCode
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        success: false,
        error: '请求超时'
      });
    });
  });
};

// 运行测试
testThumbnails();
