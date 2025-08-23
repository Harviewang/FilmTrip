import React from 'react';

const PhotoPlaceholder = ({ className = "w-full h-64", showIcon = true, showText = false, variant = "default" }) => {
  const variants = {
    default: "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 border-slate-300",
    loading: "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-amber-300",
    error: "bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 border-red-300"
  };

  const icons = {
    default: (
      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    loading: (
      <div className="relative">
        <svg className="w-8 h-8 text-amber-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-20"></div>
      </div>
    ),
    error: (
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  };

  return (
    <div className={`${className} ${variants[variant]} rounded-xl flex flex-col items-center justify-center border-2 border-dashed shadow-sm transition-all duration-300 hover:shadow-md`}>
      {showIcon && (
        <div className="mb-3">
          {icons[variant]}
        </div>
      )}
      {showText && (
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600 mb-1">
            {variant === 'loading' ? '照片加载中...' : variant === 'error' ? '加载失败' : '暂无照片'}
          </p>
          {variant === 'loading' && (
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoPlaceholder;
