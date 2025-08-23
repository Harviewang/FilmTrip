import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Map = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPhotos([
        {
          id: 1,
          title: '城市夜景',
          image: '/placeholder-photo.svg',
          location: '上海外滩',
          coordinates: { lat: 31.2337, lng: 121.4907 },
          camera: 'Leica M6',
          film: 'Kodak Portra 400'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">地图视图</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 地图区域 */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">🗺️</div>
              <p>地图组件将在这里显示</p>
              <p className="text-sm">支持照片位置标记和聚合显示</p>
            </div>
          </div>
        </div>

        {/* 照片列表 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">位置照片</h3>
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-start space-x-3">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {photo.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {photo.location}
                  </p>
                  <div className="text-xs text-gray-500">
                    <p>{photo.camera} + {photo.film}</p>
                  </div>
                  <Link
                    to={`/photo/${photo.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Map;
