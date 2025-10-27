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
  
  // 地图样式状态（支持切换）
  const [mapStyle, setMapStyle] = useState('maptiler-vector'); // maptiler-vector | maptiler-raster | osm-raster

  // 缩放等级映射函数：3-22 映射到显示 1-20
  const getZoomLevelDisplay = (zoom) => {
    const zoomMap = {
      3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: 12,
      15: 13, 16: 14, 17: 15, 18: 16, 19: 17, 20: 18, 21: 19, 22: 20
    };
    return zoomMap[zoom] || zoom;
  };
  
  // 获取地图样式URL
  const getMapStyleUrl = (style) => {
    const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
    
    switch (style) {
      case 'maptiler-vector':
        // MapTiler 矢量瓦片（首选）
        return `https://api.maptiler.com/maps/dataviz/style.json?key=${maptilerKey}`;
      case 'maptiler-raster':
        // MapTiler PNG 栅格瓦片（备选）
        return `https://api.maptiler.com/maps/basic-v2/style.json?key=${maptilerKey}`;
      case 'osm-raster':
        // OSM 栅格瓦片（最终备选）
        return {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
              maxzoom: 19
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
          camera: photo.camera_name || photo.camera_model || '未知相机',
          film: photo.film_roll_name || photo.film_roll_number || '无',
          date: photo.taken_date || photo.uploaded_at || '未知日期',
          latitude: photo.latitude,
          longitude: photo.longitude,
          location_name: photo.location_name,
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
          mapInstanceRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 12
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
      if (currentZoom < 22) {
        mapInstanceRef.current.zoomIn();
      }
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom > 3) {
        mapInstanceRef.current.zoomOut();
      }
    }
  };

  // 初始化地图
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      console.log('Initializing MapLibre map...');
      
      // 设置初始loading为false，让地图先显示
      setLoading(false);
      
      const styleUrl = getMapStyleUrl(mapStyle);
      
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: styleUrl,
        center: [113.9, 22.5],
        zoom: 3,
        minZoom: 3,
        maxZoom: 22,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      map.on('load', () => {
        console.log('Map loaded successfully');
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
      });

      map.on('zoom', () => {
        if (mapInstanceRef.current) {
          setCurrentZoom(mapInstanceRef.current.getZoom());
        }
      });

      mapInstanceRef.current = map;

      // 立即获取照片数据
      fetchMapPhotos();

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

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
        el.className = 'photo-marker';
        if (selectedPhoto?.id === photo.id) {
          el.classList.add('selected');
        }

        const marker = new maplibregl.Marker(el)
          .setLngLat([photo.longitude, photo.latitude])
          .addTo(mapInstanceRef.current);

        el.addEventListener('click', () => {
          setSelectedPhoto(photo);
          mapInstanceRef.current.flyTo({
            center: [photo.longitude, photo.latitude],
            zoom: 14
          });
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

