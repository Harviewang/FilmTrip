import React, { useState, useCallback, useEffect } from 'react';
import { useLazyImage } from '../hooks/useLazyLoading';
import { simpleDetectImageNeedsRotation, getImageTransform } from '../utils/imageOrientation';

/**
 * 懒加载图片组件
 * @param {Object} props
 * @param {string} props.src 图片源地址
 * @param {string} props.alt 图片alt属性
 * @param {string} props.className CSS类名
 * @param {string} props.placeholder 占位符图片
 * @param {Function} props.onClick 点击事件
 * @param {Object} props.lazyOptions 懒加载选项
 * @param {boolean} props.autoOrientation 是否自动处理图片方向
 * @returns {JSX.Element}
 */
const LazyImage = ({
  src,
  alt = '',
  className = '',
  placeholder = null,
  onClick,
  lazyOptions = {},
  autoOrientation = true,
  ...props
}) => {
  const { ref, imageSrc, isLoading, hasError, onLoad, onError, retry } = useLazyImage(
    src,
    placeholder,
    lazyOptions
  );
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [needsRotation, setNeedsRotation] = useState(false);
  const [imageRotation, setImageRotation] = useState(0);

  const handleLoad = useCallback((e) => {
    setImageLoaded(true);
    onLoad(e);
    
    // 简化图片方向处理：SVG图片不需要旋转
    if (autoOrientation && imageSrc && !imageSrc.includes('.svg') && !imageSrc.includes('image/svg')) {
      simpleDetectImageNeedsRotation(imageSrc).then((needs) => {
        setNeedsRotation(needs);
        if (needs) {
          // 如果检测到需要旋转，应用90度旋转
          setImageRotation(90);
        } else {
          setImageRotation(0);
        }
      }).catch(() => {
        // 检测失败时不旋转
        setNeedsRotation(false);
        setImageRotation(0);
      });
    } else {
      // SVG或检测失败时不旋转
      setNeedsRotation(false);
      setImageRotation(0);
    }
  }, [onLoad, autoOrientation, imageSrc]);

  const handleError = useCallback((e) => {
    console.error('图片加载失败:', src, e);
    onError(e);
  }, [onError, src]);

  const handleClick = useCallback((e) => {
    if (onClick && !isLoading && !hasError) {
      onClick(e);
    }
  }, [onClick, isLoading, hasError]);

  // 构建CSS类名
  const imageClassName = [
    className,
    autoOrientation ? 'image-orientation-auto' : '',
    onClick ? 'cursor-pointer' : '',
    'transition-all duration-300'
  ].filter(Boolean).join(' ');

  // 图片样式对象
  const imageStyle = {
    width: '100%',
    height: '100%',
    opacity: imageLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
    imageOrientation: autoOrientation ? 'from-image' : 'none',
    objectFit: className && className.includes('gallery-photo') ? 'contain' : 'cover',
    transform: autoOrientation && imageRotation > 0 ? `rotate(${imageRotation}deg)` : 'none',
    transformOrigin: 'center center'
  };

  return (
    <div ref={ref} className="relative w-full h-full">
      {/* 骨架屏占位符 - 在图片未加载或正在加载时显示 */}
      {(!imageSrc || isLoading || !imageLoaded) && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shimmer" />
        </div>
      )}
      
      {/* 错误占位符 */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs mb-2">加载失败</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                retry();
              }}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      )}
      
      {/* 实际图片 */}
      {imageSrc && !hasError && (
        <img
          src={imageSrc}
          alt={alt}
          className={imageClassName}
          onClick={handleClick}
          onLoad={handleLoad}
          onError={handleError}
          onDragStart={(e) => e.preventDefault()} // 禁用图片拖拽
          draggable={false} // 禁用拖拽属性
          style={imageStyle}
          {...props}
        />
      )}
      
      {/* 加载指示器 - 更明显的动画 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">加载中...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;