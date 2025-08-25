import React from 'react';

/**
 * 下拉刷新指示器组件
 * @param {Object} props
 * @param {number} props.pullDistance 下拉距离
 * @param {boolean} props.isRefreshing 是否正在刷新
 * @param {boolean} props.isPulling 是否正在下拉
 * @param {number} props.threshold 触发刷新的阈值
 * @returns {JSX.Element}
 */
const PullToRefreshIndicator = ({ 
  pullDistance = 0, 
  isRefreshing = false, 
  isPulling = false, 
  threshold = 80 
}) => {
  // 计算进度百分比
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  
  // 计算旋转角度
  const rotation = (pullDistance / threshold) * 360;
  
  // 确定显示状态
  const canRefresh = pullDistance >= threshold;
  
  return (
    <div 
      className={`absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 ease-out z-40 ${
        isPulling || isRefreshing ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        height: Math.max(pullDistance, isRefreshing ? 60 : 0),
        transform: `translateY(-${Math.max(pullDistance, isRefreshing ? 60 : 0)}px)`,
        marginTop: '0px', // 确保在内容区域内显示
        pointerEvents: 'none' // 避免阻挡其他交互
      }}
    >
      <div className="flex flex-col items-center space-y-2">
        {/* 刷新图标 */}
        <div className="relative">
          {isRefreshing ? (
            // 刷新中的旋转动画
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            // 下拉箭头或刷新图标
            <div 
              className={`w-6 h-6 transition-all duration-200 ${
                canRefresh ? 'text-blue-500' : 'text-gray-400'
              }`}
              style={{
                transform: `rotate(${canRefresh ? 180 : rotation}deg)`
              }}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-full h-full"
              >
                {canRefresh ? (
                  // 刷新图标
                  <>
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </>
                ) : (
                  // 下拉箭头
                  <>
                    <polyline points="6 9 12 15 18 9" />
                  </>
                )}
              </svg>
            </div>
          )}
          
          {/* 进度环 */}
          {!isRefreshing && isPulling && (
            <svg 
              className="absolute inset-0 w-8 h-8 -m-1" 
              viewBox="0 0 32 32"
            >
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke={canRefresh ? '#3b82f6' : '#9ca3af'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="87.96"
                strokeDashoffset={87.96 - (87.96 * progress) / 100}
                transform="rotate(-90 16 16)"
                className="transition-all duration-200"
              />
            </svg>
          )}
        </div>
        
        {/* 提示文字 */}
        <div className={`text-xs font-medium transition-all duration-200 ${
          isRefreshing ? 'text-blue-500' : canRefresh ? 'text-blue-500' : 'text-gray-400'
        }`}>
          {isRefreshing ? '正在刷新...' : canRefresh ? '松开刷新' : '下拉刷新'}
        </div>
      </div>
      
      {/* 背景渐变 - 调整为更透明，避免遮挡 */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-transparent pointer-events-none"
        style={{
          opacity: Math.min(pullDistance / 80, 0.3)
        }}
      />
    </div>
  );
};

export default PullToRefreshIndicator;