import React, { useState, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapPicker = ({ onLocationSelect, initialLatitude, initialLongitude }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 初始化地图
    if (!map.current) {
      const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
      
      if (!maptilerKey) {
        console.error('VITE_MAPTILER_KEY is not defined');
        return;
      }

      const styleUrl = `https://api.maptiler.com/maps/dataviz/style.json?key=${maptilerKey}`;

      console.log('Initializing MapPicker with style:', styleUrl);

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: initialLongitude && initialLatitude 
          ? [initialLongitude, initialLatitude] 
          : [113.9, 22.5], // 默认深圳
        zoom: initialLongitude && initialLatitude ? 12 : 10,
        minZoom: 1,
        maxZoom: 15,
      });

      // 监听错误事件
      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      // 等待地图加载
      map.current.once('load', () => {
        console.log('MapPicker loaded successfully');
        // 如果有初始坐标，添加marker
        if (initialLongitude && initialLatitude) {
          marker.current = new maplibregl.Marker({
            draggable: true,
            color: '#ef4444'
          })
            .setLngLat([initialLongitude, initialLatitude])
            .addTo(map.current);

          marker.current.on('dragend', () => {
            const lngLat = marker.current.getLngLat();
            handleLocationChange(lngLat.lat, lngLat.lng);
          });
        }

        // 添加点击事件
        map.current.on('click', handleMapClick);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [initialLatitude, initialLongitude]);

  const handleMapClick = async (e) => {
    const { lng, lat } = e.lngLat;
    handleLocationChange(lat, lng);
  };

  const handleLocationChange = async (lat, lng) => {
    setIsLoading(true);
    setSelectedLocation({ latitude: lat, longitude: lng });

    // 更新或创建marker
    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new maplibregl.Marker({
        draggable: true,
        color: '#ef4444'
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
          location_name: result.data.formatted_address || '',
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
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationChange(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('获取当前位置失败:', error);
          alert('无法获取当前位置，请手动选择');
        }
      );
    }
  };

  if (!mapContainer) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          地图选点
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            当前位置
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div
          ref={mapContainer}
          style={{ width: '100%', height: '400px' }}
          className="rounded-lg border border-gray-300"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-sm text-gray-600">解析地址中...</div>
          </div>
        )}
      </div>
      
      {selectedLocation && (
        <div className="mt-2 text-xs text-gray-500">
          坐标：{selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default MapPicker;

