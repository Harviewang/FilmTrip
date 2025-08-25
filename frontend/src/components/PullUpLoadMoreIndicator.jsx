import React from 'react';

const PullUpLoadMoreIndicator = ({ 
  pullDistance = 0, 
  isLoading = false, 
  isPulling = false, 
  threshold = 80 
}) => {
  const canLoadMore = pullDistance >= threshold;
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180; // 半圈旋转
  
  // 计算指示器的透明度和高度
  const opacity = Math.min(pullDistance / 20, 1);
  const height = Math.min(pullDistance, 60);
  
  return (
    <div 
      className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center transition-all duration-200 ease-out z-40"
      style={{
        opacity,
        height: `${height}px`,
        transform: `translateY(${Math.max(0, pullDistance - 60)}px)`,
        background: `linear-gradient(to top, rgba(59, 130, 246, ${opacity * 0.1}), rgba(59, 130, 246, ${opacity * 0.05}))`,
        width: '100%',
        pointerEvents: 'none' // 避免阻挡其他交互
      }}
    >
      {/* 加载指示器 */}
      <div className="flex items-center justify-center mb-1">
        {isLoading ? (
          // 加载中的旋转动画
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          // 上拉指示器
          <svg 
            className="w-5 h-5 text-gray-600 transition-transform duration-200" 
            style={{ transform: `rotate(${rotation}deg)` }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none"
              strokeDasharray={`${progress * 63} 63`}
              strokeDashoffset="0"
              transform="rotate(-90 12 12)"
              className="transition-all duration-200"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 15l7-7 7 7" 
            />
          </svg>
        )}
      </div>
      
      {/* 文字提示 */}
      <div className="text-xs text-gray-600 text-center px-2">
        {isLoading ? (
          '正在加载...'
        ) : canLoadMore ? (
          '松开加载更多'
        ) : (
          '上拉加载更多'
        )}
      </div>
      
      {/* 背景渐变效果 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to top, rgba(59, 130, 246, ${pullDistance / 200}), transparent)`
        }}
      />
    </div>
  );
};

export default PullUpLoadMoreIndicator;