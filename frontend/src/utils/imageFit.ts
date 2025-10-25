type ViewMode = 'standard' | 'immersive';

/**
 * 根据EXIF方向计算图片显示尺寸
 * 标准模式：最长边占对应视口边的80%
 * 沉浸模式：图片铺满视口（100%）
 */
export function getFittedSizeAfterRotate(
  imgWidth: number,
  imgHeight: number,
  viewMode: ViewMode = 'standard',
  viewport?: {
    width?: number;
    height?: number;
  },
  exifOrientation?: number
): { width: number; height: number; exifDeg: 0|90|180|270 } {
  if (!imgWidth || !imgHeight) {
    return { width: 0, height: 0, exifDeg: 0 };
  }

  // EXIF方向映射
  const exifToDeg: Record<number, 0|90|180|270> = { 1:0, 3:180, 6:90, 8:270 };
  const exifDeg = exifOrientation ? (exifToDeg[exifOrientation] ?? 0) : 0;

  // 根据EXIF方向确定是否需要交换宽高
  const isSwap = exifDeg === 90 || exifDeg === 270;
  const displayWidth = isSwap ? imgHeight : imgWidth;
  const displayHeight = isSwap ? imgWidth : imgHeight;

  // 获取视口尺寸
  const vw = viewport?.width ?? (typeof window !== 'undefined' ? window.innerWidth : 0);
  const vh = viewport?.height ?? (typeof window !== 'undefined' ? window.innerHeight : 0);

  // 确定图片是横图还是竖图
  const isHorizontal = displayWidth > displayHeight;

  // 根据模式和图片方向计算尺寸
  let finalWidth: number;
  let finalHeight: number;

  if (viewMode === 'immersive') {
    // 沉浸模式：图片铺满视口（100%）
    const scale = Math.min(vw / displayWidth, vh / displayHeight);
    finalWidth = displayWidth * scale;
    finalHeight = displayHeight * scale;
  } else {
    // 标准模式：最长边占对应视口边的80%
    const ratio = 0.8;
    
    // 计算两个方向的缩放比例
    const scaleByWidth = (vw * ratio) / displayWidth;
    const scaleByHeight = (vh * ratio) / displayHeight;
    
    // 选择较小的缩放比例，确保图片完全在视口内且最长边达到80%
    const scale = Math.min(scaleByWidth, scaleByHeight);
    
    finalWidth = displayWidth * scale;
    finalHeight = displayHeight * scale;
  }

  return {
    width: Math.max(1, Math.round(finalWidth)),
    height: Math.max(1, Math.round(finalHeight)),
    exifDeg
  };
}
