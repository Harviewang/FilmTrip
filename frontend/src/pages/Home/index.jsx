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
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full h-full flex flex-col">
        {/* 欢迎区域 - 全宽度自适应 */}
        <div className="w-full flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              胶片摄影的艺术世界
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
              用胶片记录时光，让每一帧都成为永恒。
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/gallery"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                开始浏览作品
              </Link>
              <Link
                to="/timeline"
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                时间轴浏览
              </Link>
            </div>
          </div>
        </div>

        {/* 精选作品 - 响应式网格 */}
        <div className="w-full flex-shrink-0 px-4 sm:px-6 lg:px-8 py-12 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">
              精选作品
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {featuredPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {photo.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {photo.description}
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p className="flex items-center">
                        <span className="w-16 text-gray-400">相机:</span>
                        <span>{photo.camera}</span>
                      </p>
                      <p className="flex items-center">
                        <span className="w-16 text-gray-400">胶卷:</span>
                        <span>{photo.film}</span>
                      </p>
                      <div className="flex items-center">
                        <span className="w-16 text-gray-400">评分:</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < photo.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
