const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// 获取胶卷照片列表
router.get('/:rollId', (req, res) => {
  try {
    const rollId = req.params.rollId;
    
    // 构建胶卷照片目录路径
    const rollPhotosDir = path.join(__dirname, '../uploads/Film_roll', `roll_${rollId.padStart(3, '0')}`, 'photos');
    
    // 检查目录是否存在
    if (!fs.existsSync(rollPhotosDir)) {
      return res.status(404).json({
        success: false,
        message: '胶卷照片目录不存在'
      });
    }
    
    // 读取目录中的文件
    const files = fs.readdirSync(rollPhotosDir);
    
    // 筛选出照片文件（支持jpg, jpeg, png等格式）
    const rollPhotos = files
      .filter(file => {
        // 匹配图片文件格式
        return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file);
      })
      .map((file, index) => {
        // 尝试从文件名中提取照片编号
        let photoNumber = index + 1;
        const numberMatch = file.match(/(\d+)/);
        if (numberMatch) {
          photoNumber = parseInt(numberMatch[1]);
        }
        
        return {
          id: `${rollId}_${photoNumber}`,
          filename: file,
          url: `/api/rollPhotos/image/${rollId}/${file}`,
          photoNumber: photoNumber,
          rollId: rollId
        };
      })
      .sort((a, b) => a.photoNumber - b.photoNumber);
    
    res.json({
      success: true,
      data: rollPhotos
    });
    
  } catch (error) {
    console.error('获取胶卷照片失败:', error);
    res.status(500).json({
      success: false,
      message: '获取胶卷照片失败',
      error: error.message
    });
  }
});

// 获取胶卷照片图片
router.get('/image/:rollId/:filename', (req, res) => {
  try {
    const { rollId, filename } = req.params;
    const rollPhotosDir = path.join(__dirname, '../uploads/Film_roll', `roll_${rollId.padStart(3, '0')}`, 'photos');
    const imagePath = path.join(rollPhotosDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: '图片文件不存在'
      });
    }
    
    // 设置正确的Content-Type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.gif') contentType = 'image/gif';
    if (ext === '.bmp') contentType = 'image/bmp';
    if (ext === '.webp') contentType = 'image/webp';
    
    res.setHeader('Content-Type', contentType);
    res.sendFile(imagePath);
  } catch (error) {
    console.error('获取胶卷照片图片失败:', error);
    res.status(500).json({
      success: false,
      message: '获取图片失败'
    });
  }
});

module.exports = router;