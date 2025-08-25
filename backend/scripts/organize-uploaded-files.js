const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const organizeUploadedFiles = async () => {
  try {
    console.log('开始整理上传的文件...');
    
    const testDir = path.join(__dirname, '../uploads/test');
    const targetDir = path.join(__dirname, '../uploads');
    
    // 1. 整理相机文件
    console.log('\n📷 整理相机文件...');
    await organizeCameras(testDir, targetDir);
    
    // 2. 整理胶片品类文件
    console.log('\n🎞️ 整理胶片品类文件...');
    await organizeFilmStocks(testDir, targetDir);
    
    // 3. 整理胶卷实例文件
    console.log('\n📦 整理胶卷实例文件...');
    await organizeFilmRolls(testDir, targetDir);
    
    // 4. 整理照片文件
    console.log('\n📸 整理照片文件...');
    await organizePhotos(testDir, targetDir);
    
    console.log('\n🎉 所有文件整理完成！');
    
  } catch (error) {
    console.error('整理文件失败:', error);
  }
};

// 整理相机文件
const organizeCameras = async (testDir, targetDir) => {
  const cameraDir = path.join(testDir, 'Camera');
  const targetCameraDir = path.join(targetDir, 'cameras');
  
  if (!fs.existsSync(targetCameraDir)) {
    fs.mkdirSync(targetCameraDir, { recursive: true });
  }
  
  const manufacturers = fs.readdirSync(cameraDir).filter(f => 
    fs.statSync(path.join(cameraDir, f)).isDirectory() && !f.startsWith('.')
  );
  
  let cameraCount = 0;
  for (const manufacturer of manufacturers) {
    const manufacturerDir = path.join(cameraDir, manufacturer);
    const models = fs.readdirSync(manufacturerDir).filter(f => 
      fs.statSync(path.join(manufacturerDir, f)).isDirectory() && !f.startsWith('.')
    );
    
    for (const model of models) {
      const modelDir = path.join(manufacturerDir, model);
      const files = fs.readdirSync(modelDir).filter(f => 
        !f.startsWith('.') && /\.(jpg|jpeg|png|gif)$/i.test(f)
      );
      
      if (files.length > 0) {
        const sourceFile = path.join(modelDir, files[0]);
        const targetFileName = `${manufacturer}_${model}_135mm.jpg`;
        const targetFile = path.join(targetCameraDir, targetFileName);
        
        // 复制并重命名
        fs.copyFileSync(sourceFile, targetFile);
        
        // 生成缩略图
        const thumbnailFile = path.join(targetCameraDir, `${manufacturer}_${model}_135mm_thumb.jpg`);
        await generateThumbnail(sourceFile, thumbnailFile, 200, 200);
        
        console.log(`✅ 相机: ${targetFileName}`);
        cameraCount++;
      }
    }
  }
  
  console.log(`📷 共整理 ${cameraCount} 个相机`);
};

// 整理胶片品类文件
const organizeFilmStocks = async (testDir, targetDir) => {
  const filmStocksDir = path.join(testDir, 'Film_Stocks');
  const targetFilmStocksDir = path.join(targetDir, 'film_stocks');
  
  if (!fs.existsSync(targetFilmStocksDir)) {
    fs.mkdirSync(targetFilmStocksDir, { recursive: true });
  }
  
  const manufacturers = fs.readdirSync(filmStocksDir).filter(f => 
    fs.statSync(path.join(filmStocksDir, f)).isDirectory() && !f.startsWith('.')
  );
  
  let filmStockCount = 0;
  for (const manufacturer of manufacturers) {
    const manufacturerDir = path.join(filmStocksDir, manufacturer);
    const models = fs.readdirSync(manufacturerDir).filter(f => 
      fs.statSync(path.join(manufacturerDir, f)).isDirectory() && !f.startsWith('.')
    );
    
    for (const model of models) {
      const modelDir = path.join(manufacturerDir, model);
      const files = fs.readdirSync(modelDir).filter(f => 
        !f.startsWith('.') && /\.(jpg|jpeg|png|gif)$/i.test(f)
      );
      
      if (files.length > 0) {
        const sourceFile = path.join(modelDir, files[0]);
        const targetFileName = `${manufacturer}_${model}_135mm.jpg`;
        const targetFile = path.join(targetFilmStocksDir, targetFileName);
        
        // 复制并重命名
        fs.copyFileSync(sourceFile, targetFile);
        
        // 生成缩略图
        const thumbnailFile = path.join(targetFilmStocksDir, `${manufacturer}_${model}_135mm_thumb.jpg`);
        await generateThumbnail(sourceFile, thumbnailFile, 200, 200);
        
        console.log(`✅ 胶片品类: ${targetFileName}`);
        filmStockCount++;
      }
    }
  }
  
  console.log(`🎞️ 共整理 ${filmStockCount} 个胶片品类`);
};

// 整理胶卷实例文件
const organizeFilmRolls = async (testDir, targetDir) => {
  const filmRollDir = path.join(testDir, 'Film_Roll');
  const targetFilmRollDir = path.join(targetDir, 'film_rolls');
  
  if (!fs.existsSync(targetFilmRollDir)) {
    fs.mkdirSync(targetFilmRollDir, { recursive: true });
  }
  
  const rollFolders = fs.readdirSync(filmRollDir).filter(f => 
    fs.statSync(path.join(filmRollDir, f)).isDirectory() && !f.startsWith('.')
  );
  
  let rollCount = 0;
  for (let i = 0; i < rollFolders.length; i++) {
    const rollFolder = rollFolders[i];
    const rollDir = path.join(filmRollDir, rollFolder);
    
    // 查找图片文件
    const imageFiles = findImageFiles(rollDir);
    
    if (imageFiles.length > 0) {
      const sourceFile = imageFiles[0];
      const rollNumber = String(i + 1).padStart(3, '0');
      const targetFileName = `roll_${rollNumber}.jpg`;
      const targetFile = path.join(targetFilmRollDir, targetFileName);
      
      // 复制并重命名
      fs.copyFileSync(sourceFile, targetFile);
      
      // 生成缩略图
      const thumbnailFile = path.join(targetFilmRollDir, `roll_${rollNumber}_thumb.jpg`);
      await generateThumbnail(sourceFile, thumbnailFile, 200, 200);
      
      console.log(`✅ 胶卷实例: ${targetFileName} (来自: ${rollFolder})`);
      rollCount++;
    }
  }
  
  console.log(`📦 共整理 ${rollCount} 个胶卷实例`);
};

// 整理照片文件
const organizePhotos = async (testDir, targetDir) => {
  const filmRollDir = path.join(testDir, 'Film_Roll');
  const targetFilmRollDir = path.join(targetDir, 'Film_roll');
  
  if (!fs.existsSync(targetFilmRollDir)) {
    fs.mkdirSync(targetFilmRollDir, { recursive: true });
  }
  
  const rollFolders = fs.readdirSync(filmRollDir).filter(f => 
    fs.statSync(path.join(filmRollDir, f)).isDirectory() && !f.startsWith('.')
  );
  
  let totalPhotos = 0;
  let rollIndex = 1;
  
  for (const rollFolder of rollFolders) {
    const rollDir = path.join(filmRollDir, rollFolder);
    const imageFiles = findImageFiles(rollDir);
    
    if (imageFiles.length > 0) {
      const rollNumber = String(rollIndex).padStart(3, '0');
      
      // 为每个胶卷创建目录结构
      const rollBaseDir = path.join(targetFilmRollDir, `roll_${rollNumber}`);
      const rollPhotosDir = path.join(rollBaseDir, 'photos');
      const rollThumbnailsDir = path.join(rollBaseDir, 'thumbnails');
      const rollPreviewsDir = path.join(rollBaseDir, 'previews');
      
      [rollBaseDir, rollPhotosDir, rollThumbnailsDir, rollPreviewsDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
      
      console.log(`🔄 处理胶卷 ${rollNumber}: ${imageFiles.length} 张照片 (来自: ${rollFolder})`);
      
      // 处理每张照片 (添加进度显示和错误处理)
      for (let i = 0; i < imageFiles.length; i++) {
        try {
          const sourceFile = imageFiles[i];
          const photoNumber = String(i + 1).padStart(3, '0');
          
          // 原始照片
          const targetPhotoFile = path.join(rollPhotosDir, `photo_${photoNumber}.jpg`);
          fs.copyFileSync(sourceFile, targetPhotoFile);
          
          // 缩略图 (400x400) - 只生成缩略图，不生成预览图以节省时间
          const thumbnailFile = path.join(rollThumbnailsDir, `photo_${photoNumber}_thumb.jpg`);
          await generateThumbnail(sourceFile, thumbnailFile, 400, 400);
          
          // 显示进度
          if ((i + 1) % 10 === 0 || i === imageFiles.length - 1) {
            console.log(`  📸 进度: ${i + 1}/${imageFiles.length}`);
          }
          
          totalPhotos++;
        } catch (error) {
          console.error(`❌ 处理照片失败 ${rollFolder} 第${i + 1}张:`, error.message);
        }
      }
      
      console.log(`✅ 胶卷 ${rollNumber} 完成: ${imageFiles.length} 张照片`);
      rollIndex++;
    }
  }
  
  console.log(`📸 共整理 ${totalPhotos} 张照片`);
};

// 递归查找图片文件
const findImageFiles = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    if (item.startsWith('.')) continue;
    
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findImageFiles(fullPath));
    } else if (/\.(jpg|jpeg|png|gif)$/i.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
};

// 生成缩略图
const generateThumbnail = async (sourceFile, targetFile, width, height) => {
  try {
    await sharp(sourceFile)
      .resize(width, height, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 85,
        progressive: true
      })
      .toFile(targetFile);
  } catch (error) {
    console.error(`生成缩略图失败 ${sourceFile}:`, error.message);
  }
};

// 运行脚本
organizeUploadedFiles();
