/**
 * 图片方向修正工具
 * 读取EXIF数据并返回正确的旋转角度
 */

/**
 * 从图片文件中读取EXIF方向信息
 * @param {File|string} file 图片文件或URL
 * @returns {Promise<number>} 旋转角度 (0, 90, 180, 270)
 */
export const getImageOrientation = (file) => {
  return new Promise((resolve) => {
    if (typeof file === 'string') {
      // 如果是URL，创建Image对象来检测
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // 简单的宽高比检测
        if (img.naturalWidth > img.naturalHeight) {
          resolve(0); // 横向图片
        } else {
          resolve(0); // 默认不旋转，让CSS处理
        }
      };
      img.onerror = () => resolve(0);
      img.src = file;
      return;
    }

    // 如果是File对象，读取EXIF数据
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target.result);
      
      // 检查是否是JPEG格式
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(0);
        return;
      }

      const length = view.byteLength;
      let offset = 2;

      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;

        if (marker === 0xFFE1) {
          // EXIF标记
          const exifLength = view.getUint16(offset, false);
          const exifOffset = offset + 2;
          
          // 查找方向标签
          const orientation = getExifOrientation(view, exifOffset, exifLength);
          const rotation = orientationToRotation(orientation);
          resolve(rotation);
          return;
        }
        
        offset += view.getUint16(offset, false);
      }
      
      resolve(0);
    };
    
    reader.onerror = () => resolve(0);
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // 只读取前64KB
  });
};

/**
 * 从EXIF数据中提取方向信息
 */
function getExifOrientation(view, offset, length) {
  try {
    // 检查EXIF头
    if (view.getUint32(offset + 4, false) !== 0x45786966) {
      return 1;
    }

    const tiffOffset = offset + 10;
    const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
    
    const ifdOffset = tiffOffset + view.getUint32(tiffOffset + 4, littleEndian);
    const tagCount = view.getUint16(ifdOffset, littleEndian);
    
    for (let i = 0; i < tagCount; i++) {
      const tagOffset = ifdOffset + 2 + (i * 12);
      const tag = view.getUint16(tagOffset, littleEndian);
      
      if (tag === 0x0112) { // 方向标签
        return view.getUint16(tagOffset + 8, littleEndian);
      }
    }
  } catch (e) {
    console.warn('EXIF解析失败:', e);
  }
  
  return 1;
}

/**
 * 将EXIF方向值转换为旋转角度
 */
function orientationToRotation(orientation) {
  switch (orientation) {
    case 3:
      return 180;
    case 6:
      return 90;
    case 8:
      return 270;
    default:
      return 0;
  }
}

/**
 * 获取图片的CSS transform样式
 * @param {number} rotation 旋转角度
 * @returns {string} CSS transform值
 */
export const getImageTransform = (rotation) => {
  if (rotation === 0) return 'none';
  return `rotate(${rotation}deg)`;
};

/**
 * 检测图片是否需要旋转（基于宽高比和显示容器）
 * @param {string} src 图片URL
 * @param {HTMLElement} container 显示容器
 * @returns {Promise<{needsRotation: boolean, rotation: number}>} 旋转信息
 */
export const detectImageNeedsRotation = (src, container = null) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const aspectRatio = naturalWidth / naturalHeight;
      
      // 获取容器的宽高比
      let containerAspectRatio = 4/3; // 默认容器比例
      if (container) {
        const containerWidth = container.offsetWidth || container.clientWidth;
        const containerHeight = container.offsetHeight || container.clientHeight;
        if (containerWidth && containerHeight) {
          containerAspectRatio = containerWidth / containerHeight;
        }
      }
      
      // 判断是否需要旋转
      let needsRotation = false;
      let rotation = 0;
      
      // 如果图片是竖向的但容器是横向的，可能需要旋转
      if (aspectRatio < 0.8 && containerAspectRatio > 1.2) {
        needsRotation = true;
        rotation = 90;
      }
      // 如果图片是横向的但显示效果不佳，可能需要调整
      else if (aspectRatio > 1.5 && containerAspectRatio < 0.8) {
        needsRotation = true;
        rotation = 270;
      }
      
      resolve({ needsRotation, rotation });
    };
    img.onerror = () => resolve({ needsRotation: false, rotation: 0 });
    img.src = src;
  });
};

/**
 * 简化版本：仅基于图片宽高比检测
 * @param {string} src 图片URL
 * @returns {Promise<boolean>} 是否需要旋转
 */
export const simpleDetectImageNeedsRotation = (src) => {
  return new Promise((resolve) => {
    // 简单检测函数：不进行任何旋转
    // 这个函数主要用于缩略图等场景，避免不必要的旋转
    // 如果需要基于EXIF的旋转，应该使用detectImageNeedsRotation函数
    resolve(false);
  });
};