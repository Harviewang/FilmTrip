import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_CONFIG from '../../config/api.js';
import AdaptiveLayout, { AdaptiveGrid, AdaptiveCard } from '../../components/AdaptiveLayout';
import PhotoPreview from '../../components/PhotoPreview';
import LazyImage from '../../components/LazyImage';

const Photos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20; // 每页加载20张照片
  
  // 视图模式状态 - 画廊模式已禁用
  const [viewMode, setViewMode] = useState('waterfall'); // 只支持 'waterfall'

  // 先定义fetchPhotos函数
  const fetchPhotos = async (page = 1, append = false, isRefresh = false) => {
    try {
      if (!append && !isRefresh) {
        setLoading(true);
        setError(null);
        setPhotos([]);
        setCurrentPage(1);
        setHasMore(true);
      } else if (isRefresh) {
        // 刷新时不清空现有照片，避免闪烁
        setError(null);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      
      // 添加分页参数
      const url = `/api/photos?page=${page}&limit=${pageSize}`;
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        console.log('获取到的照片数据:', result);
        
        // 处理后端API的标准响应格式
        let photoArray = [];
        if (result.success && result.data && Array.isArray(result.data)) {
          // 标准格式：{ success: true, data: [...] }
          photoArray = result.data;
        } else if (Array.isArray(result)) {
          // 直接是数组
          photoArray = result;
        } else if (result && result.data && Array.isArray(result.data)) {
          // 包装在data字段中的数组
          photoArray = result.data;
        } else if (result && result.photos && Array.isArray(result.photos)) {
          // 包装在photos字段中的数组
          photoArray = result.photos;
        } else if (result && typeof result === 'object') {
          // 如果是对象，尝试提取数组
          const keys = Object.keys(result);
          if (keys.length > 0) {
            const firstKey = keys[0];
            if (Array.isArray(result[firstKey])) {
              photoArray = result[firstKey];
            }
          }
        }
        
        console.log('处理后的照片数组:', photoArray);
        
        // 如果没有真实数据，使用模拟数据进行测试
        if (photoArray.length === 0 && process.env.NODE_ENV === 'development') {
          console.log(`使用模拟数据进行测试 - 第${page}页`);
          // 生成模拟数据，模拟分页效果
          const startId = (page - 1) * pageSize + 1;
          const mockData = [];
          const maxPhotos = 100; // 模拟总共100张照片
          for (let i = 0; i < pageSize; i++) {
            const id = startId + i;
            // 模拟总共100张照片，超过100张就没有更多数据
            if (id > maxPhotos) break;
            // 随机生成横向或竖向图片
            const isLandscape = Math.random() > 0.5;
            mockData.push({
              id: `photo-${id}`, // 使用稳定的ID
              title: `测试照片${id}`,
              filename: `test${id}.jpg`,
              thumbnail: `/uploads/thumbnails/test${id}_thumb.jpg`,
              original: `/uploads/test${id}.jpg`,
              camera_name: `测试相机${Math.ceil(id / 5)}`,
              film_roll_name: `测试胶卷${Math.ceil(id / 3)}`,
              taken_date: '2025-01-21',
              rating: Math.floor(Math.random() * 5) + 1,
              width: isLandscape ? 1920 : 1080,
              height: isLandscape ? 1080 : 1920
            });
          }
          photoArray = mockData;
          console.log(`生成模拟数据: ${mockData.length} 张照片，起始ID: ${startId}, 最大ID: ${maxPhotos}`);
        }
        
        // 数据映射：将后端字段映射到前端期望的字段
        const mappedPhotos = photoArray.map((photo, index) => ({
          id: photo.id || `photo-${page}-${index}`, // 使用稳定的ID，避免刷新时位置错乱
          title: photo.title || photo.filename || '无标题',
          description: photo.description || '',
          thumbnail: photo.thumbnail || photo.original,
          original: photo.original,
          camera: photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机',
          film: photo.film_roll_name || photo.film_roll_number || '无',
          date: photo.taken_date || photo.uploaded_at || '未知日期',
          rating: photo.rating || 0,
          // 保留原始数据用于调试
          _raw: photo
        }));
        
        console.log('映射后的照片数据:', mappedPhotos);
        
        // 设置照片数据
        if (append) {
          setPhotos(prevPhotos => [...prevPhotos, ...mappedPhotos]);
          setCurrentPage(page);
          setLoadingMore(false);
        } else if (isRefresh) {
          // 刷新时直接替换所有照片
          setPhotos(mappedPhotos);
          setCurrentPage(page);
          setLoading(false);
        } else {
          setPhotos(mappedPhotos);
          setCurrentPage(page);
          setLoading(false);
        }
        
        // 检查是否还有更多数据
        // 如果返回的数据少于请求的页面大小，说明没有更多数据了
        const hasMoreData = mappedPhotos.length === pageSize && mappedPhotos.length > 0;
        
        // 在开发环境下，如果使用模拟数据，需要特殊处理
        if (process.env.NODE_ENV === 'development' && photoArray.length > 0) {
          const maxPhotos = 100; // 模拟总共100张照片
          const totalLoadedPhotos = append ? photos.length + mappedPhotos.length : mappedPhotos.length;
          setHasMore(totalLoadedPhotos < maxPhotos && mappedPhotos.length === pageSize);
        } else {
          setHasMore(hasMoreData);
        }
        
        if (mappedPhotos.length === 0 && !append) {
          setError('没有找到照片数据');
        }
      } else {
        console.error('获取照片失败:', response.status);
        setError(`获取照片失败: ${response.status}`);
      }
    } catch (error) {
      console.error('获取照片出错:', error);
      setError(`网络错误: ${error.message}`);
      
      // 开发环境下使用模拟数据
      if (process.env.NODE_ENV === 'development') {
        console.log('网络错误，使用模拟数据进行测试');
        const mockPhotos = [
          {
            id: 1,
            title: '模拟照片1',
            filename: 'mock1.jpg',
            thumbnail: '/uploads/thumbnails/mock1_thumb.jpg',
            original: '/uploads/mock1.jpg',
            camera_name: '模拟相机',
            film_roll_name: '模拟胶卷',
            taken_date: '2025-01-21',
            rating: 5
          },
          {
            id: 2,
            title: '模拟照片2',
            filename: 'mock2.jpg',
            thumbnail: '/uploads/thumbnails/mock2_thumb.jpg',
            original: '/uploads/mock2.jpg',
            camera_name: '模拟相机',
            film_roll_name: '模拟胶卷',
            taken_date: '2025-01-21',
            rating: 4
          }
        ];
        
        const mappedMockPhotos = mockPhotos.map(photo => ({
          id: photo.id,
          title: photo.title || photo.filename || '无标题',
          description: photo.description || '',
          thumbnail: photo.thumbnail || photo.original,
          original: photo.original,
          camera: photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机',
          film: photo.film_roll_name || photo.film_roll_number || '无',
          date: photo.taken_date || photo.uploaded_at || '未知日期',
          rating: photo.rating || 0,
          _raw: photo
        }));
        
        if (append) {
          setPhotos(prevPhotos => [...prevPhotos, ...mappedMockPhotos]);
          setCurrentPage(page);
        } else {
          setPhotos(mappedMockPhotos);
          setCurrentPage(page);
        }
        
        // 模拟数据情况下设置hasMore状态
        const maxPhotos = 100;
        const totalLoadedPhotos = append ? photos.length + mappedMockPhotos.length : mappedMockPhotos.length;
        setHasMore(totalLoadedPhotos < maxPhotos && mappedMockPhotos.length === pageSize);
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // 加载更多照片
  const loadMorePhotos = async () => {
    if (!hasMore || loadingMore) {
      console.log('跳过加载更多:', { hasMore, loadingMore });
      return;
    }
    console.log('开始加载更多照片:', { currentPage, nextPage: currentPage + 1 });
    setLoadingMore(true);
    try {
      await fetchPhotos(currentPage + 1, true);
    } finally {
      setLoadingMore(false);
    }
  };

  // 移除刷新处理函数

  useEffect(() => {
    fetchPhotos();
  }, []);
  
  // 移除自动滚动懒加载，改为仅通过拖拽交互触发



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

  // 照片切换处理
  const handlePhotoChange = (newPhoto, newIndex) => {
    setSelectedPhoto(newPhoto);
    navigate(`/gallery?photo=${newPhoto.id}`, { replace: true });
  };

  // 关闭预览
  const closeModal = () => {
    setShowModal(false);
    setSelectedPhoto(null);
    navigate('/gallery', { replace: true });
  };



  // 处理图片点击，区分点击和拖拽
  const [dragState, setDragState] = useState({});
  
  const handlePhotoMouseDown = (photo, e) => {
    const photoId = photo.id;
    setDragState(prev => ({
      ...prev,
      [photoId]: {
        startX: e.clientX,
        startY: e.clientY,
        startTime: Date.now(),
        isDragging: false
      }
    }));
  };
  
  const handlePhotoMouseMove = (photo, e) => {
    const photoId = photo.id;
    const state = dragState[photoId];
    if (!state) return;
    
    const deltaX = Math.abs(e.clientX - state.startX);
    const deltaY = Math.abs(e.clientY - state.startY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 如果移动距离超过5px，标记为拖拽
    if (distance > 5) {
      setDragState(prev => ({
        ...prev,
        [photoId]: { ...state, isDragging: true }
      }));
    }
  };
  
  const handlePhotoClick = (photo, e) => {
    const photoId = photo.id;
    const state = dragState[photoId];
    
    // 如果是拖拽操作，不触发点击
    if (state && state.isDragging) {
      setDragState(prev => {
        const newState = { ...prev };
        delete newState[photoId];
        return newState;
      });
      return;
    }
    
    // 清理状态
    setDragState(prev => {
      const newState = { ...prev };
      delete newState[photoId];
      return newState;
    });
    
    setSelectedPhoto(photo);
    setShowModal(true);
    navigate(`/gallery?photo=${photo.id}`, { replace: true });
  };



  const renderPhotoCard = (photo) => {
    return (
      <AdaptiveCard 
        key={photo.id} 
        className={`cursor-pointer h-full group photo-card ${
          viewMode === 'gallery' ? 'gallery-photo-container' : ''
        }`}
        hover={viewMode !== 'gallery'}
        shadow={viewMode === 'gallery' ? 'none' : 'default'}
      >
        <div className={viewMode === 'gallery' ? 'rounded-lg' : 'aspect-[4/3] overflow-hidden rounded-lg'}>
          <LazyImage
            src={photo.thumbnail ? `${API_CONFIG.BASE_URL}${photo.thumbnail}` : null}
            alt={photo.title || '照片'}
            className={`transition-transform duration-300 group-hover:scale-110 ${
              viewMode === 'gallery' ? 'gallery-photo' : 'w-full h-full object-cover'
            }`}
            onClick={(e) => handlePhotoClick(photo, e)}
            onMouseDown={(e) => handlePhotoMouseDown(photo, e)}
            onMouseMove={(e) => handlePhotoMouseMove(photo, e)}
            autoOrientation={true}
            lazyOptions={{
              rootMargin: '200px', // 增加预加载距离，提升滚动体验
              threshold: 0.05 // 降低阈值，更早触发加载
            }}
          />
        </div>
      </AdaptiveCard>
    );
  };

  if (loading) {
    return (
      <AdaptiveLayout background="white">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">正在加载照片...</p>
          </div>
        </div>
      </AdaptiveLayout>
    );
  }

  if (error) {
    return (
      <AdaptiveLayout background="white">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchPhotos}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </AdaptiveLayout>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full h-full flex flex-col">
        {/* 顶部工具栏 */}
        <div className="w-full flex-shrink-0 py-1 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {/* 左侧：视图模式切换 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('waterfall')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                    viewMode === 'waterfall'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="瀑布模式"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  disabled
                  className="px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1 text-gray-400 cursor-not-allowed bg-gray-50"
                  title="画廊模式（暂时禁用）"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 照片网格区域 - 与header footer对齐 */}
        <div className="w-full flex-1 py-2">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {photos.length === 0 && !loading ? (
              <div className="w-full h-64 flex flex-col items-center justify-center text-center">
                <div className="text-gray-400 text-6xl mb-4">📸</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">暂无照片</h3>
                <p className="text-gray-600">请稍后再来查看</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'gallery' 
                  ? 'gallery-mode grid gap-4 grid-cols-1 justify-items-center'
                  : 'grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }>
                  {photos.map((photo) => renderPhotoCard(photo))}
                </div>
                
                {/* 加载更多文字区域 */}
                <div className="flex justify-center items-center py-1">
                  {hasMore ? (
                    <span
                      onClick={loadMorePhotos}
                      className={`text-blue-600 hover:text-blue-700 cursor-pointer transition-colors ${
                        loadingMore ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loadingMore ? '加载中...' : '加载更多'}
                    </span>
                  ) : (
                    <span className="text-gray-400">已加载全部照片</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 使用全局PhotoPreview组件 */}
      <PhotoPreview
        photo={selectedPhoto}
        photos={photos}
        isOpen={showModal}
        onClose={closeModal}
        currentPath="/gallery"
        showNavigation={true}
        onPhotoChange={handlePhotoChange}
        compact={true} // 启用紧凑模式，减少底部信息高度
      />
    </div>
  );
};

// 添加样式处理画廊模式
const styles = `
  .gallery-mode {
    justify-items: center;
    max-width: 1200px; /* 与header对齐的最大宽度 */
    margin: 0 auto;
  }
  
  .gallery-mode .photo-card {
    height: auto !important;
    width: auto;
    display: inline-block;
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
  }
  
  .gallery-mode .photo-card > div {
    aspect-ratio: unset !important;
    height: auto !important;
    width: auto;
    overflow: visible !important;
  }
  
  .gallery-mode .gallery-photo {
    width: auto !important;
    height: auto !important;
    max-width: 100vw;
    max-height: 80vh;
    object-fit: contain !important;
    display: block;
  }
  
  .gallery-mode .gallery-photo-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent !important;
  }
`;

// 将样式注入到页面
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  if (!document.head.querySelector('style[data-gallery-styles]')) {
    styleSheet.setAttribute('data-gallery-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default Photos;
