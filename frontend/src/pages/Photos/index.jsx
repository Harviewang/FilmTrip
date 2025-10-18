import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_CONFIG from '../../config/api.js';
import AdaptiveLayout, { AdaptiveGrid, AdaptiveCard } from '../../components/AdaptiveLayout';
// 使用原生 CSS Grid Masonry
import PhotoPreview from '../../components/PhotoPreview';
import LazyImage from '../../components/LazyImage';
 
// import useStablePullToRefresh from '../../hooks/useStablePullToRefresh';
// import PullToRefreshIndicator from '../../components/PullToRefreshIndicator';

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
  
  // 视图模式状态
  const WATERFALL_ENABLED = true; // 启用瀑布流
  const [viewMode, setViewMode] = useState('list');
  const [galleryCurrentIndex, setGalleryCurrentIndex] = useState(0);
  
  // 使用稳定的时间戳，避免每次渲染都刷新图片
  const stableTimestamp = useRef(Date.now()).current;
  const ROW_HEIGHT = 1; // px for masonry grid-auto-rows (1px for fine control)
  const GAP_PX = 24; // gap-6 in Tailwind
  const [masonrySpans, setMasonrySpans] = useState({});

  // 下拉刷新功能
  // 暂时注释掉下拉刷新功能，定义默认值
  const pullDistance = 0;
  const isPullRefreshing = false;
  const isPulling = false;
  const containerRef = useRef(null);
  const handleTouchStart = () => {};
  const handleTouchMove = () => {};
  const handleTouchEnd = () => {};
  const triggerRefresh = () => {};

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
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
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
        
        // 不再在开发环境注入模拟数据；数据为空时直接呈现空态
        
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
        
        setHasMore(hasMoreData);
        
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
      
      // 不再注入任何模拟数据；网络错误时保持空列表并显示错误信息
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

  // 滚动懒加载
  useEffect(() => {
    const handleScroll = () => {
      // 检查是否接近页面底部
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 当滚动到距离底部200px时触发加载更多
      if (scrollTop + windowHeight >= documentHeight - 200) {
        if (hasMore && !loadingMore && !isPullRefreshing) {
          loadMorePhotos();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, isPullRefreshing]);

  useEffect(() => {
    fetchPhotos();
  }, []);



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

  // 清理过期的拖拽状态
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setDragState(prev => {
        const newState = { ...prev };
        let hasChanges = false;
        
        Object.keys(newState).forEach(photoId => {
          const state = newState[photoId];
          // 清理超过5秒的拖拽状态
          if (state && now - state.startTime > 5000) {
            delete newState[photoId];
            hasChanges = true;
          }
        });
        
        return hasChanges ? newState : prev;
      });
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);



  const renderPhotoCard = (photo) => {
    const isAdmin = (() => {
      try {
        const u = JSON.parse(localStorage.getItem('user'));
        return u && u.username === 'admin';
      } catch (e) { return false; }
    })();
    const effectivePrivate = !!(photo && photo._raw && photo._raw.effective_private);
    const isPrivateForViewer = effectivePrivate && !isAdmin;
    return (
      <AdaptiveCard 
        key={photo.id} 
        className={`h-full group photo-card ${isPrivateForViewer ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        hover={true}
        shadow={'default'}
      >
        <div className={'aspect-[4/3] overflow-hidden rounded-lg relative'}>
          {isPrivateForViewer ? (
            <div
              className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 relative`}
              title="已加密：未登录用户不可查看详情"
            >
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-xs">该照片涉及隐私或他人肖像，已被管理员加密</div>
              </div>
            </div>
          ) : (
            <LazyImage
              src={(photo.size1024 || photo.thumbnail) ? `${API_CONFIG.BASE_URL}${photo.size1024 || photo.thumbnail}?v=${stableTimestamp}` : null}
              alt={photo.title || '照片'}
              className={`transition-transform duration-300 group-hover:scale-110 w-full h-full object-cover`}
              onClick={(e) => handlePhotoClick(photo, e)}
              onMouseDown={(e) => handlePhotoMouseDown(photo, e)}
              onMouseMove={(e) => handlePhotoMouseMove(photo, e)}
              autoOrientation={true}
              lazyOptions={{
                rootMargin: '200px',
                threshold: 0.05
              }}
            />
          )}
          {/* 管理员视图：加密则常显锁图标（无文案） */}
          {!isPrivateForViewer && effectivePrivate && (
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded" title="加密">
              🔒
            </div>
          )}
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
    <div 
      ref={containerRef}
      className="w-full h-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50"
      // 暂时注释掉触摸事件
      // onTouchStart={handleTouchStart}
      // onTouchMove={handleTouchMove}
      // onTouchEnd={handleTouchEnd}
    >
      {/* 暂时注释掉下拉刷新指示器 */}
      {/* <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isPullRefreshing}
        isPulling={isPulling}
        threshold={80}
      /> */}

      <div className="w-full h-full flex flex-col">
        <div className="w-full flex-shrink-0 py-1 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title="平铺"
                >
                  {/* 平铺图标：四宫格 */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="6" height="6" rx="1" strokeWidth="2"></rect>
                    <rect x="14" y="4" width="6" height="6" rx="1" strokeWidth="2"></rect>
                    <rect x="4" y="14" width="6" height="6" rx="1" strokeWidth="2"></rect>
                    <rect x="14" y="14" width="6" height="6" rx="1" strokeWidth="2"></rect>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('waterfall')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                    viewMode === 'waterfall' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="瀑布流"
                >
                  {/* 瀑布流图标：三列高低错落 */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="5" height="8" rx="1"></rect>
                    <rect x="10" y="4" width="5" height="14" rx="1"></rect>
                    <rect x="17" y="4" width="4" height="10" rx="1"></rect>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

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
                {(viewMode === 'list' || !WATERFALL_ENABLED) ? (
                  // 固定网格：一行4个，统一宽高
                  <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {photos.map((photo) => renderPhotoCard(photo))}
                  </div>
                ) : (
                  // 瀑布流（Masonry）：同一宽度等比缩放高度，按累积高度补位
                  (() => {
                    // 计算瀑布流布局
                    const columnCount = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
                    const gap = window.innerWidth >= 640 ? 32 : 24; // sm:gap-8 (32px) 或 gap-6 (24px)
                    
                    // 计算容器的实际宽度，模拟 Tailwind container 类的行为
                    let containerMaxWidth = window.innerWidth;
                    if (window.innerWidth >= 1536) containerMaxWidth = 1536; // 2xl
                    else if (window.innerWidth >= 1280) containerMaxWidth = 1280; // xl
                    else if (window.innerWidth >= 1024) containerMaxWidth = 1024; // lg
                    else if (window.innerWidth >= 768) containerMaxWidth = 768; // md
                    else if (window.innerWidth >= 640) containerMaxWidth = 640; // sm
                    
                    // 计算容器的实际可用宽度，考虑padding
                    let containerPadding = 32; // 默认px-4 (16px * 2)
                    if (window.innerWidth >= 640) containerPadding = 48; // sm:px-6 (24px * 2)
                    if (window.innerWidth >= 1024) containerPadding = 64; // lg:px-8 (32px * 2)
                    
                    const containerWidth = Math.min(containerMaxWidth, window.innerWidth) - containerPadding;
                    const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;
                    
                    // 计算每张图片的位置
                    const columnHeights = Array(columnCount).fill(0);
                    const photoPositions = photos.map((photo, index) => {
                      // 暂时使用默认宽高比，后续通过图片加载后动态调整
                      let aspectRatio = 1; // 默认正方形
                      
                      // 可以根据照片编号或其他信息设置不同的默认宽高比
                      const photoNum = photo.photo_number || index + 1;
                      if (photoNum % 3 === 0) {
                        aspectRatio = 0.75; // 竖图
                      } else if (photoNum % 2 === 0) {
                        aspectRatio = 1.33; // 横图
                      } else {
                        aspectRatio = 1; // 正方形
                      }
                      
                      const imageHeight = columnWidth / aspectRatio;
                      
                      // 找到最短的列
                      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
                      const left = shortestColumn * (columnWidth + gap);
                      const top = columnHeights[shortestColumn];
                      
                      // 更新该列的高度
                      columnHeights[shortestColumn] += imageHeight + gap;
                      
                      return {
                        photo,
                        left,
                        top,
                        width: columnWidth,
                        height: imageHeight
                      };
                    });
                    
                    const maxHeight = columnHeights.length > 0 ? Math.max(...columnHeights) : 0;
                    
                    return (
                      <div className="relative" style={{ height: `${maxHeight}px` }}>
                        {photoPositions.map(({ photo, left, top, width, height }) => {
                          const isAdmin = (() => {
                            try { const u = JSON.parse(localStorage.getItem('user')); return u && u.username === 'admin'; }
                            catch (e) { return false; }
                          })();
                          const effectivePrivate = !!(photo && photo._raw && photo._raw.effective_private);
                          const isPrivateForViewer = effectivePrivate && !isAdmin;
                          
                          return (
                            <div 
                              key={photo.id} 
                              className="absolute"
                              style={{
                                left: `${left}px`,
                                top: `${top}px`,
                                width: `${width}px`,
                                height: `${height}px`
                              }}
                            >
                              <div className={`masonry-content relative w-full h-full overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-lg transition-shadow ${isPrivateForViewer ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={(e)=>{ if (isPrivateForViewer) return; handlePhotoClick(photo, e); }}>
                                {isPrivateForViewer ? (
                                  <div className="w-full h-full bg-gray-100 text-gray-500 flex items-center justify-center text-center px-3">
                                    <div>
                                      <div className="text-3xl mb-2">🔒</div>
                                      <div className="text-xs">该照片涉及隐私或他人肖像，已被管理员加密</div>
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={(photo.size1024 || photo.thumbnail) ? `${API_CONFIG.BASE_URL}${photo.size1024 || photo.thumbnail}?v=${stableTimestamp}` : ''}
                                    alt={photo.title || '照片'}
                                    className="w-full h-full object-cover select-none hover:opacity-95 transition-opacity"
                                    loading="lazy"
                                    onMouseDown={(e) => handlePhotoMouseDown(photo, e)}
                                    onMouseMove={(e) => handlePhotoMouseMove(photo, e)}
                                    draggable={false}
                                  />
                                )}
                                {!isPrivateForViewer && effectivePrivate && (
                                  <div className="pointer-events-none absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded" title="加密">🔒</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}

                <div className="flex justify-center items-center py-1">
                  {hasMore ? (
                    <span
                      onClick={loadMorePhotos}
                      className={`text-blue-600 hover:text-blue-700 cursor-pointer transition-colors ${loadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        <PhotoPreview
          photo={selectedPhoto}
          photos={photos}
          isOpen={showModal}
          onClose={closeModal}
          currentPath="/gallery"
          showNavigation={true}
          onPhotoChange={handlePhotoChange}
          compact={true}
        />
      </div>
    </div>
  );
};

export default Photos;
