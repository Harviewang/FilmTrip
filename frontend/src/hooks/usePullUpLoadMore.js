import { useState, useEffect, useRef, useCallback } from 'react';

export const usePullUpLoadMore = (onLoadMore, options = {}) => {
  const {
    threshold = 80,
    maxPullDistance = 120,
    disabled = false
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const lastTouchRef = useRef(null);
  const canPull = !disabled && !isLoading;

  // 检查是否可以上拉（滚动到底部）
  const checkCanPull = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    // 当滚动到底部时允许上拉
    return scrollTop + clientHeight >= scrollHeight - 10;
  }, []);

  // 处理开始拖动
  const handleStart = useCallback((clientY) => {
    if (!canPull || !checkCanPull()) return false;
    
    touchStartRef.current = clientY;
    lastTouchRef.current = clientY;
    setIsPulling(false);
    setPullDistance(0);
    return true;
  }, [canPull, checkCanPull]);

  // 处理拖动移动
  const handleMove = useCallback((clientY) => {
    if (!touchStartRef.current || !canPull) return;
    
    const deltaY = touchStartRef.current - clientY; // 向上拖动为正值
    const container = containerRef.current;
    if (!container) return;
    
    // 检查是否在底部
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
    
    // 如果不在底部，将拖动转换为页面滚动
    if (!isAtBottom || deltaY < 0) {
      const scrollAmount = (deltaY - (lastTouchRef.current - touchStartRef.current)) * 1.5;
      container.scrollBy(0, scrollAmount);
      lastTouchRef.current = clientY;
      return;
    }
    
    // 只有在底部且向上拖动时才处理上拉加载
    if (deltaY > 0 && isAtBottom) {
      const damping = 0.5; // 阻尼系数
      const distance = Math.min(deltaY * damping, maxPullDistance);
      
      setPullDistance(distance);
      setIsPulling(distance > 10); // 添加最小拖动距离避免误触
      lastTouchRef.current = clientY;
    } else {
      // 重置状态
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [canPull, maxPullDistance]);

  // 处理拖动结束
  const handleEnd = useCallback(async () => {
    if (!canPull) return;
    
    const shouldLoadMore = pullDistance >= threshold;
    
    if (shouldLoadMore && onLoadMore) {
      setIsLoading(true);
      try {
        await onLoadMore();
      } catch (error) {
        console.error('Load more failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    // 重置状态
    touchStartRef.current = null;
    lastTouchRef.current = null;
    setPullDistance(0);
    setIsPulling(false);
  }, [canPull, pullDistance, threshold, onLoadMore]);

  // 触摸事件处理
  const handleTouchStart = useCallback((e) => {
    if (e.touches[0]) {
      handleStart(e.touches[0].clientY);
    }
  }, [handleStart]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches[0]) {
      const touch = e.touches[0];
      const deltaY = touchStartRef.current - touch.clientY;
      
      // 直接检查容器状态，避免依赖checkCanPull函数
      const container = containerRef.current;
      const canPullNow = container && 
        container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
      
      // 只有在向上拉动且容器在底部时才处理
      if (deltaY > 0 && canPull && canPullNow) {
        handleMove(touch.clientY);
        // 只有在拖动距离超过阈值时才阻止默认行为
        if (pullDistance > 15 || deltaY > 20) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  }, [handleMove, canPull, pullDistance]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // 移除鼠标事件处理，只保留触摸事件

  return {
    pullDistance,
    isLoading,
    isPulling,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

export default usePullUpLoadMore;