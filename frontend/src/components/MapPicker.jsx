import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../pages/Map/Map.css';

const MapPicker = forwardRef(({ onLocationSelect, initialLatitude, initialLongitude, readOnly = false }, ref) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // 如果容器不存在，不初始化地图
    if (!mapContainer.current) {
      console.log('MapContainer ref not ready');
      return;
    }

    // 初始化地图
    if (!map.current) {
      const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
      
      if (!maptilerKey) {
        console.error('VITE_MAPTILER_KEY is not defined');
        setError('地图API密钥未配置');
        return;
      }

      // 改用OSM瓦片避免MapTiler额度消耗
      const styleUrl = {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap'
          }
        },
        layers: [{
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles'
        }]
      };

      console.log('Initializing MapPicker with style:', styleUrl);

      try {
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: styleUrl,
          center: initialLongitude && initialLatitude 
            ? [initialLongitude, initialLatitude] 
            : [113.9, 22.5], // 默认深圳
          zoom: initialLongitude && initialLatitude ? 5 : 5,
          minZoom: 1,
          maxZoom: 15,
        });

        // 监听错误事件
        map.current.on('error', (e) => {
          console.error('Map error:', e);
          setError('地图加载失败');
        });

        // 等待地图加载
        map.current.once('load', () => {
          console.log('MapPicker loaded successfully');
          
          // 添加导航控件（禁用旋转）
          const nav = new maplibregl.NavigationControl({
            showCompass: false,  // 隐藏指南针（旋转控制）
            visualizePitch: false  // 隐藏俯仰控制
          });
          map.current.addControl(nav, 'top-right');
          
          // 添加定位控件（有定位图标）
          map.current.addControl(new maplibregl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: false,
            showUserHeading: false
          }), 'top-right');
          
          // 如果有初始坐标，添加marker
          if (initialLongitude && initialLatitude) {
            const markerEl = document.createElement('div');
            markerEl.className = 'map-picker-marker';
            markerEl.innerHTML = '<div class="picker-dot"></div>';
            marker.current = new maplibregl.Marker({
              element: markerEl,
              draggable: !readOnly  // 只读模式下不可拖动
            })
              .setLngLat([initialLongitude, initialLatitude])
              .addTo(map.current);

            if (!readOnly) {
              marker.current.on('dragend', () => {
                const lngLat = marker.current.getLngLat();
                setSelectedLocation({ latitude: lngLat.lat, longitude: lngLat.lng });
              });
            }
          }

          // 只有在非只读模式才添加点击事件
          if (!readOnly) {
            const handleMapClick = async (e) => {
              const { lng, lat } = e.lngLat;
              // 只更新marker位置，不自动解析
              if (marker.current) {
                marker.current.setLngLat([lng, lat]);
              } else {
                const markerEl = document.createElement('div');
                markerEl.className = 'map-picker-marker';
                markerEl.innerHTML = '<div class="picker-dot"></div>';
                marker.current = new maplibregl.Marker({
                  element: markerEl,
                  draggable: true
                })
                  .setLngLat([lng, lat])
                  .addTo(map.current);
                
                marker.current.on('dragend', () => {
                  const lngLat = marker.current.getLngLat();
                  setSelectedLocation({ latitude: lngLat.lat, longitude: lngLat.lng });
                });
              }
              
              setSelectedLocation({ latitude: lat, longitude: lng });
            };
            
            map.current.on('click', handleMapClick);
          }
        });
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError('地图初始化失败: ' + err.message);
      }
    }

    return () => {
      // 清理函数
      if (map.current) {
        try {
          // 移除事件监听器
          if (marker.current) {
            marker.current.remove();
            marker.current = null;
          }
          // 移除地图
          map.current.remove();
          map.current = null;
        } catch (err) {
          console.error('Error cleaning up map:', err);
        }
      }
    };
    }, [initialLatitude, initialLongitude, readOnly]);

  const handleLocationChange = useCallback(async (lat, lng) => {
    setIsLoading(true);
    setSelectedLocation({ latitude: lat, longitude: lng });

    // 更新或创建marker
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else if (map.current) {
      const markerEl = document.createElement('div');
      markerEl.className = 'map-picker-marker';
      markerEl.innerHTML = '<div class="picker-dot"></div>';
      marker.current = new maplibregl.Marker({
        element: markerEl,
        draggable: true
      })
        .setLngLat([lng, lat])
        .addTo(map.current);

      marker.current.on('dragend', () => {
        const lngLat = marker.current.getLngLat();
        handleLocationChange(lngLat.lat, lngLat.lng);
      });
    }

    // 调用geocode API解析地址
    try {
      const response = await fetch('/api/geocode/reverse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const addressData = {
          latitude: lat,
          longitude: lng,
          country: result.data.country || '',
          province: result.data.province || '',
          city: result.data.city || '',
          district: result.data.district || '',
          township: result.data.township || '',
        };
        
        // 调用父组件回调
        onLocationSelect(addressData);
      } else {
        console.error('地址解析失败:', result.message);
        // 即使解析失败，也传递坐标
        onLocationSelect({ latitude: lat, longitude: lng });
      }
    } catch (error) {
      console.error('调用geocode API失败:', error);
      onLocationSelect({ latitude: lat, longitude: lng });
    }

    setIsLoading(false);
  }, [onLocationSelect]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ latitude, longitude });
          
          // 更新marker
          if (marker.current) {
            marker.current.setLngLat([longitude, latitude]);
          } else if (map.current) {
            const markerEl = document.createElement('div');
            markerEl.className = 'map-picker-marker';
            markerEl.innerHTML = '<div class="picker-dot"></div>';
            marker.current = new maplibregl.Marker({
              element: markerEl,
              draggable: true
            })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
            
            marker.current.on('dragend', () => {
              const lngLat = marker.current.getLngLat();
              setSelectedLocation({ latitude: lngLat.lat, longitude: lngLat.lng });
            });
          }
          
          // 自动飞到用户位置
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 5
            });
          }
        },
        (error) => {
          console.error('获取当前位置失败:', error);
          alert('无法获取当前位置，请手动选择');
        }
      );
    }
  };

  const handleParseLocation = useCallback(async () => {
    if (selectedLocation) {
      await handleLocationChange(selectedLocation.latitude, selectedLocation.longitude);
    } else {
      alert('请先在地图上选择一个位置');
    }
  }, [selectedLocation, handleLocationChange]);

  // 搜索地点
  const handleSearch = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!searchQuery.trim()) {
      alert('请输入搜索关键词');
      return;
    }

    if (!map.current) {
      alert('地图尚未初始化');
      return;
    }

    setIsSearching(true);
    setIsLoading(true);

    try {
      const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${maptilerKey}&language=zh,en`
      );
      
      if (!response.ok) {
        throw new Error('搜索失败');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // 获取第一个结果
        const feature = data.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        
        // 跳转到搜索结果
        map.current.flyTo({
          center: [lng, lat],
          zoom: 15,
          duration: 1000
        });
        
        // 更新marker位置
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        } else {
          const markerEl = document.createElement('div');
          markerEl.className = 'map-picker-marker';
          markerEl.innerHTML = '<div class="picker-dot"></div>';
          marker.current = new maplibregl.Marker({
            element: markerEl,
            draggable: true
          })
            .setLngLat([lng, lat])
            .addTo(map.current);
        }
        
        // 更新选中位置
        setSelectedLocation({ latitude: lat, longitude: lng });
      } else {
        alert('未找到相关地点');
      }
    } catch (error) {
      console.error('搜索失败:', error);
      alert('搜索失败，请重试');
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, [searchQuery]);

  // 暴露解析函数给父组件
  useImperativeHandle(ref, () => ({
    parseLocation: handleParseLocation
  }));

  return (
    <div className="w-full">
      {/* 搜索框 - 只读模式下隐藏 */}
      {!readOnly && (
      <div className="mb-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            placeholder="搜索地点（支持中文/英文）"
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSearching}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
          >
            {isSearching ? '搜索中...' : '搜索'}
          </button>
        </div>
      </div>
      )}
      
      <div className="relative">
        <div
          ref={mapContainer}
          style={{ width: '100%', height: '300px' }}
          className="rounded-lg border border-gray-300"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-sm text-gray-600">解析地址中...</div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-600">
          {error}
        </div>
      )}
      
      {selectedLocation && (
        <div className="mt-2 text-xs text-gray-500">
          已选择坐标：{selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
});

export default MapPicker;

