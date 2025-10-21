import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, MapPinIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API_CONFIG from '../../config/api.js';
import LazyImage from '../../components/LazyImage';
import PhotoPreview from '../../components/PhotoPreview';
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
  const [photoIndex, setPhotoIndex] = useState(0); // 当前照片索引
  const isAdmin = (() => {
    try { const u = JSON.parse(localStorage.getItem('user')||'{}'); return u && u.username === 'admin'; } catch { return false; }
  })();
  // 将当前底图状态提前声明，供后续 useEffect 使用
  const [currentTileLayer, setCurrentTileLayer] = useState('');
  const currentTileLayerRef = useRef('');
  const updateCurrentTileLayer = useCallback((source) => {
    setCurrentTileLayer(source);
    currentTileLayerRef.current = source;
  }, []);
  const mapTilerStyles = ['backdrop','streets-v2','basic-v2','outdoor','dataviz','bright-v2'];
  const [mapTilerStyle, setMapTilerStyle] = useState(
    localStorage.getItem('maptiler_style') || import.meta.env.VITE_MAPTILER_STYLE || 'backdrop'
  );

  // 当样式变化时，如果当前底图为 maptiler，动态重建底图
  useEffect(() => {
    try {
      localStorage.setItem('maptiler_style', mapTilerStyle);
      if (mapInstanceRef.current && currentTileLayer === 'maptiler') {
        // 触发重建
        const map = mapInstanceRef.current;
        // 移除现有 maptiler 层
        const layers = [];
        map.eachLayer(l => layers.push(l));
        layers.forEach(l => {
          if (l && l._url && String(l._url).includes('api.maptiler.com')) {
            map.removeLayer(l);
          }
        });
        // 重建并添加
        const key = import.meta.env.VITE_MAPTILER_KEY;
        if (key) {
          const newLayer = L.tileLayer(`https://api.maptiler.com/maps/${mapTilerStyle}/256/{z}/{x}/{y}.png?key=${key}`, {
            maxZoom: 22,
            minZoom: 2,
            attribution: '&copy; OpenMapTiles &copy; OpenStreetMap contributors &copy; MapTiler',
          });
          newLayer.addTo(map);
        }
      }
    } catch {}
  }, [mapTilerStyle, currentTileLayer]);

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
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  // 获取地图照片数据
  const fetchMapPhotos = async () => {
    try {
      setLoading(true);
      console.log('开始获取地图照片数据...');
      
      const response = await fetch('/api/photos');
      console.log('API响应状态:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API响应数据:', result);
        
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
        
        // 数据映射：将后端字段映射到前端期望的字段
        const mappedPhotos = photoArray.map((photo, index) => ({
          id: photo.id || `photo-${index}`,
          title: photo.title || photo.filename || '无标题',
          description: photo.description || '',
          thumbnail: photo.thumbnail || photo.original,
          original: photo.original,
          camera: photo.camera_name || photo.camera_model || photo.camera_brand || '未知相机',
          film: photo.film_roll_name || photo.film_roll_number || '无',
          date: photo.taken_date || photo.uploaded_at || '未知日期',
          rating: photo.rating || 0,
          latitude: photo.latitude,
          longitude: photo.longitude,
          location_name: photo.location_name,
          // 保留原始数据用于调试
          _raw: photo
        }));
        
        console.log('映射后的照片数据:', mappedPhotos);
        
        // 设置照片数据
        setPhotos(mappedPhotos);
        
        console.log(`成功获取 ${mappedPhotos.length} 张照片`);
      } else {
        console.error('获取地图照片失败:', response.status);
        throw new Error(`获取照片失败: ${response.status}`);
      }
    } catch (error) {
      console.error('获取地图照片出错:', error);
      // 显示错误信息给用户
      alert(`获取照片数据失败: ${error.message}`);
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
    // 找到当前照片在数组中的索引，用于导航
    const photoIndex = photos.findIndex(p => p.id === photo.id);
    setPhotoIndex(photoIndex);
  };

  // 处理照片切换
  const handlePhotoChange = (newPhoto, newIndex) => {
    setSelectedPhoto(newPhoto);
    setPhotoIndex(newIndex);
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

  // 缩放等级映射函数：扩展支持MapTiler的22级完整范围
  const getZoomLevelDisplay = (zoom) => {
    const zoomMap = {
      3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: 12,
      15: 13, 16: 14, 17: 15, 18: 16, 19: 17, 20: 18, 21: 19, 22: 20
    };
    return zoomMap[zoom] || zoom;
  };

  // 安全缩放函数 - 使用地图配置的最大缩放级别
  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    
    const currentZoom = mapInstanceRef.current.getZoom();
    
    if (currentZoom < 22) { // MapTiler支持的最大缩放级别
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
  const [mapInfoLevel, setMapInfoLevel] = useState('基础');
  const tilePerfRef = useRef({ samples: [], avg: 0, starts: new globalThis.Map(), switchLocked: false });

  // 初始化地图
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // 创建地图实例 - 保留拖拽和交互优化
      const map = L.map(mapRef.current, {
        center: [22.5, 113.9],       // 深圳南山区坐标
        zoom: 3,                      // 默认缩放3.0，映射显示为1
        maxZoom: 22,                  // 放开缩放限制
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
      const buildMapTilerLayer = (style) => {
        const key = import.meta.env.VITE_MAPTILER_KEY;
        if (!key) return null;
        return L.tileLayer(`https://api.maptiler.com/maps/${style}/256/{z}/{x}/{y}.png?key=${key}`, {
          maxZoom: 22,
          minZoom: 2,
          attribution: '&copy; OpenMapTiles &copy; OpenStreetMap contributors &copy; MapTiler',
          updateWhenIdle: true,
          updateWhenZooming: true,
          keepBuffer: 8,
          tileSize: 256,
          maxNativeZoom: 22,
          opacity: 1.0,
          zIndex: 1,
          crossOrigin: true,
        });
      };

      const tileLayers = {
        // MapTiler: 稳定CDN，需密钥，支持高缩放，选择极简黑白线框(Toner)
        maptiler: {
          base: buildMapTilerLayer(mapTilerStyle)
        },
        // Carto Positron: 极简线框风格（无标签），高可用
        carto: {
          base: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
            minZoom: 2,
            subdomains: 'abcd',
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            updateWhenIdle: true,
            updateWhenZooming: true,
            keepBuffer: 8,
            tileSize: 256,
            maxNativeZoom: 18,
            opacity: 1.0,
            zIndex: 1,
            crossOrigin: true,
          })
        },
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
            maxZoom: 18,
            minZoom: 3,
            subdomains: 'abc',
            attribution: '© OpenStreetMap contributors',
            updateWhenIdle: true,
            updateWhenZooming: true,
            keepBuffer: 8,
            maxNativeZoom: 19,
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
            maxZoom: 18,
            minZoom: 7, // 从zoom 7开始显示详细信息
            subdomains: 'abc',
            attribution: '© OpenStreetMap contributors',
            updateWhenIdle: true,
            updateWhenZooming: true,
            keepBuffer: 8,
            maxNativeZoom: 19,
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
      
      // 统一切换函数，便于性能策略调用
      const switchTo = (source) => {
        Object.values(tileLayers).forEach(src => {
          Object.values(src).forEach(layer => {
            if (layer && map.hasLayer(layer)) map.removeLayer(layer);
          });
        });
        let base = tileLayers[source]?.base;
        if (source === 'maptiler') {
          base = buildMapTilerLayer(mapTilerStyle);
          tileLayers.maptiler.base = base;
        }
        if (base) {
          base.addTo(map);
          updateCurrentTileLayer(source);
          // 重新绑定性能监控
          if (source === 'carto' || source === 'maptiler') attachPerfMonitor(base);
        }
        if (tileLayers[source]?.detailed && map.getZoom() >= 7) {
          tileLayers[source].detailed.addTo(map);
        }
      };

      // 智能地图源切换函数 - 默认 MapTiler(有key) > OSM > AMap > Carto
      const switchTileLayer = (zoom, center) => {
        // 优先顺序：MapTiler(22) > OSM(18) > AMap(12) > Carto(18)
        let mapSource = 'osm'; // 默认OSM
        if (tileLayers.maptiler.base) {
          mapSource = 'maptiler'; // 有MapTiler优先使用
        }
        
        // 移除当前所有图层
        Object.values(tileLayers).forEach(source => {
          Object.values(source).forEach(layer => {
            if (layer && map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          });
        });
        
        let base = tileLayers[mapSource]?.base;
        if (mapSource === 'maptiler') {
          base = buildMapTilerLayer(mapTilerStyle);
          tileLayers.maptiler.base = base;
        }
        base?.addTo(map);
        // 绑定性能监控
        if (mapSource === 'carto' || mapSource === 'maptiler') attachPerfMonitor(base);
        
        // 如果缩放级别足够高，添加详细图层
        if (tileLayers[mapSource]?.detailed && zoom >= 7) {
          tileLayers[mapSource].detailed.addTo(map);
        }
        
        // 根据地理位置优化地名显示语言
        if (mapSource === 'osm') {
          const region = getRegionForLocation(center.lat, center.lng);
          const language = getOptimalLanguage(region);
        }
        
        updateCurrentTileLayer(mapSource);
        setMapInfoLevel(''); // 极简风格，不显示文字
      };

      // 性能监控：测量瓦片加载时延，过慢则自适应切换
      const attachPerfMonitor = (layer) => {
        const perf = tilePerfRef.current;
        perf.samples = [];
        perf.avg = 0;
        perf.starts = new globalThis.Map();
        const onStart = (e) => {
          const key = e.tile?.src || Math.random();
          perf.starts.set(key, performance.now());
        };
        const onLoad = (e) => {
          const key = e.tile?.src;
          const t0 = perf.starts.get(key);
          if (t0) {
            const dt = performance.now() - t0;
            perf.starts.delete(key);
            perf.samples.push(dt);
            if (perf.samples.length > 20) perf.samples.shift();
            const sum = perf.samples.reduce((a,b)=>a+b,0);
            perf.avg = Math.round(sum / perf.samples.length);
            // 禁用自动切换：仅记录性能，不触发切换
            // if (!perf.switchLocked && perf.samples.length >= 10 && perf.avg > 600) {
            //   // 自动切换逻辑已禁用
            // }
          }
        };
        const onError = () => {
          // 禁用自动切换：仅记录错误，不触发切换
          // if (!perf.switchLocked) {
          //   perf.switchLocked = true;
          //   const center = map.getCenter();
          //   const inEastAsia = center.lat >= 18 && center.lat <= 54 && center.lng >= 73 && center.lng <= 135;
          //   // 自动切换逻辑已禁用
          //   setTimeout(()=>{ perf.switchLocked = false; }, 10000);
          // }
        };
        layer.on('tileloadstart', onStart);
        layer.on('tileload', onLoad);
        layer.on('tileerror', onError);
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

      // 完全移除地图加载失败的监听器，避免任何自动切换
      // 所有地图源的tileerror事件都已被移除

      // 默认加载 MapTiler(若有key) > OSM > AMap > Carto
      let defaultSource = 'osm'; // 默认OSM
      if (tileLayers.maptiler.base) {
        defaultSource = 'maptiler'; // 有MapTiler优先使用
      }

      if (defaultSource === 'maptiler') {
        const base = buildMapTilerLayer(mapTilerStyle);
        tileLayers.maptiler.base = base;
        base.addTo(map);
        updateCurrentTileLayer('maptiler');
        attachPerfMonitor(base);
      } else {
        tileLayers.osm.base.addTo(map);
        updateCurrentTileLayer('osm');
      }
      
      // 禁用地图加载失败时的自动切换
      // 保持当前地图源，不进行自动回退

      // 监听缩放变化，动态切换地图源和图层
      map.on('zoomend', () => {
        const zoom = map.getZoom();

        // 清理所有非当前地图源的详细图层，确保不会被其他图层的maxZoom限制
        const currentSource = currentTileLayerRef.current;
        Object.keys(tileLayers).forEach(sourceKey => {
          if (sourceKey !== currentSource && tileLayers[sourceKey]?.detailed) {
            const layer = tileLayers[sourceKey].detailed;
            if (layer && map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          }
        });

        // 只管理当前地图源的详细图层
        const detailLayer = currentSource ? tileLayers[currentSource]?.detailed : null;

        if (detailLayer && zoom >= 7) {
          if (!map.hasLayer(detailLayer)) {
            detailLayer.addTo(map);
          }
        } else {
          // 缩放级别较低时移除详细图层
          if (detailLayer && map.hasLayer(detailLayer)) {
            map.removeLayer(detailLayer);
          }
        }

        // 更新缩放状态
        setCurrentZoom(zoom);
      });

      // 监听地图移动，动态调整缩放限制
      map.on('moveend', () => {
        // 不再动态限制缩放
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
      // 清除现有照片标记
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // 添加新标记
      photos.forEach((photo, index) => {
        if (photo.latitude && photo.longitude) {
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
        }
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
          {/* 样式切换（仅在使用 MapTiler 且有 key 时显示） */}
          {import.meta.env.VITE_MAPTILER_KEY && (
            <button
              onClick={() => {
                const idx = mapTilerStyles.indexOf(mapTilerStyle);
                const next = mapTilerStyles[(idx + 1) % mapTilerStyles.length];
                setMapTilerStyle(next);
              }}
              className="control-btn"
              title={`切换底图样式（当前：${mapTilerStyle}）`}
              style={{fontSize:'12px'}}
            >
              样式：{mapTilerStyle}
            </button>
          )}
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

      {/* 照片预览 */}
      <PhotoPreview
        photo={selectedPhoto}
        photos={photos}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        currentPath="/map"
        showNavigation={true}
        onPhotoChange={handlePhotoChange}
      />
    </div>
  );
};

export default Map;
