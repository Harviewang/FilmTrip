import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XMarkIcon, InformationCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import PhotoPlaceholder from '../../components/PhotoPlaceholder';

const FilmRolls = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  
  // 检查URL中是否有照片ID参数
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const photoId = urlParams.get('photo');
    if (photoId && photos.length > 0) {
      const photo = photos.find(p => p.id.toString() === photoId);
      if (photo) {
        setSelectedPhoto(photo);
        setShowModal(true);
      }
    }
  }, [location.search, photos]);

  // 控制页面滚动
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showModal) return;
      
      switch (e.key) {
        case 'Escape':
          setShowModal(false);
          navigate('/film-rolls', { replace: true });
          break;
        case 'h':
        case 'H':
          setShowUI(!showUI);
          break;
        case 'ArrowLeft':
          if (photos.length > 1) {
            const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
            setSelectedPhoto(photos[prevIndex]);
            navigate(`/film-rolls?photo=${photos[prevIndex].id}`, { replace: true });
          }
          break;
        case 'ArrowRight':
          if (photos.length > 1) {
            const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
            const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
            setSelectedPhoto(photos[nextIndex]);
            navigate(`/film-rolls?photo=${photos[nextIndex].id}`, { replace: true });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal, photos, selectedPhoto, navigate]);

  // 获取照片数据
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/photos');
        if (response.ok) {
          const result = await response.json();
          console.log('获取到的照片数据:', result);
          if (result.success && result.data && Array.isArray(result.data)) {
            setPhotos(result.data);
            console.log('照片数据设置成功，数量:', result.data.length);
          } else {
            console.error('照片数据格式错误:', result);
            setPhotos([]);
          }
        } else {
          console.error('获取照片失败:', response.status);
          setPhotos([]);
        }
      } catch (error) {
        console.error('获取照片出错:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // 按日期分组的照片
  const groupedPhotos = React.useMemo(() => {
    if (!photos.length) return {};
    
    const groups = {};
    photos.forEach(photo => {
      // 使用 uploaded_at 作为日期，如果没有则使用当前日期
      const date = photo.uploaded_at ? photo.uploaded_at.split(' ')[0] : new Date().toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(photo);
    });
    
    // 按日期排序
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a))
    );
  }, [photos]);

  // 渲染照片卡片
  const renderPhotoCard = (photo) => (
    <div
      key={photo.id} 
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => {
        setSelectedPhoto(photo);
        setShowModal(true);
        navigate(`/film-rolls?photo=${photo.id}`, { replace: true });
      }}
    >
      <div className="relative">
        <img
          src={photo.thumbnail ? `http://localhost:3001${photo.thumbnail}` : '/placeholder-image.jpg'}
          alt={photo.title || photo.photo_serial_number || '照片'}
          className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.error('缩略图加载失败:', photo.thumbnail);
            // 使用简单的占位符
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGY5ZmYiLz48L3N2Zz4=';
          }}
          onLoad={() => {
            console.log('缩略图加载成功:', photo.thumbnail);
          }}
        />
        
        {/* 照片信息覆盖层 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
          <div className="text-sm font-medium">
            {photo.photo_serial_number || `${photo.photo_number || '?'}`}
          </div>
          <div className="text-xs opacity-80">
            {photo.camera_name || photo.camera_brand || '未知相机'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* 时间轴模式：按时间分组显示 */}
      {photos.length === 0 ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📸</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">没有照片</h3>
            <p className="text-gray-600">请检查控制台日志</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-8">
            {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
              <div key={date} className="space-y-4">
                {/* 简单的日期标题 */}
                <div className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {new Date(date).toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })} · {datePhotos.length} 张照片
                </div>
                
                {/* 照片网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 sm:gap-8">
                  {datePhotos.map((photo) => renderPhotoCard(photo))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 照片详情浮层 - 全屏原图预览 */}
      {showModal && selectedPhoto && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 backdrop-blur-md flex items-center justify-center z-50 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 关闭按钮 */}
            <button
              onClick={() => {
                setShowModal(false);
                navigate('/film-rolls', { replace: true });
              }}
              className={`absolute top-6 right-6 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-lg ${
                showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* 左导航按钮 */}
            {photos.length > 1 && (
              <button
                onClick={() => {
                  const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
                  setSelectedPhoto(photos[prevIndex]);
                  navigate(`/film-rolls?photo=${photos[prevIndex].id}`, { replace: true });
                }}
                className={`absolute left-6 top-1/2 -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 hover:bg-white/90 rounded-full p-3 shadow-lg ${
                  showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                title="上一张照片 (←)"
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
            )}

            {/* 右导航按钮 */}
            {photos.length > 1 && (
              <button
                onClick={() => {
                  const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
                  const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
                  setSelectedPhoto(photos[nextIndex]);
                  navigate(`/film-rolls?photo=${photos[nextIndex].id}`, { replace: true });
                }}
                className={`absolute right-6 top-1/2 -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 hover:bg-white/90 rounded-full p-3 shadow-lg ${
                  showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                title="下一张照片 (→)"
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            )}
          
            {/* 照片大图 - 智能居中：有详情时向上偏移 */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="transition-all duration-500 ease-in-out">
                {selectedPhoto.original ? (
                  <img
                    src={`http://localhost:3001${selectedPhoto.original}`}
                    alt={selectedPhoto.title}
                    className={`w-auto object-contain rounded-2xl shadow-2xl cursor-pointer transition-all duration-500 ${
                      showUI ? 'h-[80vh] -translate-y-16' : 'h-[90vh] translate-y-0'
                    }`}
                    onClick={() => setShowUI(!showUI)}
                    onError={(e) => {
                      console.error('原图加载失败:', selectedPhoto.original, e);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('原图加载成功:', selectedPhoto.original);
                    }}
                  />
                ) : (
                  <PhotoPlaceholder 
                    className={`w-auto max-w-[80vw] transition-all duration-500 ${
                      showUI ? 'h-[80vh] -translate-y-16' : 'h-[90vh]'
                    }`} 
                    showIcon={true} 
                    showText={true} 
                    variant="loading"
                  />
                )}
              </div>
            </div>
            
            {/* 照片信息 - 居中显示 */}
            <div className={`absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 py-8 px-4 transition-all duration-500 ease-in-out ${
              showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
            }`}>
              <div className="flex flex-col items-center space-y-4 text-sm">
                {/* 主要信息居中 */}
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{selectedPhoto.camera_name || selectedPhoto.camera || '未知相机'}</span>
                  <span>•</span>
                  <span>{selectedPhoto.film_roll_name || '无'}</span>
                  <span>•</span>
                  <span>{selectedPhoto.uploaded_at ? new Date(selectedPhoto.uploaded_at).toLocaleDateString('zh-CN') : '未知日期'}</span>
                </div>
                
                {/* 照片序号和导航提示 */}
                <div className="flex items-center space-x-4 text-gray-500">
                  <span>{selectedPhoto.photo_serial_number || `${selectedPhoto.photo_number || '?'}`}</span>
                  {photos.length > 1 && (
                    <span className="text-xs">
                      {photos.findIndex(p => p.id === selectedPhoto?.id) + 1} / {photos.length}
                    </span>
                  )}
                </div>
                
                {/* 分享按钮居中 */}
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/film-rolls?photo=${selectedPhoto.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert('分享链接已复制到剪贴板');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                >
                  分享
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 调试信息 - 右下角不起眼位置，点击鼠标弹出 */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="p-2 bg-gray-800/20 hover:bg-gray-800/40 rounded-full transition-all duration-200"
          title="点击查看调试信息"
        >
          <InformationCircleIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        {showDebug && (
          <div className="absolute bottom-12 right-0 w-80 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 text-xs">
            <h3 className="font-medium text-gray-700 mb-2">调试信息</h3>
            <div className="space-y-1 text-gray-600">
              <div>照片数量: {photos.length}</div>
              <div>加载状态: {loading ? '加载中' : '加载完成'}</div>
              {photos.length > 0 && (
                <div>第一张照片数据: {JSON.stringify(photos[0], null, 2)}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmRolls;
