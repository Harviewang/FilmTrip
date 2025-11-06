import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 懒加载Hook
 * @param {Object} options 配置选项
 * @param {string} options.rootMargin Intersection Observer的rootMargin
 * @param {number} options.threshold Intersection Observer的threshold
 * @returns {Object} { ref, isIntersecting, hasLoaded }
 */
export const useLazyLoading = (options = {}) => {
  const {
    rootMargin = '50px', // 减少预加载距离，确保真正的懒加载
    threshold = 0.1,
    root = null // 允许自定义根元素
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef(null);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 检查浏览器支持
    if (!window.IntersectionObserver) {
      // 降级方案：直接加载
      setIsIntersecting(true);
      setHasLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 添加小延迟确保组件已完全挂载
          timeoutRef.current = setTimeout(() => {
            setIsIntersecting(true);
            setHasLoaded(true);
            // 立即停止观察以提升性能
            observer.unobserve(element);
          }, 100);
        }
      },
      {
        root,
        rootMargin,
        threshold
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [rootMargin, threshold, root]);

  return { ref, isIntersecting, hasLoaded };
};

/**
 * 懒加载图片组件Hook
 * @param {string} src 图片源地址
 * @param {string} placeholder 占位符地址
 * @param {Object} options 懒加载选项
 * @returns {Object} { ref, imageSrc, isLoading, hasError, onLoad, onError }
 */
export const useLazyImage = (src, placeholder = null, options = {}) => {
  const { ref, hasLoaded } = useLazyLoading(options);
  const [imageSrc, setImageSrc] = useState(null); // 初始为null，不显示任何图片
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  useEffect(() => {
    if (!hasLoaded || !src) return;

    setIsLoading(true);
    setHasError(false);
    retryCountRef.current = 0;

    const loadImage = () => {
      const img = new Image();
      imageRef.current = img;
      
      img.onload = () => {
        // 检查组件是否仍然挂载
        if (imageRef.current === img) {
          setImageSrc(src);
          setIsLoading(false);
          setHasError(false);
        }
      };
      
      img.onerror = () => {
        if (imageRef.current === img) {
          retryCountRef.current++;
          if (retryCountRef.current < maxRetries) {
            // 延迟重试
            setTimeout(loadImage, 1000 * retryCountRef.current);
          } else {
            setHasError(true);
            setIsLoading(false);
          }
        }
      };
      
      img.src = src;
    };

    loadImage();

    return () => {
      // 清理图片引用，防止内存泄漏
      if (imageRef.current) {
        imageRef.current.onload = null;
        imageRef.current.onerror = null;
        imageRef.current = null;
      }
    };
  }, [hasLoaded, src]);

  const onLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const onError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const retry = useCallback(() => {
    if (src && hasLoaded) {
      setHasError(false);
      setIsLoading(true);
      retryCountRef.current = 0;
      
      const img = new Image();
      imageRef.current = img;
      
      img.onload = () => {
        if (imageRef.current === img) {
          setImageSrc(src);
          setIsLoading(false);
        }
      };
      
      img.onerror = () => {
        if (imageRef.current === img) {
          setHasError(true);
          setIsLoading(false);
        }
      };
      
      img.src = src;
    }
  }, [src, hasLoaded]);

  return {
    ref,
    imageSrc,
    isLoading: isLoading && hasLoaded,
    hasError,
    onLoad,
    onError,
    retry
  };
};

export default useLazyLoading;