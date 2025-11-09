import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_CONFIG from '../../config/api.js';
import AdaptiveLayout, { AdaptiveCard } from '../../components/AdaptiveLayout';
// 使用原生 CSS Grid Masonry
import PhotoPreview from '../../components/PhotoPreview';
import LazyImage from '../../components/LazyImage';
import RandomFilmStrip from './RandomFilmStrip';
import { useScrollContainer } from '../../contexts/ScrollContainerContext';
 
// import useStablePullToRefresh from '../../hooks/useStablePullToRefresh';
// import PullToRefreshIndicator from '../../components/PullToRefreshIndicator';

const normalizeProtectionFlag = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return Boolean(value);
};

const Gallery = () => {
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
  
  // 懒加载修复：获取滚动容器引用
  const { scrollContainerRef: scrollContainerRefFromContext } = useScrollContainer() || {};
  const [galleryCurrentIndex, setGalleryCurrentIndex] = useState(0);
  
  // 随机照片状态
  const [randomPhotos, setRandomPhotos] = useState([]);
  const [randomFilmRoll, setRandomFilmRoll] = useState(null);
  const [currentRandomIndex, setCurrentRandomIndex] = useState(0);
  const [randomError, setRandomError] = useState(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  
  // 筛选状态
  const [hideEncryptedPhotos, setHideEncryptedPhotos] = useState(() => {
    const stored = localStorage.getItem('hideEncryptedPhotos');
    return stored ? JSON.parse(stored) : false; // 默认显示加密图片
  });
  const [filmTypeFilter, setFilmTypeFilter] = useState('all');
  const [filmFormatFilter, setFilmFormatFilter] = useState('all');
  
  // 持久化 hideEncryptedPhotos 状态
  useEffect(() => {
    localStorage.setItem('hideEncryptedPhotos', JSON.stringify(hideEncryptedPhotos));
  }, [hideEncryptedPhotos]);
  
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
  const triggerRefresh = () => {};
  
  // 懒加载修复：使用 state 确保在 ref 准备好后触发重渲染
  const [scrollRoot, setScrollRoot] = useState(null);
  
  useEffect(() => {
    // 使用 requestAnimationFrame 确保 DOM 已完全渲染
    const rafId = requestAnimationFrame(() => {
      if (scrollContainerRefFromContext?.current) {
        setScrollRoot(scrollContainerRefFromContext.current);
      }
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [scrollContainerRefFromContext]);

  // 加载更多照片函数
  const loadMorePhotos = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      await fetchPhotos(currentPage + 1, true);
    } catch (error) {
      console.error('加载更多照片失败:', error);
      setError('加载更多照片失败');
    }
  };

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
      
      // 确保page是数字类型
      const pageNum = typeof page === 'object' ? 1 : (typeof page === 'number' ? page : parseInt(page)) || 1;
      
      // 构建筛选参数
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString()
      });
      
      if (filmTypeFilter !== 'all') {
        params.append('film_type', filmTypeFilter);
      }
      if (filmFormatFilter !== 'all') {
        params.append('film_format', filmFormatFilter);
      }
      
      const url = `/api/photos?${params.toString()}`;
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      if (response.ok) {
        const result = await response.json();
        
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
        
        // 不再在开发环境注入模拟数据；数据为空时直接呈现空态
        
        // 数据映射：将后端字段映射到前端期望的字段
        const mappedPhotos = photoArray.map((photo, index) => {
          const effectiveProtection = normalizeProtectionFlag(
            photo.effective_protection !== undefined
              ? photo.effective_protection
              : photo.is_protected
          );

          return {
            id: photo.id || `photo-${page}-${index}`, // 使用稳定的ID，避免刷新时位置错乱
            title: photo.title || photo.filename || '无标题',
            description: photo.description || '',
            thumbnail: photo.thumbnail || photo.original,
            original: photo.original,
            size1024: photo.size1024,
            size2048: photo.size2048,
            camera: photo.camera || (photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机'),
            film: photo.film || '无',
            date: photo.date || (photo.taken_date ? photo.taken_date.split(' ')[0] : (photo.uploaded_at ? photo.uploaded_at.split(' ')[0] : '未知日期')), // 优先使用后端映射的date字段
            rating: photo.rating || 0,
            location_name: photo.location_name,
            photo_serial_number: photo.photo_serial_number,
            country: photo.country,
            province: photo.province,
            city: photo.city,
            district: photo.district,
            township: photo.township,
            latitude: photo.latitude,
            longitude: photo.longitude,
            categories: photo.categories,
            trip_name: photo.trip_name,
            trip_start_date: photo.trip_start_date,
            trip_end_date: photo.trip_end_date,
            aperture: photo.aperture,
            shutter_speed: photo.shutter_speed,
            focal_length: photo.focal_length,
            iso: photo.iso,
            camera_model: photo.camera_model,
            lens_model: photo.lens_model,
            // 图片尺寸和方向(用于瀑布流布局计算)
            width: photo.width,
            height: photo.height,
            orientation: photo.orientation,
            // 提升 effective_protection 到顶层，避免依赖 _raw 嵌套
            effective_protection: effectiveProtection,
            protection_level: photo.protection_level,
            raw_effective_protection: photo.effective_protection,
            raw_is_protected: photo.is_protected,
            // 保留原始数据用于调试
            _raw: photo
          };
        });
        
        // 过滤加密照片（如果开关开启）
        const filteredPhotos = hideEncryptedPhotos 
          ? mappedPhotos.filter(photo => !photo.effective_protection)
          : mappedPhotos;
        
        // 设置照片数据
        if (append) {
          setPhotos(prevPhotos => [...prevPhotos, ...filteredPhotos]);
          setCurrentPage(page);
          setLoadingMore(false);
        } else if (isRefresh) {
          // 刷新时直接替换所有照片
          setPhotos(filteredPhotos);
          setCurrentPage(page);
          setLoading(false);
        } else {
          setPhotos(filteredPhotos);
      setCurrentPage(page);
      setLoading(false);
        }
        
        // 检查是否还有更多数据
        // 使用后端返回的原始数据长度判断，避免前端过滤影响分页判断
        const hasMoreData = photoArray.length === pageSize && photoArray.length > 0;
        
        setHasMore(hasMoreData);
        
        // 移除错误设置，空状态在列表中正常显示
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


  const mapRandomPhoto = (photoData, index) => {
    const effectiveProtection = normalizeProtectionFlag(
      photoData.effective_protection !== undefined
        ? photoData.effective_protection
        : photoData.is_protected
    );

    return {
      id: photoData.id || `random-photo-${index}`,
      title: photoData.title || photoData.filename || '随机照片',
      description: photoData.description || '',
      thumbnail: photoData.thumbnail || photoData.original,
      original: photoData.original,
      size1024: photoData.size1024,
      size2048: photoData.size2048,
      filename: photoData.filename,
      camera: photoData.camera_name || photoData.camera_model || photoData.camera_brand || '未知相机',
      film: photoData.film_roll_name || photoData.film_roll_number || '无',
      date: photoData.taken_date
        ? photoData.taken_date.split(' ')[0]
        : photoData.uploaded_at
          ? photoData.uploaded_at.split(' ')[0]
          : '未知日期',
      rating: photoData.rating || 0,
      location_name: photoData.location_name,
      photo_serial_number: photoData.photo_serial_number,
      country: photoData.country,
      province: photoData.province,
      city: photoData.city,
      categories: photoData.categories,
      trip_name: photoData.trip_name,
      trip_start_date: photoData.trip_start_date,
      trip_end_date: photoData.trip_end_date,
      aperture: photoData.aperture,
      shutter_speed: photoData.shutter_speed,
      focal_length: photoData.focal_length,
      iso: photoData.iso,
      camera_model: photoData.camera_model,
      lens_model: photoData.lens_model,
      is_protected: effectiveProtection,
      protection_level: photoData.protection_level,
      effective_protection: effectiveProtection,
      raw_effective_protection: photoData.effective_protection,
      raw_is_protected: photoData.is_protected,
      width: photoData.width,
      height: photoData.height,
      orientation: photoData.orientation,
      _raw: photoData
    };
  };

  const fetchRandomPhoto = async () => {
    if (isRandomizing) return;

    try {
      setIsRandomizing(true);
      setRandomError(null);
      setViewMode('random');
      setRandomFilmRoll(null);
      setRandomPhotos([]);
      
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

      let randomFilmRoll = null;
      const MAX_RANDOM_ATTEMPTS = 5;

      for (let attempt = 0; attempt < MAX_RANDOM_ATTEMPTS; attempt++) {
        const filmRollResponse = await fetch('/api/filmRolls/random', {
          headers: authHeader
        });

        if (!filmRollResponse.ok) {
          throw new Error(`获取随机胶卷失败（${filmRollResponse.status}）`);
        }

        const filmRollResult = await filmRollResponse.json();
        if (filmRollResult.success && filmRollResult.data) {
          const candidate = filmRollResult.data;
          const matchesType =
            filmTypeFilter === 'all' ||
            !candidate.film_roll_type ||
            candidate.film_roll_type === filmTypeFilter;
          const matchesFormat =
            filmFormatFilter === 'all' ||
            !candidate.film_roll_format ||
            candidate.film_roll_format === filmFormatFilter;

          if (matchesType && matchesFormat) {
            randomFilmRoll = candidate;
            break;
          }
        }
      }

      if (!randomFilmRoll) {
        setRandomError('当前筛选条件下暂无可用胶卷，请调整筛选后再试。');
        return;
      }

      // 构建筛选参数，与其他模式保持一致
      const params = new URLSearchParams({
        film_roll_id: randomFilmRoll.id,
        limit: 8,
        sort: 'random',
        exclude_encrypted: hideEncryptedPhotos ? '1' : '0'
      });

      const photosResponse = await fetch(
        `/api/photos?${params.toString()}`,
        {
          headers: authHeader
        }
      );

      if (!photosResponse.ok) {
        throw new Error(`获取胶卷照片失败（${photosResponse.status}）`);
      }

      const photosResult = await photosResponse.json();
      const rawList = photosResult?.data && Array.isArray(photosResult.data)
        ? photosResult.data
        : Array.isArray(photosResult)
          ? photosResult
          : [];

      const mappedPhotos = rawList.map(mapRandomPhoto);
      const limitedPhotos = mappedPhotos.slice(0, 6);
      
      // 即使没有照片也设置状态，让空状态在列表页显示而不是显示错误
      setRandomFilmRoll(randomFilmRoll);
      setRandomPhotos(limitedPhotos);
      setCurrentRandomIndex(0);
      setRandomError(null); // 清除错误
    } catch (error) {
      console.error('随机照片获取失败:', error);
      setRandomError(error.message || '随机浏览失败，请稍后再试');
    } finally {
      setIsRandomizing(false);
    }
  };

  const openRandomPhoto = (photo, index) => {
    if (!photo) return;
    setSelectedPhoto(photo);
    setShowModal(true);
    setCurrentRandomIndex(index);
    navigate(`/gallery?photo=${photo.id}`, { replace: true });
  };

  // 滚动懒加载
  useEffect(() => {
    const target = scrollRoot || window;

    const handleScroll = () => {
      let scrollTop;
      let viewportHeight;
      let scrollHeight;

      if (scrollRoot) {
        scrollTop = scrollRoot.scrollTop;
        viewportHeight = scrollRoot.clientHeight;
        scrollHeight = scrollRoot.scrollHeight;
      } else {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        viewportHeight = window.innerHeight;
        scrollHeight = document.documentElement.scrollHeight;
      }

      if (scrollTop + viewportHeight >= scrollHeight - 200) {
        if (hasMore && !loadingMore && !isPullRefreshing) {
          loadMorePhotos();
        }
      }
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollRoot, hasMore, loadingMore, isPullRefreshing]);

  useEffect(() => {
    fetchPhotos();
  }, []);

  // 筛选状态变化时重新加载数据
  useEffect(() => {
    if (photos.length > 0 && viewMode !== 'random') { // 只有在已有数据且非随机模式时才重新加载
      fetchPhotos(1, false, true); // 刷新模式
    }
  }, [hideEncryptedPhotos, filmTypeFilter, filmFormatFilter]);



  // 检查URL中是否有照片ID参数
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const photoId = urlParams.get('photo');
    if (!photoId) return;

    const source = viewMode === 'random' ? randomPhotos : photos;
    if (source.length === 0) return;

    const targetIndex = source.findIndex((p) => p.id?.toString() === photoId);
    if (targetIndex !== -1) {
      const targetPhoto = source[targetIndex];
      setSelectedPhoto(targetPhoto);
      setShowModal(true);
      if (viewMode === 'random') {
        setCurrentRandomIndex(targetIndex);
      }
    }
  }, [location.search, photos, randomPhotos, viewMode]);

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
    if (viewMode === 'random') {
      setCurrentRandomIndex(newIndex);
    }
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

  const renderPhotoCard = (photo, isRandomMode = false, isMasonry = false) => {
    const isAdmin = (() => {
      try { const u = JSON.parse(localStorage.getItem('user')); return u && u.username === 'admin'; } catch (e) { return false; }
    })();
    
    // 随机模式下的照片已经由后端过滤，不需要再次检查保护状态
    if (isRandomMode) {
      const randomContent = (
        <div className={'relative w-full overflow-hidden rounded-lg'} style={{ paddingTop: '75%' /* 4:3 aspect ratio */ }}>
          <div className="absolute inset-0">
            <LazyImage
              src={(photo.size1024 || photo.thumbnail) ? `${API_CONFIG.BASE_URL}${photo.size1024 || photo.thumbnail}?v=${stableTimestamp}` : null}
              alt={photo.title || '照片'}
              className={`transition-transform duration-300 group-hover:scale-110 w-full h-full object-cover`}
              onClick={(e) => handlePhotoClick(photo, e)}
              onMouseDown={(e) => handlePhotoMouseDown(photo, e)}
              onMouseMove={(e) => handlePhotoMouseMove(photo, e)}
              autoOrientation={true}
              lazyOptions={{
                root: scrollRoot,
                rootMargin: '0px 0px 400px 0px',
                threshold: 0.05
              }}
            />
          </div>
        </div>
      );
      
      if (isMasonry) {
        return randomContent;
      }
      
      return (
        <AdaptiveCard 
          key={photo.id} 
          className="h-full group photo-card cursor-pointer"
          hover={true}
          shadow={'default'}
        >
          {randomContent}
        </AdaptiveCard>
      );
    }
    
    // 普通模式：检查保护状态（使用顶层字段）
    const effectiveProtection = !!photo.effective_protection;
    const isProtectedForViewer = effectiveProtection && !isAdmin;
    
    // 检查是否有有效的图片URL
    const hasValidImageUrl = photo.size1024 || photo.thumbnail;
    
    const content = (
      <div className={'relative w-full overflow-hidden rounded-lg'} style={{ paddingTop: '75%' /* 4:3 aspect ratio */ }}>
        <div className="absolute inset-0">
          {isProtectedForViewer || !hasValidImageUrl ? (
            // 非管理员用户或没有有效URL时显示锁图标
            <div
              className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 relative`}
              title={isProtectedForViewer ? "已加密：未登录用户不可查看详情" : "图片不可用"}
            >
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-xs">
                  {isProtectedForViewer ? (() => {
                    const level = photo.protection_level;
                    if (level === 'personal') return '此照片包含个人隐私内容，已加密保护';
                    if (level === 'sensitive') return '此照片包含敏感内容，已加密保护';
                    if (level === 'restricted') return '此照片严格限制访问，已加密保护';
                    if (level === 'portrait') return '此照片涉及他人肖像权，已加密保护';
                    if (level === 'other') return '此照片已被管理员加密保护';
                    return '该照片涉及隐私或他人肖像，已被管理员加密';
                  })() : "图片不可用"}
                </div>
              </div>
            </div>
          ) : (
            // 普通用户或管理员可以查看的照片
            <LazyImage
              src={`${API_CONFIG.BASE_URL}${photo.size1024 || photo.thumbnail}?v=${stableTimestamp}`}
              alt={photo.title || '照片'}
              className={`transition-transform duration-300 group-hover:scale-110 w-full h-full object-cover`}
              onClick={(e) => handlePhotoClick(photo, e)}
              onMouseDown={(e) => handlePhotoMouseDown(photo, e)}
              onMouseMove={(e) => handlePhotoMouseMove(photo, e)}
              autoOrientation={true}
              lazyOptions={{
                root: scrollRoot,
                rootMargin: '0px 0px 400px 0px',
                threshold: 0.05
              }}
            />
          )}
          {/* 管理员视图：加密则常显锁图标（无文案） */}
          {!isProtectedForViewer && effectiveProtection && (
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded" title="加密">
              🔒
            </div>
          )}
        </div>
      </div>
    );
    
    if (isMasonry) {
      return (
        <div className={`masonry-content relative w-full h-full overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-lg transition-shadow ${isProtectedForViewer ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={(e)=>{ if (isProtectedForViewer) return; handlePhotoClick(photo, e); }}>
          {content}
        </div>
      );
    }
    
    return (
      <AdaptiveCard 
        key={photo.id} 
        className={`h-full group photo-card ${isProtectedForViewer ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        hover={true}
        shadow={'default'}
      >
        {content}
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
              <div className="flex items-center space-x-3">
                {/* 平铺模式 */}
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="平铺模式"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                  </svg>
                  <span className="text-sm font-medium">平铺</span>
                </button>
                
                {/* 瀑布流模式 */}
                <button
                  onClick={() => setViewMode('waterfall')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    viewMode === 'waterfall' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="瀑布流模式"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="6" height="10" rx="1"></rect>
                    <rect x="9" y="3" width="6" height="16" rx="1"></rect>
                    <rect x="16" y="3" width="6" height="13" rx="1"></rect>
                  </svg>
                  <span className="text-sm font-medium">瀑布流</span>
                </button>
                
                {/* 随机模式 */}
                <button
                  onClick={fetchRandomPhoto}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    viewMode === 'random' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="随机浏览"
                  disabled={isRandomizing}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                    <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"></circle>
                    <circle cx="17.5" cy="17.5" r="1.5" fill="currentColor"></circle>
                  </svg>
                  <span className="text-sm font-medium">随机</span>
                </button>
              </div>
              
              {/* 筛选选项 */}
              <div className="flex items-center space-x-3">
                {/* 隐藏加密图片开关 */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideEncryptedPhotos}
                    onChange={(e) => setHideEncryptedPhotos(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">隐藏加密图片</span>
                </label>
                
                {/* 胶卷类型和画幅筛选 - 暂时隐藏 */}
                {false && (
                  <>
                    <select
                      value={filmTypeFilter}
                      onChange={(e) => setFilmTypeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">全部类型</option>
                      <option value="Color Negative">彩色</option>
                      <option value="Black & White">黑白</option>
                      <option value="Slide">反转片</option>
                    </select>
                    
                    <select
                      value={filmFormatFilter}
                      onChange={(e) => setFilmFormatFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">全部画幅</option>
                      <option value="135mm">135</option>
                      <option value="120">120</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full flex-1 py-2">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {viewMode === 'random' ? (
              <RandomFilmStrip
                photos={randomPhotos}
                onRandom={fetchRandomPhoto}
                isRandomizing={isRandomizing}
                onFrameClick={openRandomPhoto}
                error={randomError}
                renderPhotoCard={renderPhotoCard}
                scrollRoot={scrollRoot}
              />
            ) : photos.length === 0 && !loading ? (
              // 空状态
              <div className="w-full h-64 flex flex-col items-center justify-center text-center">
                <div className="text-gray-400 text-6xl mb-4">📸</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">暂无照片</h3>
                <p className="text-gray-600">请稍后再来查看</p>
              </div>
            ) : (
              // 正常照片列表模式
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
                    const columnCount = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
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
                      // 根据原始物理尺寸和EXIF Orientation计算显示宽高比
                      let aspectRatio = 1.5; // 默认3:2横图
                      
                      if (photo.width && photo.height && photo.height > 0) {
                        // 数据库存储的是原始物理尺寸,需要根据EXIF Orientation判断是否需要互换
                        // orientation 6(90°顺时针) 或 8(270°顺时针/90°逆时针) 需要互换宽高
                        const needsSwap = photo.orientation === 6 || photo.orientation === 8;
                        
                        const displayWidth = needsSwap ? photo.height : photo.width;
                        const displayHeight = needsSwap ? photo.width : photo.height;
                        
                        aspectRatio = displayWidth / displayHeight;
                      } else {
                        // 如果没有尺寸数据,使用备用方案:根据编号模拟
                        const photoNum = photo.photo_number || index + 1;
                        if (photoNum % 3 === 0) {
                          aspectRatio = 0.67; // 2:3竖图
                        } else if (photoNum % 2 === 0) {
                          aspectRatio = 1.5; // 3:2横图
                        } else {
                          aspectRatio = 1; // 正方形
                        }
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
                          const effectiveProtection = !!photo.effective_protection;
                          const isProtectedForViewer = effectiveProtection && !isAdmin;
                          
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
                              <div className={`masonry-content relative w-full h-full overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-lg transition-shadow ${isProtectedForViewer ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={(e)=>{ if (isProtectedForViewer) return; handlePhotoClick(photo, e); }}>
                                {isProtectedForViewer ? (
                                  <div className="w-full h-full bg-gray-100 text-gray-500 flex items-center justify-center text-center px-3">
                                    <div>
                                      <div className="text-3xl mb-2">🔒</div>
                                      <div className="text-xs">
                                        {(() => {
                                          const level = photo.protection_level;
                                          if (level === 'personal') return '此照片包含个人隐私内容，已加密保护';
                                          if (level === 'sensitive') return '此照片包含敏感内容，已加密保护';
                                          if (level === 'restricted') return '此照片严格限制访问，已加密保护';
                                          if (level === 'portrait') return '此照片涉及他人肖像权，已加密保护';
                                          if (level === 'other') return '此照片已被管理员加密保护';
                                          return '该照片涉及隐私或他人肖像，已被管理员加密';
                                        })()}
                                      </div>
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
                                {!isProtectedForViewer && effectiveProtection && (
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
          photos={viewMode === 'random' ? randomPhotos : photos}
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

export default Gallery;
