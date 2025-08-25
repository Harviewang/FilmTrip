import React, { useState, useEffect, useRef } from 'react';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, MapPinIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API_CONFIG from '../../config/api.js';
import LazyImage from '../../components/LazyImage';
import './Map.css';

// 修复Leaflet默认图标问题
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(2);
  const [showUI, setShowUI] = useState(true); // 控制UI显示状态

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      
      switch (e.key) {
        case 'Escape':
          setSelectedPhoto(null);
          break;
        case 'h':
        case 'H':
          setShowUI(!showUI);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, showUI]);

  // 获取地图照片数据
  const fetchMapPhotos = async () => {
    try {
      setLoading(true);
      console.log('开始获取地图照片数据...');
      
      const response = await fetch(`${API_CONFIG.API_BASE}/photos`);
      console.log('API响应状态:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API响应数据:', result);
        
        if (result.success) {
          setPhotos(result.data);
          console.log(`成功获取 ${result.data.length} 张照片`);
        } else {
          console.error('获取地图照片失败:', result.message);
        }
      } else {
        console.error('获取地图照片失败:', response.status);
      }
    } catch (error) {
      console.error('获取地图照片出错:', error);
    } finally {
      setLoading(false);
    }
  };

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
        
        // 移动地图到用户位置
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 12, {
            animate: true,
            duration: 1.5
          });
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('获取位置失败:', error);
        let errorMessage = '获取位置失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了地理定位请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '获取位置超时';
            break;
        }
        alert(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // 处理照片点击
  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    // 移除自动定位和缩放，让用户自主控制地图
  };

  // 控制页面滚动 - 与其他页面保持一致
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPhoto]);

  // 切换全屏模式
  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    
    // 通知父组件全屏状态变化
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'TOGGLE_FULLSCREEN',
        isFullscreen: newFullscreenState
      }, '*');
    }

    // 重新调整地图尺寸
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);
  };

  // 缩放等级映射函数：3->1, 4->2, 5->3, 默认5->3
  const getZoomLevelDisplay = (zoom) => {
    const zoomMap = {
      3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: 12
    };
    return zoomMap[zoom] || zoom;
  };

  // 智能缩放限制，根据地理位置动态调整
  const getMaxZoomForLocation = (lat, lng) => {
    // 更精确的中国大陆范围判断
    // 排除日本、韩国、蒙古等周边国家
    const isInChina = lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135 &&
                     !(lat >= 24 && lat <= 46 && lng >= 123 && lng <= 146) && // 排除日本
                     !(lat >= 33 && lat <= 43 && lng >= 124 && lng <= 132) && // 排除韩国
                     !(lat >= 41 && lat <= 52 && lng >= 87 && lng <= 120);    // 排除蒙古
    
    if (isInChina) {
      console.log('检测到中国大陆位置，最大缩放14');
      return 14; // 中国大陆支持zoom 3-14
    } else {
      console.log('检测到海外位置，最大缩放9');
      return 9;  // 海外地区zoom 3-9
    }
  };

  // 安全缩放函数 - 检查限制后再执行
  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    
    const currentZoom = mapInstanceRef.current.getZoom();
    const center = mapInstanceRef.current.getCenter();
    const maxZoom = getMaxZoomForLocation(center.lat, center.lng);
    
    if (currentZoom < maxZoom) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    
    const currentZoom = mapInstanceRef.current.getZoom();
    
    if (currentZoom > 3) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // 渐进式信息展示的地图系统
  const [currentTileLayer, setCurrentTileLayer] = useState('amap');
  const [mapInfoLevel, setMapInfoLevel] = useState('基础');

  // 初始化地图
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // 创建地图实例 - 保留拖拽和交互优化
      const map = L.map(mapRef.current, {
        center: [22.5, 113.9],       // 深圳南山区坐标
        zoom: 3,                      // 默认缩放3.0，映射显示为1
        maxZoom: 14,                  // 支持到zoom 14
        minZoom: 3,                   // 限制最小缩放为3
        zoomControl: false,           // 隐藏默认缩放控件
        attributionControl: false,    // 隐藏归属信息
        dragging: true,               // 支持拖拽
        touchZoom: true,              // 支持触摸缩放
        scrollWheelZoom: true,        // 支持滚轮缩放
        doubleClickZoom: true,        // 支持双击缩放
        boxZoom: false,               // 禁用框选缩放
        keyboard: false,              // 禁用键盘控制
        tap: true,                    // 支持点击
        tapTolerance: 15,            // 点击容差
        trackResize: true,            // 跟踪尺寸变化
        // 保留拖拽优化配置
        worldCopyJump: true,           // 启用世界复制跳转
        maxBounds: [[-85, -Infinity], [85, Infinity]], // 限制南北纬度，东西经度完全无限制
        maxBoundsViscosity: 1.0,      // 硬边界，防止上下白边
        inertia: true,                 // 启用惯性
        inertiaDeceleration: 1500,    // 降低惯性减速度，更丝滑
        inertiaMaxSpeed: 10000,       // 提高最大惯性速度，更流畅
        easeLinearity: 0.1,           // 降低缓动线性度，更自然
        // 瓦片加载优化
        updateWhenIdle: true,         // 空闲时更新，减少拖动时的加载
        updateWhenZooming: true,      // 缩放时更新，确保缩放流畅
        zoomAnimation: true,           // 缩放动画
        zoomAnimationThreshold: 4,     // 缩放动画阈值
        fadeAnimation: true,           // 淡入淡出动画
        markerZoomAnimation: true,     // 标记缩放动画
        transform3DLimit: 8388608,     // 3D变换限制
      });

      // 定义渐进式地图源
      const tileLayers = {
        // 高德地图 - 国内使用，支持渐进式信息
        amap: {
          // 基础版 - 显示国家、省份、城市 (zoom 3-6)
          base: L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
            maxZoom: 14,
            minZoom: 3,
            subdomains: '1234',
            updateWhenIdle: false,
            updateWhenZooming: false,
            maxNativeZoom: 14,
            tileSize: 256,
            zoomOffset: 0,
            tms: false,
            bounds: null,
            noWrap: false,
            updateInterval: 100,
            zIndex: 1,
            opacity: 1.0,
            crossOrigin: true,
            loading: 'eager',
            keepBuffer: 8,
          }),
          // 详细版 - 显示街道、POI等详细信息 (zoom 7-14)
          detailed: L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            maxZoom: 14,
            minZoom: 7, // 从zoom 7开始显示详细信息
            subdomains: '1234',
            updateWhenIdle: false,
            updateWhenZooming: false,
            maxNativeZoom: 14,
            tileSize: 256,
            zoomOffset: 0,
            tms: false,
            bounds: null,
            noWrap: false,
            updateInterval: 100,
            zIndex: 2, // 更高层级
            opacity: 1.0,
            crossOrigin: true,
            loading: 'eager',
            keepBuffer: 8,
          })
        },
        
        // OpenStreetMap - 海外使用，支持渐进式信息和中文地名
        osm: {
          // 基础版 - 显示国家、省份、城市 (zoom 3-6) - 使用支持中文的OSM版本
          base: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?language=zh&locale=zh', {
            maxZoom: 9,
            minZoom: 3,
            subdomains: 'abc',
            attribution: '© OpenStreetMap contributors',
            updateWhenIdle: true,
            updateWhenZooming: true,
            keepBuffer: 8,
            maxNativeZoom: 9,
            tileSize: 256,
            zoomOffset: 0,
            tms: false,
            bounds: null,
            noWrap: false,
            updateInterval: 0,
            zIndex: 1,
            opacity: 1.0,
          }),
          // 详细版 - 显示更多地理信息 (zoom 7-9) - 使用OSM中文优化版本
          detailed: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?language=zh&locale=zh&style=osm', {
            maxZoom: 9,
            minZoom: 7, // 从zoom 7开始显示详细信息
            subdomains: 'abc',
            attribution: '© OpenStreetMap contributors',
            updateWhenIdle: true,
            updateWhenZooming: true,
            keepBuffer: 8,
            maxNativeZoom: 9,
            tileSize: 256,
            zoomOffset: 0,
            tms: false,
            bounds: null,
            noWrap: false,
            updateInterval: 0,
            zIndex: 2, // 更高层级
            opacity: 1.0,
          })
        }
      };

      // 存储到全局，供切换功能使用
      window.tileLayers = tileLayers;
      
      // 智能地图源切换函数 - 默认OSM，兜底高德
      const switchTileLayer = (zoom, center) => {
        // 优先使用OSM，如果失败则切换到高德
        let mapSource = 'osm';
        
        // 移除当前所有图层
        Object.values(tileLayers).forEach(source => {
          Object.values(source).forEach(layer => {
            if (map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          });
        });
        
        // 添加基础图层
        tileLayers[mapSource].base.addTo(map);
        
        // 如果缩放级别足够高，添加详细图层
        if (zoom >= 7) {
          tileLayers[mapSource].detailed.addTo(map);
        }
        
        // 根据地理位置优化地名显示语言
        if (mapSource === 'osm') {
          const region = getRegionForLocation(center.lat, center.lng);
          const language = getOptimalLanguage(region);
          console.log(`使用OSM地图源: ${region}, 语言: ${language}`);
        }
        
        setCurrentTileLayer(mapSource);
        setMapInfoLevel(''); // 所有模式都不显示文字
        console.log(`切换到地图源: ${mapSource}, 缩放: ${zoom}`);
      };

      // 获取地理位置对应的区域
      const getRegionForLocation = (lat, lng) => {
        if (lat >= 20 && lat <= 50 && lng >= 100 && lng <= 150) return 'EastAsia';
        if (lat >= 30 && lat <= 60 && lng >= -10 && lng <= 40) return 'Europe';
        if (lat >= 25 && lat <= 50 && lng >= -130 && lng <= -60) return 'NorthAmerica';
        if (lat >= -35 && lat <= 5 && lng >= -80 && lng <= -35) return 'SouthAmerica';
        if (lat >= -45 && lat <= -10 && lng >= 110 && lng <= 180) return 'Oceania';
        if (lat >= -35 && lat <= 35 && lng >= -20 && lng <= 60) return 'Africa';
        return 'Global';
      };

      // 根据区域选择最佳显示语言
      const getOptimalLanguage = (region) => {
        const languageMap = {
          'EastAsia': 'zh',      // 东亚：中文优先
          'Europe': 'zh,en',     // 欧洲：中文+英文
          'NorthAmerica': 'zh,en', // 北美：中文+英文
          'SouthAmerica': 'zh,es', // 南美：中文+西班牙文
          'Oceania': 'zh,en',   // 大洋洲：中文+英文
          'Africa': 'zh,en',    // 非洲：中文+英文
          'Global': 'zh'        // 全球：中文优先
        };
        return languageMap[region] || 'zh';
      };

      // 默认加载OSM地图基础版
      tileLayers.osm.base.addTo(map);
      setCurrentTileLayer('osm');
      
      // 监听OSM加载失败，自动切换到高德地图
      tileLayers.osm.base.on('tileerror', () => {
        console.log('OSM地图加载失败，自动切换到高德地图');
        map.removeLayer(tileLayers.osm.base);
        if (map.hasLayer(tileLayers.osm.detailed)) {
          map.removeLayer(tileLayers.osm.detailed);
        }
        tileLayers.amap.base.addTo(map);
        setCurrentTileLayer('amap');
      });

      // 监听缩放变化，动态切换地图源和图层
      map.on('zoomend', () => {
        const zoom = map.getZoom();
        const center = map.getCenter();
        
        // 动态切换地图源
        switchTileLayer(zoom, center);
        
        // 更新缩放状态
        setCurrentZoom(zoom);
        
        // 应用缩放限制
        const maxZoomForLocation = getMaxZoomForLocation(center.lat, center.lng);
        if (zoom > maxZoomForLocation) {
          map.setZoom(maxZoomForLocation, { animate: false });
        } else if (zoom < 3) {
          map.setZoom(3, { animate: false });
        }
      });

      // 监听地图移动，动态调整缩放限制
      map.on('moveend', () => {
        const center = map.getCenter();
        const maxZoomForLocation = getMaxZoomForLocation(center.lat, center.lng);
        map.setMaxZoom(maxZoomForLocation);
        console.log(`位置变化，更新最大缩放为: ${maxZoomForLocation}`);
      });

      // 监听缩放变化，更新状态
      map.on('zoom', () => {
        const zoom = map.getZoom();
        setCurrentZoom(zoom);
      });

      // 存储地图实例
      mapInstanceRef.current = map;

      // 地图加载完成后的处理
      map.whenReady(() => {
        console.log('地图加载完成');
      setLoading(false);
        setCurrentZoom(3);
      });

      // 清理函数
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  // 添加用户位置标记
  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      // 移除旧的用户标记
      if (userMarkerRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
      }

      // 创建用户位置标记
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="user-location-dot">
                 <div class="user-location-pulse"></div>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        title: '我的位置',
        zIndexOffset: 2000,
      });

      userMarker.addTo(mapInstanceRef.current);
      userMarkerRef.current = userMarker;
    }
  }, [userLocation]);

  // 添加照片标记
  useEffect(() => {
    if (mapInstanceRef.current && photos.length > 0) {
      console.log('开始添加照片标记，照片数量:', photos.length);
      
      // 清除现有照片标记
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // 添加新标记
      photos.forEach((photo, index) => {
        if (photo.latitude && photo.longitude) {
          console.log(`添加标记 ${index + 1}: ${photo.title} at [${photo.latitude}, ${photo.longitude}]`);
          
          const marker = L.marker([photo.latitude, photo.longitude], {
            title: photo.title || photo.location_name || '未命名照片',
            riseOnHover: true,
            riseOffset: 250,
            keyboard: false,
            zIndexOffset: 1000,
          });

          // 自定义标记样式 - 简单点样式
          const icon = L.divIcon({
            className: `map-photo-marker ${selectedPhoto?.id === photo.id ? 'selected' : ''}`,
            html: `<div class="photo-dot"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });
          
          // 应用自定义图标
          marker.setIcon(icon);
          marker.addTo(mapInstanceRef.current);
          
          // 点击事件
          marker.on('click', () => handlePhotoClick(photo));
          
          console.log(`标记 ${index + 1} 添加成功`);
        } else {
          console.warn(`照片 ${index + 1} 缺少坐标信息:`, photo);
        }
      });
      
      console.log('所有照片标记添加完成');
    } else {
      console.log('无法添加照片标记:', {
        hasMap: !!mapInstanceRef.current,
        photosCount: photos.length
      });
    }
  }, [photos, selectedPhoto]);

  // 初始化时获取数据并自动定位
  useEffect(() => {
    fetchMapPhotos();
    
    // 自动获取用户位置并设置地图中心
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          
          // 如果地图已加载，自动移动到用户位置并设置3x缩放
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 3, {
              animate: true,
              duration: 1.5
            });
            setCurrentZoom(3);
          }
        },
        (error) => {
          console.log('自动定位失败，使用默认位置:', error.message);
          // 定位失败时使用默认位置（深圳）
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([22.5, 113.9], 3, {
              animate: true,
              duration: 1.5
            });
            setCurrentZoom(3);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  }, []);

  return (
    <div className={`map-page ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* 右上角统一布局 - Google Maps风格 */}
      <div className="top-right-controls">
        {/* 统一控件容器 */}
        <div className="map-control-container">
          {/* 1. 全屏切换按钮 */}
          <button 
            onClick={toggleFullscreen}
            className="control-btn fullscreen-btn"
            title={isFullscreen ? '退出全屏' : '进入全屏'}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="icon" />
            ) : (
              <ArrowsPointingOutIcon className="icon" />
            )}
          </button>

          {/* 2. 我的位置按钮 */}
          <button 
            onClick={getUserLocation}
            className="control-btn location-btn"
            title="定位到我的位置"
            disabled={locationLoading}
          >
            <MapPinIcon className="icon" />
            {locationLoading && <div className="location-spinner"></div>}
          </button>

          {/* 3. 放大按钮 */}
          <button className="zoom-btn zoom-in" onClick={handleZoomIn}>+</button>

                     {/* 4. 缩放等级显示 */}
           <div className="zoom-display">
             <span className="zoom-value">{getZoomLevelDisplay(currentZoom)}x</span>
             <div className="map-info-level">{mapInfoLevel}</div>
           </div>

          {/* 5. 缩小按钮 */}
          <button className="zoom-btn zoom-out" onClick={handleZoomOut}>−</button>
        </div>
            </div>

      {/* 地图容器 */}
      <div className="map-container">
        <div className="leaflet-map" ref={mapRef}></div>
        
        {/* 加载状态 */}
        {loading && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>加载地图中...</p>
          </div>
        )}
        </div>

             {/* 照片详情模态框 - 参考胶卷模式的全屏预览 */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 backdrop-blur-md flex items-center justify-center z-[9999] overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className={`absolute top-6 right-6 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-lg ${
                showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 照片显示区域 */}
            <div className="w-full h-full flex items-center justify-center">
              <div className={`transition-all duration-500 ease-in-out ${
                showUI ? 'transform -translate-y-12' : 'transform translate-y-0'
              }`}>
                {selectedPhoto.original ? (
                  <LazyImage
                    src={`${API_CONFIG.BASE_URL}${selectedPhoto.original}`}
                    alt={selectedPhoto.title || '照片'}
                    className="h-[80vh] w-auto object-contain rounded-2xl shadow-2xl cursor-pointer"
                    onClick={() => setShowUI(!showUI)}
                    lazyOptions={{
                      rootMargin: '50px', // 地图照片预览较小的预加载距离
                      threshold: 0.1
                    }}
                    onError={(e) => {
                      console.error('照片加载失败:', selectedPhoto.original, e);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={() => {
                      if (process.env.NODE_ENV === 'development') {
                        console.log('照片加载成功:', selectedPhoto.original);
                      }
                    }}
                    crossOrigin="anonymous"
                  />
                ) : null}
                <div
                  className="items-center justify-center h-[80vh] w-[60vw] bg-gray-200 rounded-2xl shadow-2xl cursor-pointer text-gray-400 text-6xl"
                  style={{ display: selectedPhoto.filename ? 'none' : 'flex' }}
                  onClick={() => setShowUI(!showUI)}
                >
                  📷
                </div>
              </div>
            </div>

            {/* 照片信息 - 底部浮动显示，参考胶卷模式 */}
            <div className={`absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 py-8 px-4 transition-all duration-500 ease-in-out ${
              showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
            }`}>
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-4 text-sm">
                  {/* 主要信息居中 */}
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span>{selectedPhoto.location_name || '未知位置'}</span>
                    <span>•</span>
                    <span>{selectedPhoto.taken_date || '未知日期'}</span>
                    {selectedPhoto.camera_name && (
                      <>
                        <span>•</span>
                        <span>{selectedPhoto.camera_name}</span>
                      </>
                    )}
                    {selectedPhoto.film_roll_name && (
                      <>
                        <span>•</span>
                        <span>{selectedPhoto.film_roll_name}</span>
                      </>
                    )}
                  </div>
                  
                  {/* 评分显示 */}
                  {selectedPhoto.rating > 0 && (
                    <div className="flex space-x-1">
                      {[...Array(selectedPhoto.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-lg">★</span>
                      ))}
                    </div>
                  )}
                  
                  {/* 分享按钮 */}
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/map?photo=${selectedPhoto.id}`;
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
        </div>
      )}
    </div>
  );
};

export default Map;
