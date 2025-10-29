import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, MapPinIcon } from '@heroicons/react/24/outline';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import API_CONFIG from '../../config/api.js';
import LazyImage from '../../components/LazyImage';
import PhotoPreview from '../../components/PhotoPreview';
import './Map.css';

const MapLibre = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(3);
  
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
              maxzoom: 15
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
              maxzoom: 15
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
  
  const [photoIndex, setPhotoIndex] = useState(0);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // 获取地图照片数据
  const fetchMapPhotos = async () => {
    try {
      const response = await fetch('/api/photos');
      
      if (response.ok) {
        const result = await response.json();
        let photoArray = [];
        
        if (result.success && result.data && Array.isArray(result.data)) {
          photoArray = result.data;
        }
        
        const mappedPhotos = photoArray.map((photo, index) => ({
          id: photo.id || `photo-${index}`,
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
          // 保留原始数据用于调试
          _raw: photo
        }));
        
        setPhotos(mappedPhotos);
      }
    } catch (error) {
      console.error('获取地图照片出错:', error);
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
      if (currentZoom < 15) {  // 最大限制到Zoom 15（显示15x）
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
        maxZoom: 15,             // 最大Zoom 15（显示15x）
      });

      // 使用自定义控件，不使用 MapLibre 自带控件
      // map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      map.on('load', () => {
        console.log('Map loaded successfully');
        // 确保地图尺寸正确
        map.resize();
        // 隐藏loading
        setLoading(false);
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        setLoading(false);
      });

      map.on('zoom', () => {
        if (mapInstanceRef.current) {
          setCurrentZoom(mapInstanceRef.current.getZoom());
        }
      });

      mapInstanceRef.current = map;

      // 地图加载完成后获取照片数据
      map.once('load', () => {
        fetchMapPhotos();
      });

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
            if (photo.latitude && photo.longitude) {
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
                .setLngLat([photo.longitude, photo.latitude])
                .addTo(mapInstanceRef.current);
              
              markersRef.current.push(marker);
              
              // 使用marker.getElement()确保获取到正确的元素
              const markerElement = marker.getElement();
              markerElement.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡到地图
                setSelectedPhoto(photo);
              });
            }
          });
        }
      });
    }
  }, [mapStyle]);

  // 添加照片标记
  useEffect(() => {
    if (!mapInstanceRef.current || !photos.length) return;

    // 清除现有标记
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 添加新标记
    photos.forEach(photo => {
      if (photo.latitude && photo.longitude) {
        const el = document.createElement('div');
        el.className = 'map-photo-marker';
        if (selectedPhoto?.id === photo.id) {
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
          .setLngLat([photo.longitude, photo.latitude])
          .addTo(mapInstanceRef.current);

        // 使用marker.getElement()确保获取到正确的元素
        const markerElement = marker.getElement();
        markerElement.addEventListener('click', (e) => {
          e.stopPropagation(); // 阻止事件冒泡到地图
          // 只有当图片路径存在时才打开预览
          if (photo.size2048 || photo.size1024 || photo.original || photo.thumbnail) {
            setSelectedPhoto(photo);
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
        onClose={() => setSelectedPhoto(null)}
        currentPath="/map"
        showNavigation={true}
        onPhotoChange={(newPhoto, newIndex) => {
          setSelectedPhoto(newPhoto);
          setPhotoIndex(newIndex);
        }}
      />
    </div>
  );
};

export default MapLibre;

