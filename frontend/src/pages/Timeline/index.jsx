import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api.js';
import { photoApi } from '../../services/api';
import {
  resolvePhotoShortLink,
  getPhotoShortCode,
  buildShortLinkPath,
  normalizeShortCode
} from '../../utils/shortLink.js';
import { resolveProtectionLevelInfo } from '../../constants/protectionLevels.js';
import { useScrollContainer } from '../../contexts/ScrollContainerContext';

const Timeline = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const shortCodeParam = params?.shortCode;
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showUI, setShowUI] = useState(true); // 控制UI显示状态
  const initialPathRef = useRef(window.location.pathname || '/timeline');
  const hasPushedShortLinkRef = useRef(false);
  const { authRef } = useScrollContainer() || {};
  const isAdminUser = Boolean(authRef?.isAdmin);

  const logShortLinkEvent = useCallback((level, message, payload = {}) => {
    const prefix = '[Timeline][ShortLink]';
    if (level === 'warn') {
      console.warn(prefix, message, payload);
    } else {
      console.log(prefix, message, payload);
    }
  }, []);

  const updateHistoryForPhoto = useCallback((photo, { replace = false } = {}) => {
    const shortLinkPath = buildShortLinkPath(getPhotoShortCode(photo));
    if (!shortLinkPath) {
      logShortLinkEvent('warn', 'skip history update, missing short code', {
        id: photo?.id,
        rawShortCode: photo?._raw?.short_code
      });
      return;
    }

    logShortLinkEvent('info', 'updateHistoryForPhoto', {
      shortLinkPath,
      replace,
      code: getPhotoShortCode(photo),
      currentHref: window.location.href
    });

    const method = replace ? 'replaceState' : 'pushState';
    if (!replace) {
      hasPushedShortLinkRef.current = true;
    }
    window.history[method](
      { modal: true, source: 'timeline' },
      '',
      shortLinkPath
    );
  }, [logShortLinkEvent]);

  const restoreHistoryPath = useCallback(() => {
    if (!hasPushedShortLinkRef.current) return;
    window.history.replaceState(
      { modal: false, source: 'timeline' },
      '',
      initialPathRef.current || '/timeline'
    );
    hasPushedShortLinkRef.current = false;
  }, []);

  const mapPhotoRecord = useCallback((photo, { fallbackIdPrefix = 'timeline-photo', fallbackTitle = '未命名照片' } = {}) => {
    if (!photo) return null;

    const normalizeUrl = (url) => {
      if (!url) return null;
      if (typeof url !== 'string') return null;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `${API_CONFIG.BASE_URL}${url}`;
    };

    const backendThumbnail = normalizeUrl(photo.thumbnail);
    const backendOriginal = normalizeUrl(photo.original);
    const backendSize1024 = normalizeUrl(photo.size1024);
    const backendSize2048 = normalizeUrl(photo.size2048);
    const hasBackendImageUrl = Boolean(backendThumbnail || backendSize1024 || backendSize2048 || backendOriginal);

    const filename = hasBackendImageUrl ? (photo.filename || photo.original_name || '') : '';
    const takenDate = photo.taken_date;
    const uploadedAt = photo.uploaded_at;
    const displayDate = photo.date
      || (takenDate ? takenDate.split(' ')[0] : (uploadedAt ? uploadedAt.split(' ')[0] : '未知日期'));
    const effectiveProtection = Boolean(
      photo.effective_protection !== undefined ? photo.effective_protection : photo.is_protected
    );

    const sanitizedRaw = hasBackendImageUrl ? photo : {
      ...photo,
      filename: undefined,
      original: undefined,
      size1024: undefined,
      size2048: undefined,
      thumbnail: undefined
    };

    const mapped = {
      id: photo.id || `${fallbackIdPrefix}-${photo.photo_number || Date.now()}`,
      title: photo.title || (hasBackendImageUrl ? filename : '') || fallbackTitle,
      description: photo.description || '',
      thumbnail: backendThumbnail,
      original: backendOriginal,
      size1024: backendSize1024,
      size2048: backendSize2048,
      filename: filename || undefined,
      camera: photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机',
      camera_brand: photo.camera_brand,
      camera_model: photo.camera_model,
      lens_model: photo.lens_model,
      film: photo.film_roll_name || photo.film_roll_number || '未知胶卷',
      film_roll_number: photo.film_roll_number,
      date: displayDate,
      taken_date: takenDate,
      uploaded_at: uploadedAt,
      rating: photo.rating || 0,
      location_name: photo.location_name,
      country: photo.country,
      province: photo.province,
      city: photo.city,
      categories: photo.categories,
      trip_name: photo.trip_name,
      photo_serial_number: photo.photo_serial_number,
      width: photo.width,
      height: photo.height,
      orientation: photo.orientation,
      is_protected: photo.is_protected,
      protection_level: photo.protection_level,
      effective_protection: effectiveProtection,
      shortCode: getPhotoShortCode(photo),
      short_link: resolvePhotoShortLink(photo),
      _raw: sanitizedRaw
    };
    if (!mapped.shortCode) {
      logShortLinkEvent('warn', 'mapped photo missing shortCode', {
        id: mapped.id,
        rawShortCode: photo.short_code,
        source: 'mapPhotoRecord'
      });
    }
    return mapped;
  }, [logShortLinkEvent]);

  const openPhotoById = useCallback((targetId) => {
    if (!targetId) return false;
    const stringId = targetId.toString();
    const targetIndex = photos.findIndex((p) => p.id?.toString() === stringId);
    if (targetIndex === -1) return false;
    const targetPhoto = photos[targetIndex];
    setSelectedPhoto(targetPhoto);
    setShowModal(true);
    updateHistoryForPhoto(targetPhoto, { replace: !hasPushedShortLinkRef.current });
    return true;
  }, [photos, updateHistoryForPhoto]);

  const fetchPhotoByShortCode = useCallback(async (code) => {
    const normalized = normalizeShortCode(code);
    if (!normalized) return null;
    try {
      const response = await photoApi.getPhotoByShortCode(normalized);
      const payload = response?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      if (!list.length) return null;
      return mapPhotoRecord(list[0], { fallbackIdPrefix: `timeline-${normalized}` });
    } catch (error) {
      console.error('通过短链获取照片失败:', error);
      return null;
    }
  }, [mapPhotoRecord]);

  const openPhotoByShortCode = useCallback(async (code) => {
    const normalized = normalizeShortCode(code);
    if (!normalized) return;
    const existingIndex = photos.findIndex((p) => getPhotoShortCode(p) === normalized);
    let targetPhoto = existingIndex !== -1 ? photos[existingIndex] : null;
    if (!targetPhoto) {
      const fetched = await fetchPhotoByShortCode(normalized);
      if (fetched) {
        targetPhoto = fetched;
        setPhotos((prev) => {
          if (prev.some((p) => p.id === fetched.id)) return prev;
          return [fetched, ...prev];
        });
      }
    }
    if (targetPhoto) {
      setSelectedPhoto(targetPhoto);
      setShowModal(true);
      logShortLinkEvent('info', 'openPhotoByShortCode resolved target', {
        code: normalized,
        id: targetPhoto.id,
        shortLink: targetPhoto.short_link
      });
      updateHistoryForPhoto(targetPhoto, { replace: !hasPushedShortLinkRef.current });
    }
  }, [fetchPhotoByShortCode, photos, updateHistoryForPhoto, logShortLinkEvent]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const photoIdParam = urlParams.get('photo');
    if (photoIdParam) {
      logShortLinkEvent('info', 'detected query photo param', { photoIdParam });
      const opened = openPhotoById(photoIdParam);
      if (opened) return;
    }
    const normalizedShortCode = normalizeShortCode(shortCodeParam);
    if (normalizedShortCode) {
      logShortLinkEvent('info', 'detected route shortCode', { shortCode: normalizedShortCode });
      openPhotoByShortCode(normalizedShortCode);
    }
  }, [location.search, shortCodeParam, openPhotoById, openPhotoByShortCode, logShortLinkEvent]);

  useEffect(() => {
    if (showModal && selectedPhoto) {
      logShortLinkEvent('info', 'selectedPhoto changed', {
        id: selectedPhoto.id,
        code: getPhotoShortCode(selectedPhoto),
        short_link: selectedPhoto.short_link
      });
      updateHistoryForPhoto(selectedPhoto, { replace: hasPushedShortLinkRef.current });
    }
  }, [showModal, selectedPhoto, updateHistoryForPhoto, logShortLinkEvent]);

  useEffect(() => {
    const handlePopState = (event) => {
      if (hasPushedShortLinkRef.current) {
        setShowModal(false);
        setSelectedPhoto(null);
        hasPushedShortLinkRef.current = false;
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => () => {
    restoreHistoryPath();
  }, [restoreHistoryPath]);

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
          setSelectedPhoto(null);
          restoreHistoryPath();
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
            updateHistoryForPhoto(photos[prevIndex], { replace: true });
          }
          break;
        case 'ArrowRight':
          if (photos.length > 1) {
            const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
            const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
            setSelectedPhoto(photos[nextIndex]);
            updateHistoryForPhoto(photos[nextIndex], { replace: true });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal, photos, selectedPhoto, restoreHistoryPath, updateHistoryForPhoto]);

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
      const response = await photoApi.getAllPhotos();
      const payload = response?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.photos)
            ? payload.photos
            : [];
      const formattedPhotos = list
        .map((photo, index) => mapPhotoRecord(photo, { fallbackIdPrefix: `timeline-${index}` }))
        .filter(Boolean);
      if (formattedPhotos.length > 0) {
        logShortLinkEvent('info', 'fetched first photo', {
          id: formattedPhotos[0].id,
          shortCode: formattedPhotos[0].shortCode,
          short_link: formattedPhotos[0].short_link,
          rawShortCode: formattedPhotos[0]._raw?.short_code
        });
      } else {
        logShortLinkEvent('warn', 'fetched no photos or mapping failed');
      }
      setPhotos(formattedPhotos);
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
    const effectivePrivate = !!(photo?.effective_protection || photo?._raw?.effective_protection || photo?._raw?.effective_private);
    const isPrivateForViewer = effectivePrivate && !isAdminUser;

    if (isPrivateForViewer) {
      const protectionInfo = resolveProtectionLevelInfo(photo?.protection_level);
      return (
        <div className={`${className} bg-gray-100 text-gray-500 flex items-center justify-center`}>
          <div className="text-center px-4">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-xs leading-relaxed">
              {protectionInfo?.description || '该照片暂不公开展示。'}
            </div>
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
            const shouldReplace = hasPushedShortLinkRef.current;
            setSelectedPhoto(photo);
            setShowModal(true);
            updateHistoryForPhoto(photo, { replace: shouldReplace });
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
            const shouldReplace = hasPushedShortLinkRef.current;
            setSelectedPhoto(photo);
            setShowModal(true);
            updateHistoryForPhoto(photo, { replace: shouldReplace });
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
              const shouldReplace = hasPushedShortLinkRef.current;
              setSelectedPhoto(photo);
              setShowModal(true);
              updateHistoryForPhoto(photo, { replace: shouldReplace });
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
                  setSelectedPhoto(null);
                  restoreHistoryPath();
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
                        const shareUrl = resolvePhotoShortLink(selectedPhoto)
                          || `${window.location.origin}${buildShortLinkPath(getPhotoShortCode(selectedPhoto))}`;
                        if (shareUrl) {
                          navigator.clipboard.writeText(shareUrl);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-500 transition-colors text-sm"
                    >
                      复制短链
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
                  updateHistoryForPhoto(photos[prevIndex], { replace: true });
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
                  updateHistoryForPhoto(photos[nextIndex], { replace: true });
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
