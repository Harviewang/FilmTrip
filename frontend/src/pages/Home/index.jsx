import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setFeaturedPhotos([
        {
          id: 1,
          title: '城市夜景',
          description: '胶片摄影下的城市夜景',
          image: '/api/uploads/thumbnails/photo1_1024.jpg',
          camera: 'Leica M6',
          film: 'Kodak Portra 400',
          rating: 5
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
    <div className="space-y-12">
      {/* 欢迎区域 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          胶片摄影的艺术世界
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          用胶片记录时光，让每一帧都成为永恒。
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/gallery"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            开始浏览作品
          </Link>
        </div>
      </div>

      {/* 精选作品 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">精选作品</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPhotos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {photo.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {photo.description}
                </p>
                <div className="text-sm text-gray-500">
                  <p>相机: {photo.camera}</p>
                  <p>胶卷: {photo.film}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
