import React from 'react';

/**
 * 图片旋转控制组件
 * @param {string} previewUrl - 预览图片URL
 * @param {number} rotation - 当前旋转角度(0/90/180/270)
 * @param {function} onRotationChange - 旋转角度变化回调
 * @param {string} fileName - 文件名(可选)
 */
const ImageRotateControl = ({ previewUrl, rotation = 0, onRotationChange, fileName }) => {
  // 左转(逆时针90度)
  const rotateLeft = () => {
    const newRotation = (rotation - 90 + 360) % 360;
    onRotationChange(newRotation);
  };

  // 右转(顺时针90度)
  const rotateRight = () => {
    const newRotation = (rotation + 90) % 360;
    onRotationChange(newRotation);
  };

  return (
    <div className="bg-gray-50 rounded-lg">
      {/* 图片预览 */}
      <div className="flex justify-center bg-white rounded p-1">
        <div 
          className="relative flex items-center justify-center" 
          style={{ 
            width: '100px', 
            height: '100px',
            overflow: 'hidden'
          }}
        >
          <img
            src={previewUrl}
            alt="预览"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
              maxWidth: rotation % 180 === 0 ? '100%' : '100px',
              maxHeight: rotation % 180 === 0 ? '100px' : '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
      
      {/* 文件名 + 旋转按钮 */}
      <div className="p-2">
        {fileName && (
          <p className="text-xs text-gray-600 truncate mb-1">{fileName}</p>
        )}
        <div className="flex gap-1 justify-center">
          <button
            type="button"
            onClick={rotateLeft}
            className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
            title="逆时针旋转90°"
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          <span className="text-xs text-gray-500 flex items-center px-1">
            {rotation}°
          </span>
          
          <button
            type="button"
            onClick={rotateRight}
            className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
            title="顺时针旋转90°"
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageRotateControl;

