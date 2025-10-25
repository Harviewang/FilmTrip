type ViewMode = 'standard' | 'immersive';

/**
 * 计算图片显示尺寸
 * 标准模式：最长边占对应视口边的80%
 * 沉浸模式：图片铺满视口（100%）
 */
export function getFittedSize(
  imgWidth: number,
  imgHeight: number,
  viewMode: ViewMode = 'standard',
  viewport?: {
    width?: number;
    height?: number;
  }
): { width: number; height: number } {
  if (!imgWidth || !imgHeight) {
    return { width: 0, height: 0 };
  }

  // 获取视口尺寸
  const vw = viewport?.width ?? (typeof window !== 'undefined' ? window.innerWidth : 0);
  const vh = viewport?.height ?? (typeof window !== 'undefined' ? window.innerHeight : 0);

  // 根据模式计算尺寸
  let finalWidth: number;
  let finalHeight: number;

  if (viewMode === 'immersive') {
    // 沉浸模式：图片铺满视口（100%）
    const scale = Math.min(vw / imgWidth, vh / imgHeight);
    finalWidth = imgWidth * scale;
    finalHeight = imgHeight * scale;
  } else {
    // 标准模式：最长边占对应视口边的80%
    const ratio = 0.8;
    
    // 计算两个方向的缩放比例
    const scaleByWidth = (vw * ratio) / imgWidth;
    const scaleByHeight = (vh * ratio) / imgHeight;
    
    // 选择较小的缩放比例，确保图片完全在视口内且最长边达到80%
    const scale = Math.min(scaleByWidth, scaleByHeight);
    
    finalWidth = imgWidth * scale;
    finalHeight = imgHeight * scale;
  }

  return {
    width: Math.max(1, Math.round(finalWidth)),
    height: Math.max(1, Math.round(finalHeight))
  };
}
