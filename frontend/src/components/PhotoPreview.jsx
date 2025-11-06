import React, { useEffect, useState, useCallback, useRef } from 'react';
import API_CONFIG from '../config/api';
import { getFittedSize } from '../utils/imageFit.js';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ShareIcon, LinkIcon, ArrowUturnRightIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import MapPicker from './MapPicker';

/**
 * 全局通用照片预览组件
 * 支持所有页面的照片预览功能
 */
const PhotoPreview = ({
  photo,
  photos = [],
  isOpen,
  onClose,
  currentPath = '',
  showNavigation = true,
  showUI = true,
  onPhotoChange,
  compact = false // 新增紧凑模式
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [uiVisible, setUiVisible] = useState(showUI);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('standard'); // 'standard' (80%) 或 'immersive' (95%)
  const [fittedSize, setFittedSize] = useState({ width: 0, height: 0 });
  const toolbarRef = useRef(null);
  const infoRef = useRef(null);
  const imgRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [chromePadding, setChromePadding] = useState({ top: 0, bottom: 0 });
  const showChrome = viewMode === 'standard' && uiVisible;
  // 使用稳定时间戳避免每次渲染都破坏缓存
  const stableVRef = useRef(Date.now());
  // 迷你地图弹窗状态
  const [showMiniMap, setShowMiniMap] = useState(false);

  // 计算适配尺寸
  const recomputeFittedSize = useCallback(() => {
    if (!photo || !imageDimensions.width || !imageDimensions.height) {
      setFittedSize({ width: 0, height: 0 });
      return;
    }

    const baseWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const baseHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const symmetricPadding = showChrome
      ? Math.max(chromePadding.top, chromePadding.bottom)
      : 0;

    let { width, height } = getFittedSize(
      imageDimensions.width,
      imageDimensions.height,
      viewMode,
      {
        width: baseWidth,
        height: Math.max(0, baseHeight - symmetricPadding)
      }
    );

    setFittedSize({
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height))
    });
  }, [
    photo,
    imageDimensions.width,
    imageDimensions.height,
    viewMode,
    showChrome,
    chromePadding.top,
    chromePadding.bottom
  ]);

  useEffect(() => {
    recomputeFittedSize();
  }, [recomputeFittedSize]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      recomputeFittedSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recomputeFittedSize]);

  // 计算顶部和底部控制区域的占位，让图片在视觉上居中
  useEffect(() => {
    if (!showChrome) {
      setChromePadding((prev) =>
        prev.top === 0 && prev.bottom === 0 ? prev : { top: 0, bottom: 0 }
      );
      return;
    }

    const measure = () => {
      let top = 0;
      let bottom = 0;

      if (toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect();
        const styles = window.getComputedStyle(toolbarRef.current);
        const offset = parseFloat(styles.top || '0') || 0;
        top = rect.height + offset;
      }

      if (infoRef.current) {
        const rect = infoRef.current.getBoundingClientRect();
        const styles = window.getComputedStyle(infoRef.current);
        const offset = parseFloat(styles.bottom || '0') || 0;
        bottom = rect.height + offset;
      }

      if (top !== chromePadding.top || bottom !== chromePadding.bottom) {
        setChromePadding({ top, bottom });
      }
    };

    measure();
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [showChrome, imageLoaded, viewMode, photo, chromePadding]);

  // 控制组件显示动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setImageLoaded(false);
      setIsClosing(false);
      setFittedSize({ width: 0, height: 0 });
    } else {
      setIsClosing(true);
      // 关闭时重置状态
      setFittedSize({ width: 0, height: 0 });
      setViewMode('standard'); // 重置为标准模式
      setUiVisible(showUI); // 重置UI可见性
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 重置图片加载状态和缩放状态
  useEffect(() => {
    setImageLoaded(false);
    setIsZoomed(false);
    setFittedSize({ width: 0, height: 0 });
    // 预估纵横比:根据EXIF Orientation调整显示尺寸
    let w = photo?.thumbnail_width || photo?._raw?.thumbnail_width || photo?._raw?.width || photo?.width;
    let h = photo?.thumbnail_height || photo?._raw?.thumbnail_height || photo?._raw?.height || photo?.height;
    const orientation = photo?.orientation || photo?._raw?.orientation || 1;
    
    if (w && h) {
      // orientation 6(90°) 或 8(270°) 需要互换宽高,因为数据库存储的是原始物理尺寸
      const needsSwap = orientation === 6 || orientation === 8;
      if (needsSwap) {
        [w, h] = [h, w]; // 互换宽高得到显示尺寸
      }
      setImageDimensions({ width: w, height: h });
    } else {
      setImageDimensions({ width: 0, height: 0 });
    }
  }, [photo]);

  // 找到当前照片在数组中的索引
  useEffect(() => {
    if (photo && photos.length > 0) {
      const index = photos.findIndex(p => p.id === photo.id);
      if (index !== -1) {
        setCurrentPhotoIndex(index);
      }
    }
  }, [photo, photos]);

  // 生成短链接
  const generateShortLink = useCallback(() => {
    if (!photo) return '';
    return `${window.location.origin}/photo/${photo.id}`;
  }, [photo]);

  // 复制照片链接
  const copyPhotoLink = useCallback(async () => {
    const link = generateShortLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopyLinkSuccess(true);
      setTimeout(() => setCopyLinkSuccess(false), 2000);
    } catch (error) {
      console.error('复制链接失败:', error);
    }
  }, [generateShortLink]);

  // 分享照片
  const sharePhoto = useCallback(async () => {
    const link = generateShortLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title || '照片',
          text: `查看这张照片：${photo.title || '照片'}`,
          url: link
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('分享失败:', error);
          copyPhotoLink(); // 分享失败时复制链接
        }
      }
    } else {
      copyPhotoLink(); // 不支持分享时复制链接
    }
  }, [photo, generateShortLink, copyPhotoLink]);

  // 键盘快捷键
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ': // 空格键切换视图模式
          e.preventDefault();
          setViewMode(prev => prev === 'standard' ? 'immersive' : 'standard');
          break;
        case 'i':
        case 'I':
          setUiVisible(prev => !prev);
          break;
        case 's':
        case 'S':
          sharePhoto();
          break;
        case 'h':
        case 'H':
          setUiVisible(prev => !prev);
          break;
        case 'ArrowLeft':
          if (showNavigation) navigateToPhoto('prev');
          break;
        case 'ArrowRight':
          if (showNavigation) navigateToPhoto('next');
          break;
      }
    };

    // 锁定页面滚动
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, showNavigation, onClose]);

  // 导航到上一张/下一张照片
  const navigateToPhoto = (direction) => {
    if (photos.length <= 1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : photos.length - 1;
    } else {
      newIndex = currentPhotoIndex < photos.length - 1 ? currentPhotoIndex + 1 : 0;
    }
    
    const newPhoto = photos[newIndex];
    setCurrentPhotoIndex(newIndex);
    
    if (onPhotoChange) {
      onPhotoChange(newPhoto, newIndex);
    }
  };

  if (!isVisible || !photo) return null;

  const symmetricPadding = showChrome
    ? Math.max(chromePadding.top, chromePadding.bottom)
    : 0;

  const imageWidth = Math.max(1, Math.round(fittedSize.width));
  const imageHeight = Math.max(1, Math.round(fittedSize.height));

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm z-[9999] flex flex-col"
      style={{
        background: viewMode === 'immersive' ? '#000000' : 'linear-gradient(135deg, #e8f0f7 0%, #dce7f2 25%, #d0deec 50%, #c4d5e6 75%, #d0deec 100%)',
        transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isClosing ? 0 : 1
      }}
    >
      {/* 顶部工具栏 */}
      <div
        ref={toolbarRef}
        className={`absolute top-4 right-4 z-10 flex items-center space-x-2 transition-all duration-500 ease-out ${
          showChrome ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
          {/* 分享按钮 */}
          <button
            onClick={sharePhoto}
            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl relative"
          >
            <ShareIcon className="w-5 h-5 text-gray-700" />
            {copyLinkSuccess && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                链接已复制
              </div>
            )}
          </button>
          
          {/* 复制链接按钮 */}
          <button
            onClick={copyPhotoLink}
            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          >
            <LinkIcon className="w-5 h-5 text-gray-700" />
          </button>
          
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          >
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>



      {/* 导航按钮 */}
      {showNavigation && photos.length > 1 && (
        <>
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-500 ease-out ${
            viewMode === 'immersive' || (uiVisible && !isZoomed) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
          }`}>
            <button
              onClick={() => navigateToPhoto('prev')}
              className="p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-500 ease-out ${
            viewMode === 'immersive' || (uiVisible && !isZoomed) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
          }`}>
            <button
              onClick={() => navigateToPhoto('next')}
              className="p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </>
      )}

      {/* 照片显示区域 */}
      <div
        className="relative flex-1 grid place-items-center"
        style={{
          paddingTop: showChrome ? (() => {
            // 简化逻辑：直接使用视口高度的5%作为上边距
            const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
            return Math.max(chromePadding.top, windowHeight * 0.05);
          })() : 0,
          paddingBottom: showChrome ? (() => {
            // 简化逻辑：直接使用视口高度的15%作为下边距
            const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
            return Math.max(chromePadding.bottom, windowHeight * 0.15);
          })() : 0
        }}
        onClick={(e) => {
          e.stopPropagation();
          setViewMode(prev => {
            const next = prev === 'standard' ? 'immersive' : 'standard';
            // 切换到沉浸：隐藏所有 UI（包含 EXIF 信息）；切回标准：显示 UI
            setUiVisible(next === 'standard');
            return next;
          });
        }}
      >
        {/* 检查是否有图片URL */}
        {(() => {
          const imageUrl = photo.size2048 
            ? `${API_CONFIG.BASE_URL}${photo.size2048}?v=${stableVRef.current}` 
            : (photo.size1024 
              ? `${API_CONFIG.BASE_URL}${photo.size1024}?v=${stableVRef.current}` 
              : (photo.original 
                ? `${API_CONFIG.BASE_URL}${photo.original}?v=${stableVRef.current}` 
                : (photo.thumbnail 
                  ? `${API_CONFIG.BASE_URL}${photo.thumbnail}?v=${stableVRef.current}` 
                  : null)));
          
          // 如果没有图片URL（可能是受保护的照片）
          if (!imageUrl || (!photo.size2048 && !photo.size1024 && !photo.original && !photo.thumbnail)) {
            return (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-gray-200 rounded-full">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="text-gray-600 text-lg font-medium mb-2">照片受保护</div>
                  <div className="text-gray-400 text-sm">该照片已加密，需要管理员权限才能查看</div>
                </div>
              </div>
            );
          }
          
          // 有图片URL，正常显示
          return (
            <>
              {/* 加载指示器 */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              <img
                src={imageUrl}
                alt={photo.title || '照片'}
                className={`transition-all duration-400 ease-out ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  maxWidth: `${imageWidth}px`,
                  maxHeight: `${imageHeight}px`,
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                  ...(viewMode === 'standard' ? {
                    borderRadius: '16px',
                    boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 20px 48px -8px rgba(0, 0, 0, 0.18), 0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                  } : {})
                }}
                ref={imgRef}
                onLoad={(e) => {
                  setImageLoaded(true);
                  try {
                    const img = e.currentTarget;
                    if (img && img.naturalWidth && img.naturalHeight) {
                      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                    }
                  } catch {}
                }}
                onError={(e) => {
                  console.error('照片加载失败:', e.target.src);
                  e.target.style.display = 'none';
                  setImageLoaded(true);
                }}
              />
            </>
          );
        })()}

        {/* 照片信息区域 - 固定在底部，居中显示 */}
        <div ref={infoRef} className={`absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 transition-all duration-500 ease-out ${
          showChrome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}>
          <div className="max-w-6xl mx-auto px-6 py-4">
            {/* 固定显示6个字段：评分、胶卷、相机、地点、拍摄时间、加密状态 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-sm">
              {/* 1. 评分 */}
              <div className="text-center">
                <div className="text-gray-400 text-xs font-normal mb-1 whitespace-nowrap">评级</div>
                {photo.rating ? (
                  <div className="flex items-center justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`${
                        (photo.rating || 0) >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}>★</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400">-</div>
                )}
              </div>

              {/* 2. 胶卷 */}
              <div className="text-center">
                <div className="text-gray-400 text-xs font-normal mb-1 whitespace-nowrap">胶卷</div>
                {photo.film ? (
                  <div className="text-gray-900">{photo.film}</div>
                ) : (
                  <div className="text-gray-400">-</div>
                )}
              </div>

              {/* 3. 相机 */}
              <div className="text-center">
                <div className="text-gray-400 text-xs font-normal mb-1 whitespace-nowrap">相机</div>
                {photo.camera ? (
                  <div className="text-gray-900">{photo.camera}</div>
                ) : (
                  <div className="text-gray-400">-</div>
                )}
              </div>

              {/* 4. 地点 */}
              <div className="text-center">
                <div className="text-gray-400 text-xs font-normal mb-1 whitespace-nowrap">拍摄地点</div>
                {(photo.country || photo.province || photo.city || photo.district || photo.township) ? (
                  <div 
                    className="text-gray-900 cursor-pointer hover:text-blue-600 transition-colors inline-flex items-center gap-1 underline decoration-dotted underline-offset-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMiniMap(true);
                    }}
                    title="点击查看地图"
                  >
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {[photo.country, photo.province, photo.city, photo.district, photo.township]
                        .filter(Boolean)
                        .join(' ')}
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-400">-</div>
                )}
              </div>

              {/* 5. 拍摄时间 */}
              <div className="text-center">
                <div className="text-gray-400 text-xs font-normal mb-1 whitespace-nowrap">拍摄时间</div>
                {photo.date ? (
                  <div className="text-gray-900">{photo.date}</div>
                ) : (
                  <div className="text-gray-400">-</div>
                )}
              </div>

              {/* 6. 加密状态 */}
              <div className="text-center">
                <div className="text-gray-400 text-xs font-normal mb-1 whitespace-nowrap">加密状态</div>
                {photo.is_protected ? (
                  <div className="text-red-600">🔒 已加密</div>
                ) : (
                  <div className="text-gray-400">未加密</div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* 迷你地图弹窗 */}
      {showMiniMap && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
          onClick={(e) => {
            // 点击遮罩层关闭弹窗
            if (e.target === e.currentTarget) {
              setShowMiniMap(false);
            }
          }}
        >
            <div 
              className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => {
                // 阻止弹窗内容区域的点击事件冒泡
                e.stopPropagation();
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">照片位置</h2>
                  <button
                    onClick={() => setShowMiniMap(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                {/* 显示完整地址 */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">拍摄地点</div>
                  <div className="text-gray-900">
                    {[photo.country, photo.province, photo.city, photo.district, photo.township]
                      .filter(Boolean)
                      .join(' ') || '未知地点'}
                  </div>
                  {photo.latitude && photo.longitude ? (
                    <div className="text-xs text-gray-500 mt-1">
                      坐标：{photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                    </div>
                  ) : (
                    <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 rounded border border-red-200">
                      ⚠️ 由于该图片缺少定位信息，已被收监
                    </div>
                  )}
                </div>
                
                {/* 迷你地图 - 使用 MapPicker，只读显示模式 */}
                {/* 如果没有坐标，使用关塔那摩监狱坐标 (22.4642, -82.4397) */}
                {/* 预览页迷你地图默认zoom=12，符合需求文档要求 */}
                <MapPicker
                  initialLatitude={photo.latitude || 22.4642}
                  initialLongitude={photo.longitude || -82.4397}
                  initialZoom={12}
                  readOnly={true}
                  onLocationSelect={() => {}} // 预览模式下不允许修改
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoPreview;
