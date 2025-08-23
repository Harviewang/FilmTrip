import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import PhotoPlaceholder from '../../components/PhotoPlaceholder';

const Photos = () => {
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
          navigate('/photos', { replace: true });
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
            navigate(`/photos?photo=${photos[prevIndex].id}`, { replace: true });
          }
          break;
        case 'ArrowRight':
          if (photos.length > 1) {
            const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
            const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
            setSelectedPhoto(photos[nextIndex]);
            navigate(`/photos?photo=${photos[nextIndex].id}`, { replace: true });
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
        if (result.success && result.data) {
          setPhotos(result.data);
        } else {
          console.error('照片数据格式错误:', result);
          setPhotos([]);
        }
        } else {
          console.error('获取照片失败:', response.status);
        }
      } catch (error) {
        console.error('获取照片出错:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // 渲染照片卡片
  const renderPhotoCard = (photo) => (
    <div
      key={photo.id} 
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => {
        setSelectedPhoto(photo);
        setShowModal(true);
        navigate(`/photos?photo=${photo.id}`, { replace: true });
      }}
    >
      <img
        src={photo.thumbnail ? `http://localhost:3001${photo.thumbnail}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMjAwIiB5Mj0iMjAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmMGY5ZmY7c3RvcC1vcGFjaXR5OjEiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZTBmMmZmO3N0b3Atb3BhY2l0eToxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCIgeTE9IjAiIHgyPSIyMDAiIHkyPSIyMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2YwZjlmZjtzdG9wLW9wYWNpdHk6MSIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlMGYyZmY7c3RvcC1vcGFjaXR5OjEiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8c3ZnIHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOCBzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6IiBmaWxsPSIjNjY3MzgwIi8+CjxwYXRoIGQ9Ik0xMiA3Yy0yLjc2IDAtNSA0LjI0LTUgNXMyLjI0IDUgNSA1LTUtMi4yNC01LTUgMi4yNC01IDUtNXptMCA4Yy0xLjY2IDAtMy0xLjM0LTMtM3MxLjM0LTMgMy0zIDMgMS4zNCAzIDMtMS4zNC0zLTMgM3oiIGZpbGw9IiM2NjczODAiLz4KPC9zdmc+Cjwvc3ZnPgo='}
        alt={photo.title}
                  className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          console.error('缩略图加载失败:', photo.thumbnail);
          // 使用内联SVG作为备用
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMjAwIiB5Mj0iMjAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmMGY5ZmY7c3RvcC1vcGFjaXR5OjEiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZTBmMmZmO3N0b3Atb3BhY2l0eToxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2ZyB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCIgeTE9IjAiIHgyPSIyMDAiIHkyPSIyMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2YwZjlmZjtzdG9wLW9wYWNpdHk6MSIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlMGYyZmY7c3RvcC1vcGFjaXR5OjEiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8c3ZnIHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOCBzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6IiBmaWxsPSIjNjY3MzgwIi8+CjxwYXRoIGQ9Ik0xMiA3Yy0yLjc2IDAtNSA0LjI0LTUgNXMyLjI0IDUgNSA1LTUtMi4yNC01LTUgMi4yNC01IDUtNXptMCA4Yy0xLjY2IDAtMy0xLjM0LTMtM3MxLjM0LTMgMy0zIDMgMS4zNCAzIDMtMS4zNC0zLTMgM3oiIGZpbGw9IiM2NjczODAiLz4KPC9zdmc+Cjwvc3ZnPgo=';
        }}
        onLoad={() => {
          console.log('缩略图加载成功:', photo.thumbnail);
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* 照片展示区域 - 整体宽度自适应 */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 sm:gap-8">
            {photos.map((photo) => renderPhotoCard(photo))}
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
                navigate('/photos', { replace: true });
              }}
              className={`absolute top-6 right-6 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-lg ${
                showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
          
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
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={() => {
                      console.log('原图加载成功:', selectedPhoto.original);
                    }}
                  />
                ) : null}
                {!selectedPhoto.original && (
                  <PhotoPlaceholder 
                    className={`w-auto max-w-[80vw] transition-all duration-500 ${
                      showUI ? 'h-[80vh] -translate-y-16' : 'h-[90vh] translate-y-0'
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
                  <span>{selectedPhoto.film_roll_name || selectedPhoto.film || '无'}</span>
                  <span>•</span>
                  <span>{selectedPhoto.taken_date || selectedPhoto.date || '未知日期'}</span>
                </div>
                
                {/* 分享按钮居中 */}
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/photos?photo=${selectedPhoto.id}`;
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

export default Photos;
