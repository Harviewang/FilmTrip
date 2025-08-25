import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LazyImage from '../../components/LazyImage';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isScrollingToTop, setIsScrollingToTop] = useState(false);
  const pageSize = 12;

  // 模拟照片数据生成
  const generateMockPhotos = (page, size) => {
    const startId = (page - 1) * size + 1;
    return Array.from({ length: size }, (_, index) => ({
      id: startId + index,
      title: `作品 ${startId + index}`,
      image: `/api/uploads/thumbnails/photo${startId + index}_1024.jpg`,
      camera: ['Leica M6', 'Canon AE-1', 'Nikon FM2', 'Pentax K1000'][index % 4],
      film: ['Kodak Portra 400', 'Fuji Pro 400H', 'Ilford HP5', 'Kodak Gold 200'][index % 4],
      date: `2025-01-${String(15 + (index % 15)).padStart(2, '0')}`,
      rating: Math.floor(Math.random() * 5) + 1
    }));
  };

  // 加载照片数据
  const loadPhotos = async (page = 1, append = false) => {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newPhotos = generateMockPhotos(page, pageSize);
      
      if (append) {
        setPhotos(prev => [...prev, ...newPhotos]);
      } else {
        setPhotos(newPhotos);
      }
      
      setCurrentPage(page);
      // 模拟最多5页数据
      setHasMore(page < 5);
      setLoading(false);
    } catch (error) {
      console.error('加载照片失败:', error);
      setLoading(false);
    }
  };

  // 加载更多照片
  const loadMorePhotos = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await loadPhotos(currentPage + 1, true);
    } finally {
      setLoadingMore(false);
    }
  };

  // 下拉刷新
  const handleRefresh = async () => {
    setCurrentPage(1);
    setHasMore(true);
    await loadPhotos(1, false);
  };

  // 回到顶部功能
  const scrollToTop = () => {
    setIsScrollingToTop(true);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // 动画持续时间后隐藏按钮
    setTimeout(() => {
      setIsScrollingToTop(false);
      setShowBackToTop(false);
    }, 800);
  };

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadPhotos();
    
    // 监听滚动事件，控制回到顶部按钮显示
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full h-full flex flex-col">
        {/* 页面标题区域 */}
        <div className="w-full flex-shrink-0 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  作品浏览
                </h1>
                <p className="text-base text-gray-600 max-w-3xl">
                  探索胶片摄影的无限可能，每一张照片都是时光的见证。
                </p>
              </div>
              {/* 刷新按钮右对齐 */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                  title="刷新照片"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>刷新</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 照片网格区域 - 与header footer对齐 */}
        <div className="w-full flex-1 py-2">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {photos.length === 0 && !loading ? (
              <div className="w-full h-64 flex flex-col items-center justify-center text-center">
                <div className="text-gray-400 text-6xl mb-4">📸</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">暂无作品</h3>
                <p className="text-gray-600">请稍后再来查看</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
                  {photos.map((photo) => (
                    <Link
                      key={photo.id}
                      to={`/photo/${photo.id}`}
                      className="group block"
                    >
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
                        <div className="aspect-[4/3] overflow-hidden">
                          <LazyImage
                            src={photo.image}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            lazyOptions={{
                              rootMargin: '100px',
                              threshold: 0.1
                            }}
                          />
                        </div>
                        <div className="p-6 h-full flex flex-col">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 text-lg mb-3 transition-colors">
                            {photo.title}
                          </h3>
                          <div className="mt-auto text-sm text-gray-500 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">相机:</span>
                              <span className="font-medium">{photo.camera}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">胶卷:</span>
                              <span className="font-medium">{photo.film}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">日期:</span>
                              <span className="font-medium">{photo.date}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">评分:</span>
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-sm ${i < photo.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* 加载更多文字区域 */}
                <div className="flex justify-center items-center py-1">
                  {hasMore ? (
                    <span
                      onClick={loadMorePhotos}
                      className={`text-blue-600 hover:text-blue-700 cursor-pointer transition-colors ${
                        loadingMore ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loadingMore ? '加载中...' : '加载更多'}
                    </span>
                  ) : (
                    <span className="text-gray-400">已加载全部照片</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 回到顶部按钮 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center z-50 animate-pulse"
          title="回到顶部"
        >
          <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2} className="opacity-25" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l0 6l4 4" className="opacity-75" />
          </svg>
          <svg className="w-4 h-4 absolute" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Gallery;
