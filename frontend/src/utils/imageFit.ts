type ViewMode = 'standard' | 'immersive';

/**
 * 计算旋转后的等比尺寸，使长边贴视口 80%（沉浸=90%），短边自适应
 * 根据浏览器尺寸合理摆放在中间，标准预览看大图+详情，沉浸预览看图片细节
 */
export function getFittedSizeAfterRotate(
  imgWidth: number,
  imgHeight: number,
  rotateDeg: number,
  viewMode: ViewMode = 'standard',
  viewport?: {
    width?: number;
    height?: number;
  }
): { width: number; height: number } {
  if (!imgWidth || !imgHeight) return { width: 0, height: 0 };

  // 目标比例：沉浸=90%，标准=80%（根据浏览器尺寸合理摆放在中间）
  const MAX_W_RATIO = viewMode === 'immersive' ? 0.9 : 0.8;
  const MAX_H_RATIO = viewMode === 'immersive' ? 0.9 : 0.8;

  // 注意：移动端建议用视觉视口单位（见文末细节）
  const vw =
    viewport?.width ??
    (typeof window !== 'undefined' ? window.innerWidth : 0);
  const vh =
    viewport?.height ??
    (typeof window !== 'undefined' ? window.innerHeight : 0);

  const maxW = vw * MAX_W_RATIO;
  const maxH = vh * MAX_H_RATIO;
  
  // 核心修复：旋转时不改变尺寸，始终按照原始图片的宽高比计算
  // 这样旋转前后，CSS 的 width/height 保持不变，只有 transform: rotate() 改变
  
  // 计算两种缩放方案
  const scaleByWidth = maxW / imgWidth;  // 按原始宽度缩放
  const scaleByHeight = maxH / imgHeight; // 按原始高度缩放
  
  // 选择不会超出边界的最大缩放比例
  const scale = Math.min(scaleByWidth, scaleByHeight);
  
  const width = imgWidth * scale;
  const height = imgHeight * scale;

  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height)),
  };
}
