import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, MapPinIcon } from '@heroicons/react/24/outline';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import API_CONFIG from '../../config/api.js';
import LazyImage from '../../components/LazyImage';
import PhotoPreview from '../../components/PhotoPreview';
import './Map.css';
import {
  getPhotoShortCode,
  resolvePhotoShortLink,
  buildShortLinkPath
} from '../../utils/shortLink.js';

const MapLibre = () => {
  const location = useLocation();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(3);
  const [photoIndex, setPhotoIndex] = useState(0);
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/map';
    try {
      const url = new URL(window.location.href);
      if (url.pathname === '/map' && url.searchParams.has('photo')) {
        return '/map';
      }
      if (/^\/s\/[0-9A-Za-z]{5,8}$/.test(url.pathname)) {
        return url.pathname; // 嵌套场景下保持原短链
      }
      return `${url.pathname}${url.search}`;
    } catch (error) {
      console.warn('[MapLibre][ShortLink]', 'failed to parse initial URL', { error });
      return '/map';
    }
  };

  const initialPathRef = useRef(getInitialPath());
  const hasPushedShortLinkRef = useRef(false);
  const pendingHistoryModeRef = useRef('auto');

  const logShortLinkEvent = useCallback((level, message, payload = {}) => {
    if (typeof window !== 'undefined') {
      window.__mapShortLinkLogs = window.__mapShortLinkLogs || [];
      window.__mapShortLinkLogs.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...payload
      });
    }
    const prefix = '[MapLibre][ShortLink]';
    if (level === 'warn') {
      console.warn(prefix, message, payload);
    } else {
      console.log(prefix, message, payload);
    }
  }, []);

  const updateHistoryForPhoto = useCallback((photo, { replace = false } = {}) => {
    if (typeof window === 'undefined' || !photo) return;
    const shortCode = getPhotoShortCode(photo);
    const shortLinkPath = buildShortLinkPath(shortCode);
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
      code: shortCode,
      currentHref: window.location.href
    });
    const method = replace ? 'replaceState' : 'pushState';
    if (!replace) {
      hasPushedShortLinkRef.current = true;
    }
    window.history[method](
      { modal: true, source: 'map' },
      '',
      shortLinkPath
    );
  }, [logShortLinkEvent]);

  const restoreHistoryPath = useCallback(() => {
    if (typeof window === 'undefined' || !hasPushedShortLinkRef.current) return;
    const fallbackPath = initialPathRef.current || '/map';
    window.history.replaceState(
      { modal: false, source: 'map' },
      '',
      fallbackPath
    );
    hasPushedShortLinkRef.current = false;
    logShortLinkEvent('info', 'restoreHistoryPath', { path: fallbackPath });
  }, [logShortLinkEvent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      if (hasPushedShortLinkRef.current) {
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

  useEffect(() => {
    if (!selectedPhoto || selectedPhoto.loading) return;
    const historyMode = pendingHistoryModeRef.current;
    const shouldReplace = historyMode === 'replace'
      || (historyMode === 'auto' && hasPushedShortLinkRef.current);

    logShortLinkEvent('info', 'updateHistoryEffect', {
      mode: historyMode,
      hasPushed: hasPushedShortLinkRef.current,
      replace: shouldReplace,
      id: selectedPhoto.id,
      shortCode: getPhotoShortCode(selectedPhoto)
    });

    updateHistoryForPhoto(selectedPhoto, { replace: shouldReplace });
    pendingHistoryModeRef.current = 'auto';
  }, [selectedPhoto, updateHistoryForPhoto]);

  // 自动降级：检查月初重置和配额限制
  const getAutoMapStyle = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const resetKey = `${currentYear}-${currentMonth}`;
    
    const lastResetDate = localStorage.getItem('mapStyleResetDate');
    
    // 检查是否需要重置（每月1号重置为矢量）
    if (lastResetDate !== resetKey) {
      // 新月份，重置为矢量
      localStorage.setItem('mapStyle', 'maptiler-vector');
      localStorage.setItem('mapStyleResetDate', resetKey);
      localStorage.removeItem('mapStyleDowngrade'); // 清除降级记录
      console.log('📅 新月份，自动重置为MapTiler矢量');
      return 'maptiler-vector';
    }
    
    // 检查是否有降级记录（使用较低优先级的方案）
    const downgradeLevel = localStorage.getItem('mapStyleDowngrade');
    
    if (downgradeLevel === 'raster') {
      console.log('📉 使用栅格降级方案');
      return 'maptiler-raster';
    } else if (downgradeLevel === 'osm') {
      console.log('📉 使用OSM降级方案');
      return 'osm-raster';
    }
    
    // 默认使用矢量（首选）
    return 'maptiler-vector';
  };
  
  // 地图样式状态（自动降级方案，默认maptiler-vector）
  const [mapStyle, setMapStyle] = useState(() => getAutoMapStyle());
  
  // 地图加载成功后，注册自动降级监听
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    // 监听数据加载错误（可能是配额问题）
    const handleDataEvent = (e) => {
      if (e.error && e.error.message) {
        const errorMsg = e.error.message.toLowerCase();
        if (errorMsg.includes('403') || errorMsg.includes('quota')) {
          console.warn('⚠️ 检测到配额问题，准备降级');
          
          const currentStyle = mapStyle;
          if (currentStyle === 'maptiler-vector') {
            console.log('📉 自动降级：MapTiler矢量 → 栅格');
            setMapStyle('maptiler-raster');
            localStorage.setItem('mapStyleDowngrade', 'raster');
          } else if (currentStyle === 'maptiler-raster') {
            console.log('📉 自动降级：MapTiler栅格 → OSM');
            setMapStyle('osm-raster');
            localStorage.setItem('mapStyleDowngrade', 'osm');
          }
        }
      }
    };
    
    // 注册监听器
    const setupListener = () => {
      map.on('data', handleDataEvent);
    };
    
    // 清理函数
    const cleanup = () => {
      map.off('data', handleDataEvent);
    };
    
    // 如果地图已加载，立即注册
    if (map.loaded()) {
      setupListener();
      return cleanup;
    } else {
      // 否则等待加载完成
      map.once('load', () => {
        setupListener();
      });
      return cleanup;
    }
  }, [mapStyle]);

  // 缩放等级映射函数：1-15 映射到显示 1-15
  const getZoomLevelDisplay = (zoom) => {
    const zoomMap = {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12,
      13: 13, 14: 14, 15: 15
    };
    return zoomMap[zoom] || zoom;
  };
  
  // 获取地图样式URL
  const getMapStyleUrl = (style) => {
    const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
    
    switch (style) {
      case 'maptiler-vector':
        // MapTiler 矢量瓦片（首选，PBF格式）
        return `https://api.maptiler.com/maps/dataviz/style.json?key=${maptilerKey}`;
      case 'maptiler-raster':
        // MapTiler 栅格瓦片（真实PNG格式）
        // 使用WGS84作为底图，PNG栅格瓦片
        return {
          version: 8,
          sources: {
            'maptiler-raster': {
              type: 'raster',
              tiles: [
                `https://api.maptiler.com/maps/dataviz/{z}/{x}/{y}.png?key=${maptilerKey}`
              ],
              tileSize: 256,
              attribution: '© MapTiler © OpenStreetMap contributors',
              maxzoom: 18
            }
          },
          layers: [{
            id: 'maptiler-raster-layer',
            type: 'raster',
            source: 'maptiler-raster'
          }]
        };
      case 'osm-raster':
        // OSM 栅格瓦片（最终备选，免费，真实PNG格式）
        return {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
              maxzoom: 18
            }
          },
          layers: [{
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles'
          }]
        };
      default:
        return `https://api.maptiler.com/maps/dataviz/style.json?key=${maptilerKey}`;
    }
  };
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // 防抖函数：避免频繁请求
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // 获取地图照片位置（轻量级，只获取标点信息）
  // 使用 useCallback 稳定函数引用，确保防抖函数能正确工作
  const fetchMapMarkers = useCallback(async (bounds = null, zoom = null) => {
    if (!mapInstanceRef.current) return;
    
    try {
      // 如果没有提供bounds，使用当前地图视图的bounds
      if (!bounds) {
        const mapBounds = mapInstanceRef.current.getBounds();
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        bounds = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
      }
      
      // 使用 /api/map/photos 接口的轻量级模式，只获取位置信息（用于标点）
      const response = await fetch(`/api/map/photos?bounds=${bounds}&lightweight=true`);
      
      if (!response.ok) {
        console.error('获取照片位置失败:', response.status);
        return;
      }

      const result = await response.json();
      let markersArray = [];
      
      // 优先读取 data 字段
      if (result.success && result.data && Array.isArray(result.data)) {
        markersArray = result.data;
      }
      
      // 只保存位置信息（用于显示标点）
      // 过滤无效坐标（0,0 或超出有效范围）
      const markers = markersArray
        .filter(marker => {
          const lat = Number(marker.latitude);
          const lng = Number(marker.longitude);
          // 验证坐标有效性：不能是 0,0，且必须在有效范围内
          return lat !== 0 && lng !== 0 
            && !isNaN(lat) && !isNaN(lng)
            && lat >= -90 && lat <= 90
            && lng >= -180 && lng <= 180;
        })
        .map(marker => ({
          id: marker.id,
          latitude: Number(marker.latitude),
          longitude: Number(marker.longitude)
        }));
      
      // 更新标点列表（当前视图内的标点）
      setPhotos(markers);
    } catch (error) {
      console.error('获取地图标点出错:', error);
    }
  }, []);

  // 获取单张照片详情（点击标点时调用）
  const fetchPhotoDetail = async (photoId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
      const response = await fetch(`/api/photos/${photoId}`, {
        headers
      });
      
      if (!response.ok) {
        console.error('获取照片详情失败:', response.status, response.statusText);
        return null;
      }

      const result = await response.json();
      let photo = null;
      
      // 读取照片数据（兼容多种返回格式）
      if (result && result.data) {
        photo = result.data;
      } else if (result && result.photo) {
        photo = result.photo;
      } else if (result && result.success && result.data) {
        photo = result.data;
      } else if (result && result.success && result.photo) {
        photo = result.photo;
      } else if (!result || !result.success) {
        console.error('获取照片详情失败:', result?.message || '未知错误', result);
        return null;
      }
      
      if (!photo) {
        console.error('照片数据为空:', result);
        return null;
      }
      
      // 映射到前端期望的格式
      const shortCode = getPhotoShortCode(photo);
      const mappedPhoto = {
        id: photo.id || photoId,
        title: photo.title || photo.filename || '无标题',
        description: photo.description || '',
        thumbnail: photo.thumbnail || photo.original,
        original: photo.original,
        size1024: photo.size1024,
        size2048: photo.size2048,
        camera: photo.camera || (photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机'),
        film: photo.film || (photo.film_roll_name || photo.film_roll_number || '无'),
        date: photo.date || (photo.taken_date ? photo.taken_date.split(' ')[0] : (photo.uploaded_at ? photo.uploaded_at.split(' ')[0] : '未知日期')),
        latitude: photo.latitude,
        longitude: photo.longitude,
        location_name: photo.location_name,
        country: photo.country,
        province: photo.province,
        city: photo.city,
        district: photo.district,
        township: photo.township,
        effective_protection: photo.effective_protection,
        shortCode,
        short_link: resolvePhotoShortLink(photo),
        _raw: photo
      };
      
      if (!shortCode) {
        logShortLinkEvent('warn', 'photo detail missing shortCode', {
          photoId,
          rawShortCode: photo?.short_code,
          source: 'fetchPhotoDetail'
        });
      } else {
        logShortLinkEvent('info', 'photo detail resolved', {
          photoId,
          shortCode,
          short_link: mappedPhoto.short_link
        });
      }
      
      return mappedPhoto;
    } catch (error) {
      console.error('获取照片详情出错:', error);
      return null;
    }
  };
  
  // 照片详情缓存（避免重复请求）
  const photoDetailCache = useRef(new Map());
  const openPhotoById = useCallback(async (photoId, { replaceHistory = false } = {}) => {
    if (!photoId) return false;
    const normalizedId = photoId.toString();
    pendingHistoryModeRef.current = replaceHistory ? 'replace' : 'auto';
    logShortLinkEvent('info', 'openPhotoById', { photoId: normalizedId, replaceHistory });
    if (photoDetailCache.current.has(normalizedId)) {
      setSelectedPhoto(photoDetailCache.current.get(normalizedId));
      return true;
    }
    setSelectedPhoto({ id: normalizedId, loading: true, _pendingSource: replaceHistory ? 'legacy-query' : 'direct' });
    const detail = await fetchPhotoDetail(normalizedId);
    if (detail) {
      photoDetailCache.current.set(normalizedId, detail);
      setSelectedPhoto(detail);
      return true;
    }
    pendingHistoryModeRef.current = 'auto';
    setSelectedPhoto(null);
    return false;
  }, [fetchPhotoDetail, logShortLinkEvent]);

  useEffect(() => {
    const search = location?.search || '';
    if (!search) return;
    const urlParams = new URLSearchParams(search);
    const photoIdParam = urlParams.get('photo');
    if (photoIdParam) {
      logShortLinkEvent('info', 'detected photo query param', { photoIdParam });
      openPhotoById(photoIdParam, { replaceHistory: true });
    }
  }, [location?.search, openPhotoById, logShortLinkEvent]);
  
  // 防抖函数引用：避免地图移动时频繁请求标点
  const debouncedFetchMarkersRef = useRef(null);
  const handlePreviewClose = useCallback(() => {
    setSelectedPhoto(null);
    restoreHistoryPath();
  }, [restoreHistoryPath]);
  const handlePreviewPhotoChange = useCallback((newPhoto, newIndex) => {
    setSelectedPhoto(newPhoto);
    setPhotoIndex(newIndex);
  }, []);

  // 获取用户位置
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持地理定位');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        if (mapInstanceRef.current) {
          // 智能定位：如果缩放太远，自动放大到合适的级别
          const currentZoom = mapInstanceRef.current.getZoom();
          let targetZoom = currentZoom;
          
          // 如果当前缩放太远（< 10级），定位时自动放大到城市级别（10级，显示10x）
          if (currentZoom < 10) {
            targetZoom = 10;
            console.log('当前视图太远，定位时自动放大到10x');
          }
          
          mapInstanceRef.current.flyTo({
            center: [longitude, latitude],
            zoom: targetZoom
          });
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('获取位置失败:', error);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // 切换全屏模式
  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'TOGGLE_FULLSCREEN',
        isFullscreen: newFullscreenState
      }, '*');
    }

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    }, 300);
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom < 18) {  // 最大限制到Zoom 18（显示18x）
        mapInstanceRef.current.zoomIn();
      }
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom > 1) {
        mapInstanceRef.current.zoomOut();
      }
    }
  };

  // 初始化地图
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      console.log('Initializing MapLibre map...');
      
      const styleUrl = getMapStyleUrl(mapStyle);
      
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: styleUrl,
        center: [113.9, 22.5],  // 直接设置深圳为中心
        zoom: 3,                 // 默认Zoom 3，显示3x
        minZoom: 1,              // 最小Zoom 1（显示1x）
        maxZoom: 18,             // 最大Zoom 18（显示18x）
        // 优化瓦片加载策略
        refreshExpiredTiles: false,  // 不刷新过期瓦片，优先使用缓存
        maxTileCacheSize: 50,        // 增加瓦片缓存大小（MB）
        fadeDuration: 0,             // 禁用淡入效果，加快加载速度
        crossSourceCollisions: false, // 禁用跨源碰撞检测，提升性能
        attributionControl: false,    // 禁用默认版权控件（可自定义）
        // 瓦片请求优化
        transformRequest: (url, resourceType) => {
          // 限制并发请求，避免请求过多
          if (resourceType === 'Tile') {
            // 对于瓦片请求，可以添加延迟或限制
            return {
              url: url,
              headers: {}
            };
          }
          return { url: url };
        }
      });

      // 使用自定义控件，不使用 MapLibre 自带控件
      // map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      // 创建防抖函数（在地图初始化时创建，确保正确引用 fetchMapMarkers）
      // 优化：防抖时间从300ms增加到500ms，减少频繁请求
      debouncedFetchMarkersRef.current = debounce(() => {
        if (mapInstanceRef.current) {
          const mapBounds = mapInstanceRef.current.getBounds();
          const sw = mapBounds.getSouthWest();
          const ne = mapBounds.getNorthEast();
          const bounds = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
          const zoom = mapInstanceRef.current.getZoom();
          fetchMapMarkers(bounds, zoom);
        }
      }, 500);
      
      map.on('load', () => {
        console.log('Map style loaded successfully');
        // 确保地图尺寸正确
        map.resize();
        // 隐藏loading状态（地图样式加载完成即可显示地图，不等待标点数据）
        setLoading(false);
        // 异步获取照片位置（轻量级，只加载标点，不加载图片）
        // 确保传递bounds，避免查询所有照片（性能优化）
        const mapBounds = map.getBounds();
        const sw = mapBounds.getSouthWest();
        const ne = mapBounds.getNorthEast();
        const bounds = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
        fetchMapMarkers(bounds, map.getZoom());
      });
      
      // 监听地图移动结束，按需加载新区域的标点
      map.on('moveend', () => {
        if (debouncedFetchMarkersRef.current) {
          debouncedFetchMarkersRef.current();
        }
      });
      
      // 监听地图缩放结束，按需加载新区域的标点
      map.on('zoomend', () => {
        if (debouncedFetchMarkersRef.current) {
          debouncedFetchMarkersRef.current();
        }
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        setLoading(false);
        
        // 如果是配额错误，自动降级
        if (e.error && e.error.message) {
          const errorMsg = e.error.message.toLowerCase();
          if (errorMsg.includes('403') || errorMsg.includes('quota') || errorMsg.includes('limit')) {
            console.warn('⚠️ 检测到MapTiler配额问题，自动降级到OSM');
            const currentStyle = mapStyle;
            if (currentStyle === 'maptiler-vector' || currentStyle === 'maptiler-raster') {
              setMapStyle('osm-raster');
              localStorage.setItem('mapStyleDowngrade', 'osm');
            }
          }
        }
      });
      
      // 监听数据加载事件，优化瓦片加载
      map.on('data', (e) => {
        if (e.dataType === 'source' && e.isSourceLoaded) {
          // 源加载完成，可以优化后续请求
        }
      });

      map.on('zoom', () => {
        if (mapInstanceRef.current) {
          setCurrentZoom(mapInstanceRef.current.getZoom());
        }
      });

      mapInstanceRef.current = map;

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  // 监听 mapStyle 变化，更新地图样式（自动降级触发）
  useEffect(() => {
    if (mapInstanceRef.current && mapStyle && mapInstanceRef.current.loaded()) {
      const newStyleUrl = getMapStyleUrl(mapStyle);
      
      const styleNames = {
        'maptiler-vector': 'MapTiler 矢量',
        'maptiler-raster': 'MapTiler 栅格',
        'osm-raster': 'OSM 栅格'
      };
      
      console.log(`📦 自动切换地图样式到: ${styleNames[mapStyle]} (${mapStyle})`);
      
      // 显示loading状态
      setLoading(true);
      
      // 移除现有标记
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      
      // 更新地图样式
      mapInstanceRef.current.setStyle(newStyleUrl);
      
      // 地图样式加载完成后重新添加标记
      mapInstanceRef.current.once('style.load', () => {
        console.log(`✅ 地图样式加载完成: ${styleNames[mapStyle]}`);
        // 隐藏loading
        setLoading(false);
        
        if (userLocation) {
          const el = document.createElement('div');
          el.className = 'user-location-marker';
          el.innerHTML = '<div class="user-location-dot"><div class="user-location-pulse"></div></div>';
          el.style.width = '24px';
          el.style.height = '24px';

          const marker = new maplibregl.Marker({
            element: el,
            anchor: 'center'
          })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .addTo(mapInstanceRef.current);
          userMarkerRef.current = marker;
        }
        
        // 重新添加照片标记
        if (photos.length) {
          photos.forEach(photo => {
            // 严格验证坐标有效性：不能是 0,0，且必须在有效范围内
            const lat = Number(photo.latitude);
            const lng = Number(photo.longitude);
            const isValidCoord = lat !== 0 && lng !== 0 
              && !isNaN(lat) && !isNaN(lng)
              && lat >= -90 && lat <= 90
              && lng >= -180 && lng <= 180;
            
            if (isValidCoord && photo.id) {
              const el = document.createElement('div');
              el.className = 'map-photo-marker';
              el.innerHTML = '<div class="photo-dot"></div>';
              // 确保元素可点击
              el.style.cursor = 'pointer';
              el.style.pointerEvents = 'auto';
              
              const marker = new maplibregl.Marker({
                element: el,
                anchor: 'center'
              })
                .setLngLat([lng, lat])
                .addTo(mapInstanceRef.current);
              
              markersRef.current.push(marker);
              
              // 使用marker.getElement()确保获取到正确的元素
              const markerElement = marker.getElement();
              markerElement.addEventListener('click', async (e) => {
                e.stopPropagation(); // 阻止事件冒泡到地图
                
                // 点击标点时，加载照片详情
                const photoId = photo.id;
                
                // 验证照片ID是否存在（ID可能是UUID格式，不一定是数字）
                if (!photoId || (typeof photoId !== 'string' && typeof photoId !== 'number')) {
                  console.error('无效的照片ID:', photoId);
                  return;
                }
                
                // 检查缓存
                if (photoDetailCache.current.has(photoId)) {
                  const cachedPhoto = photoDetailCache.current.get(photoId);
                  setSelectedPhoto(cachedPhoto);
                  return;
                }
                
                // 显示加载状态
                setSelectedPhoto({ id: photoId, loading: true });
                
                // 获取照片详情
                const photoDetail = await fetchPhotoDetail(photoId);
                
                if (photoDetail) {
                  // 缓存照片详情
                  photoDetailCache.current.set(photoId, photoDetail);
                  setSelectedPhoto(photoDetail);
                } else {
                  // 加载失败，清除加载状态
                  console.error('无法加载照片详情:', photoId);
                  setSelectedPhoto(null);
                }
              });
            }
          });
        }
      });
    }
  }, [mapStyle]);

  // 添加照片标记（标点）
  useEffect(() => {
    if (!mapInstanceRef.current || !photos.length) return;

    // 清除现有标记
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 添加新标记（标点）
    photos.forEach(markerData => {
      // 严格验证坐标有效性：不能是 0,0，且必须在有效范围内
      const lat = Number(markerData.latitude);
      const lng = Number(markerData.longitude);
      const isValidCoord = lat !== 0 && lng !== 0 
        && !isNaN(lat) && !isNaN(lng)
        && lat >= -90 && lat <= 90
        && lng >= -180 && lng <= 180;
      
      if (isValidCoord && markerData.id) {
        const el = document.createElement('div');
        el.className = 'map-photo-marker';
        if (selectedPhoto?.id === markerData.id) {
          el.classList.add('selected');
        }
        el.innerHTML = '<div class="photo-dot"></div>';
        // 确保元素可点击
        el.style.cursor = 'pointer';
        el.style.pointerEvents = 'auto';

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([markerData.longitude, markerData.latitude])
          .addTo(mapInstanceRef.current);

        // 使用marker.getElement()确保获取到正确的元素
        const markerElement = marker.getElement();
        markerElement.addEventListener('click', async (e) => {
          e.stopPropagation(); // 阻止事件冒泡到地图
          
          // 点击标点时，加载照片详情
          const photoId = markerData.id;
          
          // 验证照片ID是否存在（ID可能是UUID格式，不一定是数字）
          if (!photoId || (typeof photoId !== 'string' && typeof photoId !== 'number')) {
            console.error('无效的照片ID:', photoId);
            return;
          }
          
          // 检查缓存
          if (photoDetailCache.current.has(photoId)) {
            const cachedPhoto = photoDetailCache.current.get(photoId);
            setSelectedPhoto(cachedPhoto);
            return;
          }
          
          // 显示加载状态
          setSelectedPhoto({ id: photoId, loading: true });
          
          // 获取照片详情
          const photoDetail = await fetchPhotoDetail(photoId);
          
          if (photoDetail) {
            // 缓存照片详情
            photoDetailCache.current.set(photoId, photoDetail);
            setSelectedPhoto(photoDetail);
          } else {
            // 加载失败，清除加载状态
            console.error('无法加载照片详情:', photoId);
            setSelectedPhoto(null);
          }
        });

        markersRef.current.push(marker);
      }
    });
  }, [photos, selectedPhoto]);

  // 添加用户位置标记
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.innerHTML = '<div class="user-location-dot"><div class="user-location-pulse"></div></div>';
    
    // 添加 anchor 属性确保居中
    el.style.width = '24px';
    el.style.height = '24px';

    const marker = new maplibregl.Marker({
      element: el,
      anchor: 'center'
    })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(mapInstanceRef.current);

    userMarkerRef.current = marker;
  }, [userLocation]);

  return (
    <div className={`map-page ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="top-right-controls">
        <div className="map-control-container">
          <button 
            onClick={toggleFullscreen}
            className="control-btn fullscreen-btn"
            title={isFullscreen ? '退出全屏' : '进入全屏'}
          >
            {isFullscreen ? <ArrowsPointingInIcon className="icon" /> : <ArrowsPointingOutIcon className="icon" />}
          </button>

          <button 
            onClick={getUserLocation}
            className="control-btn location-btn"
            title="定位到我的位置"
            disabled={locationLoading}
          >
            <MapPinIcon className="icon" />
          </button>

          <button className="zoom-btn zoom-in" onClick={handleZoomIn}>+</button>
          <div className="zoom-display">
            <span className="zoom-value">{getZoomLevelDisplay(Math.round(currentZoom))}x</span>
          </div>
          <button className="zoom-btn zoom-out" onClick={handleZoomOut}>−</button>
        </div>
      </div>

      <div className="map-container">
        <div className="mapboxgl-map" ref={mapRef}></div>
        
        {loading && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>加载地图中...</p>
          </div>
        )}
      </div>

      <PhotoPreview
        photo={selectedPhoto}
        photos={photos}
        isOpen={!!selectedPhoto}
        onClose={handlePreviewClose}
        currentPath="/map"
        showNavigation={true}
        onPhotoChange={handlePreviewPhotoChange}
      />
    </div>
  );
};

export default MapLibre;
