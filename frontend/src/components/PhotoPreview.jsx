import React, { useEffect, useState, useCallback, useRef } from 'react';
import API_CONFIG from '../config/api';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ShareIcon, LinkIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline';

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
  const [rotateDeg, setRotateDeg] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const [baseIsPortrait, setBaseIsPortrait] = useState(false);
  const infoRef = useRef(null);
  const imgRef = useRef(null);
  const [infoHeight, setInfoHeight] = useState(0);
  const [viewportH, setViewportH] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));
  const [imgAspect, setImgAspect] = useState(null); // w/h

  const getExifInitialRotation = useCallback(() => {
    // 后端派生图已应用EXIF旋转且strip元数据，前端不再自动旋转，仅响应用户点击
    return 0;
  }, []);

  // 监听并测量信息面板高度，标准模式下用于为图片预留空间
  useEffect(() => {
    const measure = () => {
      if (uiVisible && infoRef.current) {
        setInfoHeight(infoRef.current.clientHeight || 0);
      } else {
        setInfoHeight(0);
      }
      if (typeof window !== 'undefined') {
        setViewportH(window.innerHeight || 800);
      }
    };
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    const t = setTimeout(measure, 0);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
  }, [uiVisible, photo, viewMode]);

  // 控制组件显示动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setImageLoaded(false);
      setIsClosing(false);
    } else {
      setIsClosing(true);
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
    setRotateDeg(0);
    // 不再应用EXIF初始方向（派生图已校正），初始为0，仅响应用户旋转按钮
    setRotateDeg(0);
    // 预估纵横：若有尺寸（派生图已校正，直接基于宽高判断）
    const w = photo?.thumbnail_width || photo?._raw?.thumbnail_width || photo?._raw?.width;
    const h = photo?.thumbnail_height || photo?._raw?.thumbnail_height || photo?._raw?.height;
    if (w && h) {
      const base = h > w;
      setBaseIsPortrait(base);
      setIsPortrait(base);
    } else {
      setBaseIsPortrait(false);
      setIsPortrait(false);
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

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 backdrop-blur-md z-[9999] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
      isClosing ? 'opacity-0 scale-90 translate-y-8' : 'opacity-100 scale-100 translate-y-0'
    }`}>
      {/* 顶部工具栏 */}
      <div className={`absolute top-4 right-4 z-10 flex items-center space-x-2 transition-all duration-300 ease-out ${
        uiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        {/* 旋转按钮（放在分享前面） */}
        <button
          onClick={() => {
            setRotateDeg((d) => {
              const next = (d + 90) % 360;
              // 根据旋转角度动态更新isPortrait
              const rotated = next === 90 || next === 270 ? !baseIsPortrait : baseIsPortrait;
              setIsPortrait(rotated);
              return next;
            });
          }}
          className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        >
          <ArrowUturnRightIcon className="w-5 h-5 text-gray-700" />
        </button>
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
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ease-out ${
            uiVisible && !isZoomed ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-4'
          }`}>
            <button
              onClick={() => navigateToPhoto('prev')}
              className="p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ease-out ${
            uiVisible && !isZoomed ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
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
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 照片容器 */}
        <div 
          className={`relative flex items-center justify-center transition-all duration-500 ease-out ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setViewMode(prev => {
              const next = prev === 'standard' ? 'immersive' : 'standard';
              // 切换到沉浸：隐藏所有 UI（包含 EXIF 信息）；切回标准：显示 UI
              setUiVisible(next === 'standard');
              return next;
            });
          }}
          style={{
            maxWidth: '95vw',
            maxHeight: viewMode === 'immersive' ? '95vh' : '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* 加载指示器 */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <img
            src={photo.size2048 ? `${API_CONFIG.BASE_URL}${photo.size2048}?v=${Date.now()}` : (photo.size1024 ? `${API_CONFIG.BASE_URL}${photo.size1024}?v=${Date.now()}` : (photo.original ? `${API_CONFIG.BASE_URL}${photo.original}?v=${Date.now()}` : (photo.thumbnail ? `${API_CONFIG.BASE_URL}${photo.thumbnail}?v=${Date.now()}` : '')))}
            alt={photo.title || '照片'}
            className="rounded-lg shadow-2xl transition-all duration-700 ease-in-out"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              opacity: imageLoaded ? 1 : 0,
              imageOrientation: 'from-image',
              transform: `rotate(${rotateDeg}deg)`
            }}
            ref={imgRef}
            onLoad={(e) => {
              setImageLoaded(true);
              try {
                const img = e.currentTarget;
                if (img && img.naturalWidth && img.naturalHeight) {
                  setImgAspect(img.naturalWidth / img.naturalHeight);
                  // 记录图像自然方向（派生图已校正）
                  const portrait = img.naturalHeight > img.naturalWidth;
                  setBaseIsPortrait(portrait);
                  // 根据当前旋转角度计算实际方向
                  const rotated = rotateDeg === 90 || rotateDeg === 270 ? !portrait : portrait;
                  setIsPortrait(rotated);
                }
              } catch {}
            }}
            onError={(e) => {
              console.error('照片加载失败:', e.target.src);
              e.target.style.display = 'none';
              setImageLoaded(true);
            }}
          />
        </div>

        {/* 照片信息区域 - 绝对定位在底部，不会与图片重叠 */}
        {uiVisible && (
        <div ref={infoRef} className={`absolute bottom-4 left-0 right-0 flex justify-center transition-all duration-300 ease-out ${
          uiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
            {/* 照片信息 - 上下布局，参考 camarts.cn 设计 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-sm max-w-6xl">
              {/* 评分 */}
              {photo.rating && (
                <div className="text-center">
                  <div className="text-gray-600 font-medium mb-1">评级</div>
                  <div className="flex items-center justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`${
                        (photo.rating || 0) >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}>★</span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 拍摄时间 */}
              {photo.date && (
                <div className="text-center">
                  <div className="text-gray-600 font-medium mb-1">拍摄时间</div>
                  <div className="text-gray-900">{photo.date}</div>
                </div>
              )}
              
              {/* 拍摄地点 */}
              {(photo._raw && photo._raw.location_name) && (
                <div className="text-center">
                  <div className="text-gray-600 font-medium mb-1">拍摄地点</div>
                  <div className="text-gray-900">{photo._raw.location_name}</div>
                </div>
              )}
              
              {/* 胶卷信息 */}
              {(photo.film_roll_brand || photo.film_roll_name) && (
                <div className="text-center">
                  <div className="text-gray-600 font-medium mb-1">胶卷</div>
                  <div className="text-gray-900">
                    {photo.film_roll_brand && photo.film_roll_name 
                      ? `${photo.film_roll_brand} ${photo.film_roll_name}`
                      : photo.film_roll_name || photo.film_roll_brand
                    }
                  </div>
                  {photo.film_roll_iso && (
                    <div className="text-gray-500 text-xs">ISO {photo.film_roll_iso}</div>
                  )}
                </div>
              )}
              
              {/* 胶卷编号 */}
              {photo.photo_serial_number && (
                <div className="text-center">
                  <div className="text-gray-600 font-medium mb-1">编号</div>
                  <div className="text-gray-900 text-xs">{photo.photo_serial_number}</div>
                </div>
              )}
              
              {/* 相机 */}
              {photo.camera && (
                <div className="text-center">
                  <div className="text-gray-600 font-medium mb-1">相机</div>
                  <div className="text-gray-900">{photo.camera}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    );
  };

export default PhotoPreview;
