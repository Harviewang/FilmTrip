import React from 'react';

/**
 * 自适应布局组件
 * 提供统一的页面布局结构，支持全宽度和全高度自适应
 */
const AdaptiveLayout = ({ 
  children, 
  className = '', 
  header, 
  footer,
  fullWidth = false,
  fullHeight = true,
  container = true,
  padding = true,
  background = 'default'
}) => {
  // 背景样式映射
  const backgroundStyles = {
    default: 'bg-gradient-to-br from-gray-50 via-white to-blue-50',
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50',
    dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'
  };

  // 容器样式
  const containerClass = container 
    ? 'max-w-7xl mx-auto' 
    : 'w-full';

  // 内边距样式
  const paddingClass = padding 
    ? 'px-4 sm:px-6 lg:px-8' 
    : '';

  // 高度样式
  const heightClass = fullHeight 
    ? 'h-full min-h-screen' 
    : 'h-auto';

  // 宽度样式
  const widthClass = fullWidth 
    ? 'w-full' 
    : 'w-full';

  return (
    <div className={`${widthClass} ${heightClass} ${backgroundStyles[background]} ${className}`}>
      <div className="w-full h-full flex flex-col">
        {/* 页面头部 */}
        {header && (
          <div className="w-full flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
            <div className={`${containerClass} ${paddingClass} py-6 sm:py-8`}>
              {header}
            </div>
          </div>
        )}

        {/* 页面内容 */}
        <main className={`w-full flex-1 ${paddingClass} py-6 sm:py-8 scrollbar-hidden`} style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <div className={containerClass}>
            {children}
          </div>
        </main>

        {/* 页面底部 */}
        {footer && (
          <div className="w-full flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
            <div className={`${containerClass} ${paddingClass} py-6 sm:py-8`}>
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 自适应网格组件
 * 提供响应式网格布局
 */
export const AdaptiveGrid = ({ 
  children, 
  className = '', 
  cols = 'auto-fit',
  gap = 'default',
  minWidth = '280px'
}) => {
  const gapStyles = {
    small: 'gap-4',
    default: 'gap-6 sm:gap-8',
    large: 'gap-8 sm:gap-12'
  };

  const gridStyles = {
    'auto-fit': `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`,
    'auto-fill': `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`,
    'responsive': `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
  };

  return (
    <div className={`grid ${gridStyles[cols]} ${gapStyles[gap]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * 自适应卡片组件
 * 提供统一的卡片样式
 */
export const AdaptiveCard = ({ 
  children, 
  className = '', 
  hover = true,
  shadow = 'default',
  rounded = 'xl'
}) => {
  const shadowStyles = {
    none: '',
    small: 'shadow-md',
    default: 'shadow-lg',
    large: 'shadow-xl',
    hover: 'shadow-lg hover:shadow-xl'
  };

  const roundedStyles = {
    none: '',
    sm: 'rounded-lg',
    default: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full'
  };

  const hoverStyles = hover 
    ? 'transition-all duration-300 hover:scale-105' 
    : '';

  return (
    <div className={`bg-white ${shadowStyles[shadow]} ${roundedStyles[rounded]} overflow-hidden ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

/**
 * 自适应按钮组件
 * 提供响应式按钮样式
 */
export const AdaptiveButton = ({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'default',
  fullWidth = false
}) => {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600',
    outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border-2 border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeStyles = {
    small: 'px-4 py-2 text-sm',
    default: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const widthStyles = fullWidth 
    ? 'w-full sm:w-auto' 
    : 'w-auto';

  return (
    <button className={`${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} rounded-lg font-medium transition-all duration-200 hover:scale-105 ${className}`}>
      {children}
    </button>
  );
};

export default AdaptiveLayout;
