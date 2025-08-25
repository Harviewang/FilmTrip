import React, { useEffect, useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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

  // 键盘快捷键
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
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
      {/* 关闭按钮 */}
      <div className={`absolute top-4 right-4 z-10 transition-all duration-300 ease-out ${
        uiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
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
      <div className={`${isZoomed ? 'absolute inset-0 flex items-center justify-center' : 'relative w-full flex flex-col items-center justify-center'} ${isZoomed ? 'p-0' : 'p-4'}`}>
        {/* 照片容器 */}
        <div 
          className={`relative ${isZoomed ? 'max-h-[95vh] max-w-[95vw]' : 'max-h-[80vh]'} max-w-full flex items-center justify-center transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            imageLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-12'
          }`}
          onClick={() => setIsZoomed(prev => !prev)}
        >
          {/* 加载指示器 */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <img
            src={photo.original ? `http://localhost:3001${photo.original}` : (photo.thumbnail ? `http://localhost:3001${photo.thumbnail}` : '')}
            alt={photo.title || '照片'}
            className={`${isZoomed ? 'max-h-[95vh]' : 'max-h-[80vh]'} max-w-full object-contain rounded-lg shadow-2xl transition-all duration-800 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
              imageLoaded ? 'opacity-100 scale-100 rotate-0 translate-y-0' : 'opacity-0 scale-75 rotate-1 translate-y-12'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error('照片加载失败:', e.target.src);
              e.target.style.display = 'none';
              setImageLoaded(true);
            }}
          />
        </div>

        {/* 照片信息区域 - 底部信息块 */}
        {!isZoomed && (
          <div className={`mt-4 flex justify-center transition-all duration-500 ease-out ${
            uiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* 照片信息 - 上下布局，参考 camarts.cn 设计 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-sm max-w-4xl">
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
              
              {/* 胶卷 */}
              {(photo._raw && photo._raw.film_stock) && (
                <div className="text-center">
                  <div className="text-gray-600 font-medium mb-1">胶卷</div>
                  <div className="text-gray-900">{photo._raw.film_stock.brand} {photo._raw.film_stock.series}</div>
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
