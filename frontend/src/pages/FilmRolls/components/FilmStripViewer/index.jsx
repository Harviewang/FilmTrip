import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LazyImage from '../../../../components/LazyImage';
import API_CONFIG from '../../../../config/api.js';

/**
 * 胶片条查看器组件 - 参考第二张图的设计
 * 从胶卷筒横向拉出胶片条，显示照片
 */
const FilmStripViewer = ({ 
  filmRoll, 
  filmStock,
  isOpen = false,
  onClose,
  onStatusChange,
  className = ""
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // 重置状态当胶卷改变时
  useEffect(() => {
    if (filmRoll) {
      setCurrentPhotoIndex(0);
      setIsExpanded(false);
    }
  }, [filmRoll]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          if (isExpanded) {
            setIsExpanded(false);
          } else {
            setIsExpanded(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExpanded, currentPhotoIndex, filmRoll?.photos?.length]);

  // 处理照片路径（直接使用服务端返回路径，必要时补全前缀）
  const getPhotoPath = (photo) => {
    if (!photo) return '';
    const path = photo.thumbnail || photo.original || '';
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path.startsWith('/') ? `${API_CONFIG.BASE_URL}${path}` : path;
  };

  // 处理关闭
  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // 处理状态切换
  const handleStatusChange = async (newStatus) => {
    if (!filmRoll || !onStatusChange) return;
    
    try {
      await onStatusChange(filmRoll.id, newStatus);
    } catch (error) {
      console.error('状态更新失败:', error);
    }
  };

  // 获取状态选项
  const getStatusOptions = () => {
    const statusMap = {
      'unopened': '未拆封',
      'shooting': '拍摄中', 
      'exposed': '已曝光',
      'developed': '已冲洗',
      'scanned': '已扫描',
      'archived': '已归档'
    };
    
    return Object.entries(statusMap).map(([value, label]) => ({
      value,
      label,
      current: filmRoll?.status === value
    }));
  };

  if (!isOpen || !filmRoll || !filmRoll.photos || filmRoll.photos.length === 0) {
    return null;
  }

  const photos = filmRoll.photos;
  const currentPhoto = photos[currentPhotoIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center ${className}`}
          onClick={handleClose}
        >
          {/* 胶片条容器 */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative max-w-6xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 胶卷筒 */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
              <div className="w-16 h-24 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
              </div>
            </div>

            {/* 胶片条 */}
            <div className="bg-black rounded-lg p-4 ml-8 shadow-2xl">
              {/* 胶片条顶部 */}
              <div className="h-2 bg-gray-700 rounded-t mb-2"></div>
              
              {/* 照片网格 */}
              <div className="grid grid-cols-6 gap-2 mb-2">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    className={`aspect-square bg-gray-800 rounded overflow-hidden cursor-pointer border-2 ${
                      index === currentPhotoIndex 
                        ? 'border-yellow-400' 
                        : 'border-transparent hover:border-gray-500'
                    }`}
                    onClick={() => handlePhotoClick(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LazyImage
                      src={getPhotoPath(photo)}
                      alt={`照片 ${photo.photo_number || index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs" style={{display: 'none'}}>
                      📷
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* 胶片条底部 */}
              <div className="h-2 bg-gray-700 rounded-b"></div>
            </div>

            {/* 胶卷信息 */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <h3 className="font-medium text-gray-900 mb-1">
                {filmStock?.series || filmRoll.name}
              </h3>
              <p className="text-sm text-gray-600">
                {filmStock?.brand} {filmStock?.type} ISO {filmStock?.iso}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {filmRoll.roll_number} · {photos.length} 张照片
              </p>
              
              {/* 状态切换 */}
              <div className="mt-3">
                <label className="text-xs text-gray-600 block mb-1">状态</label>
                <select
                  value={filmRoll.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                >
                  {getStatusOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>

          {/* 照片放大查看 */}
          <AnimatePresence>
            {isExpanded && currentPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative max-w-4xl max-h-full p-4">
                  {/* 照片 */}
                  <div className="relative">
                    <LazyImage
                      src={getPhotoPath(currentPhoto)}
                      alt={`照片 ${currentPhoto.photo_number || currentPhotoIndex + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                    
                    {/* 照片信息 */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            照片 {currentPhoto.photo_number || currentPhotoIndex + 1}
                          </p>
                          {currentPhoto.taken_date && (
                            <p className="text-sm text-gray-300">
                              {new Date(currentPhoto.taken_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-300">
                          {currentPhotoIndex + 1} / {photos.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 导航按钮 */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevious}
                        disabled={currentPhotoIndex === 0}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={handleNext}
                        disabled={currentPhotoIndex === photos.length - 1}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* 关闭按钮 */}
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* 键盘快捷键提示 */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
                    <div className="space-y-1">
                      <div>← → 切换照片</div>
                      <div>空格 切换视图</div>
                      <div>ESC 关闭</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilmStripViewer;
