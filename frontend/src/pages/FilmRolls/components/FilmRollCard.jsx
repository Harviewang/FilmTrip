import React from 'react';
import LazyImage from '../../../components/LazyImage';

/**
 * 胶卷卡片组件 - 参考第一张图的设计
 * 显示胶卷信息，支持点击展开
 */
const FilmRollCard = ({ 
  filmRoll, 
  filmStock, 
  onClick,
  className = ""
}) => {
  // 获取状态颜色和文本
  const getStatusInfo = (status) => {
    switch (status) {
      case 'unopened':
        return { color: 'bg-gray-100 text-gray-800', text: '未拆封' };
      case 'shooting':
        return { color: 'bg-blue-100 text-blue-800', text: '拍摄中' };
      case 'exposed':
        return { color: 'bg-yellow-100 text-yellow-800', text: '已曝光' };
      case 'developed':
        return { color: 'bg-purple-100 text-purple-800', text: '已冲洗' };
      case 'scanned':
        return { color: 'bg-green-100 text-green-800', text: '已扫描' };
      case 'archived':
        return { color: 'bg-gray-100 text-gray-800', text: '已归档' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: '未知' };
    }
  };

  const statusInfo = getStatusInfo(filmRoll.status);
  const stockImage = filmStock?.image_url || filmStock?.cartridge_image;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group ${className}`}
      onClick={() => onClick(filmRoll)}
    >
      {/* 胶卷包装图片区域 */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {stockImage ? (
          <LazyImage
            src={stockImage}
            alt={filmStock?.name || filmStock?.series || '胶卷'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-full flex items-center justify-center text-4xl text-gray-400" 
          style={{display: stockImage ? 'none' : 'flex'}}
        >
          🎞️
        </div>
        
        {/* 状态标识 */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
        
        {/* 胶卷编号 */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-black/70 text-white text-xs font-mono rounded">
            {filmRoll.roll_number}
          </span>
        </div>
      </div>
      
      {/* 胶卷信息区域 */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 truncate">
          {filmStock?.series || filmStock?.name || filmRoll.name || '未知胶卷'}
        </h3>
        
        <div className="space-y-2">
          {/* 胶卷规格 */}
          <div className="text-sm text-gray-600">
            {filmStock?.brand && (
              <span className="font-medium">{filmStock.brand}</span>
            )}
            {filmStock?.type && (
              <span className="ml-1">{filmStock.type}</span>
            )}
            {filmStock?.iso && (
              <span className="ml-1 text-gray-500">ISO {filmStock.iso}</span>
            )}
          </div>
          
          {/* 相机信息 */}
          {filmRoll.camera_name && (
            <div className="text-sm text-gray-600 flex items-center">
              <span className="mr-1">📷</span>
              <span className="truncate">{filmRoll.camera_name}</span>
            </div>
          )}
          
          {/* 拍摄信息 */}
          <div className="text-xs text-gray-500 space-y-1">
            {filmRoll.opened_date && (
              <div className="flex items-center">
                <span className="mr-1">📅</span>
                <span>启封: {new Date(filmRoll.opened_date).toLocaleDateString()}</span>
              </div>
            )}
            {filmRoll.location && (
              <div className="flex items-center">
                <span className="mr-1">📍</span>
                <span className="truncate">{filmRoll.location}</span>
              </div>
            )}
            {filmRoll.photo_count > 0 && (
              <div className="flex items-center">
                <span className="mr-1">📸</span>
                <span>{filmRoll.photo_count} 张照片</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 照片预览区域 */}
        {filmRoll.photos && filmRoll.photos.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">照片预览</span>
              <span className="text-xs text-gray-500">{filmRoll.photos.length} 张</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {filmRoll.photos.slice(0, 6).map((photo) => (
                <div key={photo.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                  <LazyImage
                    src={photo.thumbnail || photo.original}
                    alt={`照片 ${photo.photo_number || photo.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs" style={{display: 'none'}}>
                    📷
                  </div>
                </div>
              ))}
              {filmRoll.photos.length > 6 && (
                <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">+{filmRoll.photos.length - 6}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmRollCard;
