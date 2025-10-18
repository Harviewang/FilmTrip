import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api.js';

const Timeline = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showUI, setShowUI] = useState(true); // 控制UI显示状态
  
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
      // 模态框打开时禁用页面滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 模态框关闭时恢复页面滚动
      document.body.style.overflow = 'unset';
    }

    return () => {
      // 组件卸载时恢复页面滚动
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
          navigate('/timeline', { replace: true });
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
            navigate(`/timeline?photo=${photos[prevIndex].id}`, { replace: true });
          }
          break;
        case 'ArrowRight':
          if (photos.length > 1) {
            const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
            const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
            setSelectedPhoto(photos[nextIndex]);
            navigate(`/timeline?photo=${photos[nextIndex].id}`, { replace: true });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal, photos, selectedPhoto, navigate]);

  // 按日期分组的照片
  const groupedPhotos = React.useMemo(() => {
    if (!photos.length) return {};
    
    const groups = {};
    photos.forEach(photo => {
      const date = photo.date || '未知日期';
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

  // 获取照片数据
  const fetchPhotos = async () => {
    try {
      console.log('开始获取照片...');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/photos`);
      console.log('API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API返回数据:', result);
      
      if (result.success && result.data && Array.isArray(result.data)) {
        console.log('照片数据数量:', result.data.length);
        
        // 转换后端数据格式为前端需要的格式
        const formattedPhotos = result.data.map(photo => {
          // 使用后端返回的图片路径，如果没有则使用默认路径
          const thumbnailPath = photo.thumbnail || `${API_CONFIG.BASE_URL}/uploads/thumbnails/${photo.filename.split('.')[0]}_thumb.jpg`;
          const originalPath = photo.original || `${API_CONFIG.BASE_URL}/uploads/${photo.filename}`;
          console.log('照片数据:', photo);
          console.log('缩略图路径:', thumbnailPath);
          console.log('原图路径:', originalPath);
          
          return {
            id: photo.id,
            title: photo.title || photo.photo_number?.toString() || '未命名照片',
            thumbnail: thumbnailPath, // 缩略图用于列表显示
            original: originalPath,   // 原图用于预览
            camera: photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机',
            camera_brand: photo.camera_brand,
            camera_model: photo.camera_model,
            film: photo.film_roll_name || photo.film_roll_number || '未知胶卷',
            film_roll_number: photo.film_roll_number,
            date: photo.taken_date || photo.uploaded_at?.split(' ')[0] || '未知日期',
            time: photo.taken_date ? '拍摄时间' : '上传时间',
            taken_date: photo.taken_date,
            photo_number: photo.photo_number,
            uploaded_at: photo.uploaded_at,
            // 保留原始数据用于加密检查
            _raw: photo
          };
        });
        
        console.log('格式化后的照片:', formattedPhotos);
        setPhotos(formattedPhotos);
      } else {
        console.log('没有照片数据或数据格式错误');
        setPhotos([]);
      }
    } catch (error) {
      console.error('获取照片失败:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  if (loading) {
    return (
              <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">正在加载...</p>
        </div>
      </div>
    );
  }

  // 渲染照片内容（处理加密照片）
  const renderPhotoContent = (photo, className = "w-full h-64 object-cover hover:scale-105 transition-transform duration-300") => {
    const isAdmin = (() => {
      try { const u = JSON.parse(localStorage.getItem('user')); return u && u.username === 'admin'; }
      catch (e) { return false; }
    })();
    const effectivePrivate = !!(photo && photo._raw && photo._raw.effective_private);
    const isPrivateForViewer = effectivePrivate && !isAdmin;

    if (isPrivateForViewer) {
      return (
        <div className={`${className} bg-gray-100 text-gray-500 flex items-center justify-center`}>
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-xs">该照片涉及隐私或他人肖像，已被管理员加密</div>
          </div>
        </div>
      );
    }

    return (
      <>
        <img
          src={photo.thumbnail}
          alt={photo.title}
          className={className}
          onError={(e) => {
            console.error('图片加载失败:', photo.thumbnail, e);
            e.target.src = '/placeholder-photo.svg';
          }}
          onLoad={() => {
            console.log('图片加载成功:', photo.thumbnail);
          }}
        />
        {effectivePrivate && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded" title="加密">
            🔒
          </div>
        )}
      </>
    );
  };

  const renderPhotoCard = (photo) => {
    console.log('渲染照片:', photo);
    
    if (viewMode === 'grid') {
      return (
        <div 
          key={photo.id} 
          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => {
            setSelectedPhoto(photo);
            setShowModal(true);
            // 更新URL，添加照片ID参数
            navigate(`/timeline?photo=${photo.id}`, { replace: true });
          }}
        >
          <div className="relative">
            {renderPhotoContent(photo, "w-full h-64 object-cover hover:scale-105 transition-transform duration-300")}
          </div>
        </div>
      );
    } else if (viewMode === 'list') {
      return (
        <div 
          key={photo.id} 
          className="flex items-start space-x-6 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => {
            setSelectedPhoto(photo);
            setShowModal(true);
            // 更新URL，添加照片ID参数
            navigate(`/timeline?photo=${photo.id}`, { replace: true });
          }}
        >
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(photo.date || '2025-01-01').split('-')[2]}
            </div>
            <div className="text-center mt-2 text-sm text-gray-500">
              {photo.date || '2025-01-01'}
            </div>
          </div>

          <div className="flex-1">
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <div className="relative">
                  {renderPhotoContent(photo, "h-48 w-full object-cover md:w-48 rounded-lg")}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {photo.title || '未命名照片'}
                </h3>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (viewMode === 'masonry') {
      return (
        <div key={photo.id} className="break-inside-avoid mb-6">
          <div 
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => {
              setSelectedPhoto(photo);
              setShowModal(true);
              // 更新URL，添加照片ID参数
              navigate(`/timeline?photo=${photo.id}`, { replace: true });
            }}
          >
            <div className="relative overflow-hidden">
              <div className="relative">
                {renderPhotoContent(photo, "w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300")}
              </div>
              {/* 悬停时的信息覆盖层 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                <div className="w-full p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-sm font-medium truncate">
                    {photo.title || '未命名照片'}
                  </h3>
                  <p className="text-xs text-gray-200 mt-1">
                    {photo.camera} • {photo.film}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 视图模式切换 */}
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'grid', label: '网格', desc: '按时间排序，懒加载' },
              { key: 'timeline', label: '时间轴', desc: '按时间分组显示' }
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === mode.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={mode.desc}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* 调试信息面板 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">调试信息</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>照片数量: {photos.length}</div>
            <div>当前视图模式: {viewMode}</div>
            <div>加载状态: {loading ? '加载中' : '加载完成'}</div>
            {photos.length > 0 && (
              <div>第一张照片数据: {JSON.stringify(photos[0], null, 2)}</div>
            )}
          </div>
        </div>

        {/* 照片展示区域 */}
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">📸</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">没有照片</h3>
            <p className="text-gray-600">请检查控制台日志</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* 网格模式：简单按时间排序，无时间轴 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => renderPhotoCard(photo))}
          </div>
        ) : (
          /* 时间轴模式：按时间分组显示 */
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {datePhotos.map((photo) => renderPhotoCard(photo))}
                </div>
              </div>
            ))}
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
                  // 清除URL中的照片参数
                  navigate('/timeline', { replace: true });
                }}
                className={`absolute top-6 right-6 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-lg ${
                  showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
            
              {/* 照片大图 - 按照 camarts.cn 设计：高度固定，宽度自适应 */}
              <div className="w-full h-full flex items-center justify-center">
                <div className={`transition-all duration-500 ease-in-out ${
                  showUI ? 'transform -translate-y-12' : 'transform translate-y-0'
                }`}>
                  <img
                    src={selectedPhoto.original || '/placeholder-photo.svg'}
                    alt={selectedPhoto.title}
                    className="h-[80vh] w-auto object-contain rounded-2xl shadow-2xl cursor-pointer"
                    onClick={() => setShowUI(!showUI)} // 点击图片切换UI显示
                    onError={(e) => {
                      console.error('原图加载失败:', selectedPhoto.original, e);
                      e.target.src = '/placeholder-photo.svg';
                    }}
                    onLoad={() => {
                      console.log('原图加载成功:', selectedPhoto.original);
                    }}
                  />
                </div>
              </div>
              
              {/* 照片信息 - 按照 camarts.cn 设计 */}
              <div className={`absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3 transition-all duration-500 ease-in-out ${
                showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
              }`}>
                <div className="max-w-4xl mx-auto">
                  {/* 主要信息 - 类似 camarts.cn 的布局 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">📷</span>
                        <span className="text-gray-900">{selectedPhoto.camera || '未知相机'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">🎞️</span>
                        <span className="text-gray-900">{selectedPhoto.film || '未知胶卷'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">📅</span>
                        <span className="text-gray-900">{selectedPhoto.date || '未知日期'}</span>
                      </div>
                    </div>
                    
                    {/* 分享链接 */}
                    <button
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/timeline?photo=${selectedPhoto.id}`;
                        navigator.clipboard.writeText(shareUrl);
                      }}
                      className="text-blue-600 hover:text-blue-500 transition-colors text-sm"
                    >
                      复制链接
                    </button>
                  </div>
                  
                  {/* 调试信息 - 临时显示，帮助排查问题 */}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div>相机名称: {selectedPhoto.camera || '无'}</div>
                        <div>相机品牌: {selectedPhoto.camera_brand || '无'}</div>
                        <div>相机型号: {selectedPhoto.camera_model || '无'}</div>
                      </div>
                      <div>
                        <div>胶卷名称: {selectedPhoto.film || '无'}</div>
                        <div>胶卷编号: {selectedPhoto.film_roll_number || '无'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 左右导航按钮 */}
              <button
                onClick={() => {
                  const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
                  setSelectedPhoto(photos[prevIndex]);
                }}
                className={`absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-lg ${
                  showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
              
              <button
                onClick={() => {
                  const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                  const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
                  setSelectedPhoto(photos[nextIndex]);
                }}
                className={`absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-lg ${
                  showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
