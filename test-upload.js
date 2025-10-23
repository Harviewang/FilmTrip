const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    console.log('=== 测试上传功能 ===');
    
    // 首先获取胶卷列表
    const filmRollsResponse = await axios.get('http://localhost:3001/api/filmRolls');
    console.log('胶卷列表:', filmRollsResponse.data);
    
    if (!filmRollsResponse.data.data || filmRollsResponse.data.data.length === 0) {
      console.log('没有可用的胶卷实例，请先创建胶卷');
      return;
    }
    
    const filmRoll = filmRollsResponse.data.data[0];
    console.log('使用胶卷:', filmRoll);
    
    // 创建一个测试图片文件（简单的1x1像素PNG）
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // 创建FormData
    const formData = new FormData();
    formData.append('title', '测试照片');
    formData.append('description', '这是一个测试照片');
    formData.append('film_roll_id', filmRoll.id);
    formData.append('camera_id', filmRoll.camera_id || '');
    formData.append('taken_date', '2025-01-01');
    formData.append('location_name', '测试地点');
    formData.append('tags', '测试,上传');
    formData.append('is_protected', '0');
    formData.append('protection_level', '');
    formData.append('photo', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    console.log('开始上传照片...');
    const uploadResponse = await axios.post('http://localhost:3001/api/photos', formData, {
      headers: {
        ...formData.getHeaders(),
      }
    });
    
    console.log('上传成功:', uploadResponse.data);
    
    // 测试获取照片列表
    console.log('测试获取照片列表...');
    const photosResponse = await axios.get('http://localhost:3001/api/photos');
    console.log('照片列表:', photosResponse.data);
    
    console.log('=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testUpload();
