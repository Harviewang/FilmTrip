import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 下拉刷新Hook
 * @param {Function} onRefresh 刷新回调函数
 * @param {Object} options 配置选项
 * @param {number} options.threshold 触发刷新的阈值（像素）
 * @param {number} options.maxPullDistance 最大下拉距离
 * @param {boolean} options.disabled 是否禁用下拉刷新
 * @returns {Object} { pullDistance, isRefreshing, isPulling, containerRef, handleTouchStart, handleTouchMove, handleTouchEnd }
 */
export const usePullToRefresh = (onRefresh, options = {}) => {
  const {
    threshold = 80,
    maxPullDistance = 120,
    disabled = false
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [canPull, setCanPull] = useState(false);
  
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const lastTouchRef = useRef(0);

  // 检查是否可以下拉（容器是否在顶部）
  const checkCanPull = useCallback(() => {
    if (!containerRef.current) return false;
    return containerRef.current.scrollTop === 0;
  }, []);

  // 通用的开始处理函数
  const handleStart = useCallback((clientY) => {
    if (disabled || isRefreshing) return false;
    
    setStartY(clientY);
    touchStartRef.current = clientY;
    const canPullNow = checkCanPull();
    setCanPull(canPullNow);
    return canPullNow;
  }, [disabled, isRefreshing, checkCanPull]);

  // 通用的移动处理函数
  const handleMove = useCallback((clientY) => {
    if (disabled || isRefreshing || !touchStartRef.current) return;

    const deltaY = clientY - touchStartRef.current;
    const container = containerRef.current;
    if (!container) return;

    // 如果不在顶部，将拖动转换为页面滚动
    if (container.scrollTop > 0 || deltaY < 0) {
      const scrollAmount = -(deltaY - (lastTouchRef.current - touchStartRef.current)) * 1.5;
      container.scrollBy(0, scrollAmount);
      lastTouchRef.current = clientY;
      return;
    }

    // 只有在页面顶部且向下拖动时才处理下拉刷新
    if (deltaY > 0 && container.scrollTop === 0) {
      // 计算下拉距离，使用阻尼效果
      const distance = Math.min(deltaY * 0.5, maxPullDistance);
      setPullDistance(distance);
      setIsPulling(distance > 10); // 添加最小拖动距离避免误触
      lastTouchRef.current = clientY;
    } else {
      // 如果不满足下拉条件，重置状态
      if (pullDistance > 0) {
        setPullDistance(0);
        setIsPulling(false);
      }
    }
  }, [disabled, isRefreshing, maxPullDistance, pullDistance]);

  // 通用的结束处理函数
  const handleEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    touchStartRef.current = null;
    setCanPull(false);

    // 如果下拉距离超过阈值，触发刷新
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setIsPulling(false);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('刷新失败:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // 回弹动画
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  // 触摸事件处理
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    handleStart(touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches[0]) {
      const touch = e.touches[0];
      const deltaY = touch.clientY - (touchStartRef.current || 0);
      const container = containerRef.current;
      
      // 只有在向下拉动且容器确实在顶部时才阻止默认行为
      if (deltaY > 0 && container && container.scrollTop === 0) {
        // 只有在真正触发下拉刷新时才阻止默认滚动
        if (pullDistance > 10 || deltaY > 15) { // 增加最小阈值避免误触
          e.preventDefault();
          e.stopPropagation();
        }
      }
      handleMove(touch.clientY);
    }
  }, [handleMove, pullDistance]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // 移除鼠标事件处理，只保留触摸事件

  // 监听滚动事件，重置状态
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 0 && isPulling) {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isPulling]);

  return {
    pullDistance,
    isRefreshing,
    isPulling,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

export default usePullToRefresh;