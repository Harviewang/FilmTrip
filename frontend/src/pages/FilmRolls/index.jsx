import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import LazyImage from '../../components/LazyImage';

const FilmRolls = () => {
  const [filmRolls, setFilmRolls] = useState([]);
  const [filmStocks, setFilmStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [displayedRolls, setDisplayedRolls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [showStocks, setShowStocks] = useState(false);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchFilmRolls();
    fetchFilmStocks();
  }, []);

  useEffect(() => {
    resetPagination();
  }, [selectedYear]);

  const fetchFilmRolls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/film-rolls');
      if (!response.ok) {
        throw new Error('获取胶卷数据失败');
      }
      const data = await response.json();
      setFilmRolls(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilmStocks = async () => {
    try {
      const response = await fetch('/api/film-stocks');
      if (!response.ok) {
        throw new Error('获取胶卷品类数据失败');
      }
      const data = await response.json();
      setFilmStocks(data);
    } catch (err) {
      console.error('获取胶卷品类失败:', err);
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setDisplayedRolls([]);
    setHasMore(true);
    setTimeout(() => {
      loadMoreRolls(true);
    }, 100);
  };

  const loadMoreRolls = (reset = false) => {
    const filteredRolls = getFilteredRolls();
    const startIndex = reset ? 0 : displayedRolls.length;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newRolls = filteredRolls.slice(startIndex, endIndex);
    
    if (reset) {
      setDisplayedRolls(newRolls);
    } else {
      setDisplayedRolls(prev => [...prev, ...newRolls]);
    }
    
    setHasMore(endIndex < filteredRolls.length);
    if (!reset) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const getYears = () => {
    const years = [...new Set(filmRolls.map(roll => {
      const date = new Date(roll.opened_date || roll.created_at);
      return date.getFullYear();
    }))].sort((a, b) => b - a);
    return years;
  };

  const getFilteredRolls = () => {
    return filmRolls.filter(roll => {
      const date = new Date(roll.opened_date || roll.created_at);
      return date.getFullYear() === selectedYear;
    });
  };

  const getFilmStockById = (stockId) => {
    return filmStocks.find(stock => stock.id === stockId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unopened': return 'bg-gray-100 text-gray-800';
      case 'shooting': return 'bg-blue-100 text-blue-800';
      case 'exposed': return 'bg-yellow-100 text-yellow-800';
      case 'developed': return 'bg-purple-100 text-purple-800';
      case 'scanned': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'unopened': return '未拆封';
      case 'shooting': return '拍摄中';
      case 'exposed': return '已曝光';
      case 'developed': return '已冲洗';
      case 'scanned': return '已扫描';
      default: return '未知';
    }
  };

  const renderFilmRollCard = (filmRoll) => {
    const filmStock = getFilmStockById(filmRoll.film_stock_id);
    const stockImage = filmStock?.image_url;
    
    return (
      <div
        key={filmRoll.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
      >
        <div className="relative">
          <div className="h-48 bg-gray-100 overflow-hidden">
            {stockImage ? (
              <LazyImage
                src={stockImage}
                alt={filmStock?.name || '胶卷'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400" style={{display: stockImage ? 'none' : 'flex'}}>
              🎞️
            </div>
          </div>
          
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getStatusColor(filmRoll.status)
            }`}>
              {getStatusText(filmRoll.status)}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1">{filmStock?.name || '未知胶卷'}</h3>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              {filmStock?.brand} {filmStock?.type} {filmStock?.iso}ISO
            </div>
            
            {filmRoll.camera_name && (
              <div className="text-sm text-gray-600">📷 {filmRoll.camera_name}</div>
            )}
            
            <div className="text-xs text-gray-500 space-y-1">
              <div>编号: {filmRoll.roll_number}</div>
              {filmRoll.opened_date && (
                <div>启封: {new Date(filmRoll.opened_date).toLocaleDateString()}</div>
              )}
              {filmRoll.location && (
                <div>地点: {filmRoll.location}</div>
              )}
            </div>
          </div>
          
          {filmRoll.photos && filmRoll.photos.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">照片预览</span>
                <span className="text-xs text-gray-500">{filmRoll.photos.length} 张</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {filmRoll.photos.slice(0, 6).map((photo) => (
                  <div key={photo.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                    <LazyImage
                      src={photo.thumbnail_url || photo.file_url}
                      alt={`照片 ${photo.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs" style={{display: 'none'}}>
                      📷
                    </div>
                  </div>
                ))}
                {filmRoll.photos.length > 6 && (
                  <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">+{filmRoll.photos.length - 6}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-white overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载胶卷数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-white overflow-hidden flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFilmRolls}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const years = getYears();
  const filteredRolls = getFilteredRolls();

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="h-full flex">
        {/* 左侧时间轴 */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-2">胶卷时光</h1>
            <p className="text-sm text-gray-600">按年份浏览胶卷</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {years.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-3xl mb-2">📅</div>
                  <p className="text-sm text-gray-500">暂无胶卷数据</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {years.map(year => {
                    const yearRolls = filmRolls.filter(roll => {
                      const date = new Date(roll.opened_date || roll.created_at);
                      return date.getFullYear() === year;
                    });
                    
                    return (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedYear === year
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'hover:bg-gray-50 border-transparent text-gray-700'
                        } border`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{year}年</span>
                          <span className={`text-sm ${
                            selectedYear === year ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {yearRolls.length}卷
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {yearRolls.filter(r => r.status === 'scanned').length} 已完成 · 
                          {yearRolls.filter(r => r.status === 'shooting' || r.status === 'exposed').length} 进行中
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* 胶卷品类展示区域 */}
          <div className="border-t border-gray-200">
            <button
              onClick={() => setShowStocks(!showStocks)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">胶卷品类</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {filmStocks.length}
                </span>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform ${showStocks ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showStocks && (
              <div className="px-4 pb-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {filmStocks.map(stock => {
                    const stockRolls = filmRolls.filter(roll => roll.film_stock_id === stock.id);
                    return (
                      <div key={stock.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-white rounded border overflow-hidden flex-shrink-0">
                            {stock.image_url ? (
                              <LazyImage
                                src={stock.image_url}
                                alt={stock.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg" style={{display: stock.image_url ? 'none' : 'flex'}}>
                              🎞️
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{stock.name}</h4>
                            <p className="text-xs text-gray-600">{stock.brand} · {stock.type}</p>
                            <p className="text-xs text-gray-500">ISO {stock.iso} · {stockRolls.length} 卷</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {filmStocks.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-2xl mb-1">📦</div>
                    <p className="text-xs text-gray-500">暂无胶卷品类</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右侧胶卷展示区 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部标题栏 */}
          <div className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedYear}年胶卷</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    共 {filteredRolls.length} 卷胶卷
                  </p>
                </div>
                
                {/* 状态统计 */}
                <div className="flex space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-600">
                      {filteredRolls.filter(r => r.status === 'unopened').length}
                    </div>
                    <div className="text-xs text-gray-500">未拆封</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {filteredRolls.filter(r => r.status === 'shooting' || r.status === 'exposed').length}
                    </div>
                    <div className="text-xs text-gray-500">进行中</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {filteredRolls.filter(r => r.status === 'scanned').length}
                    </div>
                    <div className="text-xs text-gray-500">已完成</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 胶卷网格 */}
          <div className="flex-1 overflow-y-auto" id="filmrolls-scrollable-div">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {filteredRolls.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">🎞️</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{selectedYear}年暂无胶卷</h3>
                    <p className="text-gray-600">选择其他年份或添加新胶卷</p>
                  </div>
                </div>
              ) : (
                <InfiniteScroll
                  dataLength={displayedRolls.length}
                  next={loadMoreRolls}
                  hasMore={hasMore}
                  loader={
                    <div className="flex justify-center items-center py-8">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span>加载更多胶卷...</span>
                      </div>
                    </div>
                  }
                  endMessage={
                    <div className="flex justify-center items-center py-4">
                      <span className="text-gray-500 text-sm">已显示全部胶卷</span>
                    </div>
                  }
                  refreshFunction={() => {
                    resetPagination();
                  }}
                  pullDownToRefresh={false}
                  pullDownToRefreshThreshold={50}
                  pullDownToRefreshContent={
                    <div className="flex justify-center items-center py-4">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <span>下拉刷新</span>
                      </div>
                    </div>
                  }
                  releaseToRefreshContent={
                    <div className="flex justify-center items-center py-4">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <span>释放刷新</span>
                      </div>
                    </div>
                  }
                  scrollableTarget="filmrolls-scrollable-div"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedRolls.map((filmRoll) => renderFilmRollCard(filmRoll))}
                  </div>
                </InfiniteScroll>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 调试信息 - 右下角不起眼位置，点击鼠标弹出 */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="p-2 bg-gray-800/20 hover:bg-gray-800/40 rounded-full transition-all duration-200"
          title="点击查看调试信息"
        >
          <div className="h-5 w-5 text-gray-600">ℹ️</div>
        </button>
        
        {showDebug && (
          <div className="absolute bottom-12 right-0 w-80 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 text-xs">
            <h3 className="font-medium text-gray-700 mb-2">调试信息</h3>
            <div className="space-y-1 text-gray-600">
              <div>胶卷品类: {filmStocks.length}</div>
              <div>胶卷实例: {filmRolls.length}</div>
              <div>当前年份: {selectedYear}</div>
              <div>筛选结果: {filteredRolls.length}</div>
              <div>已显示: {displayedRolls.length}</div>
              <div>当前页: {currentPage}</div>
              <div>还有更多: {hasMore ? '是' : '否'}</div>
              <div>加载状态: {loading ? '加载中' : '完成'}</div>
              <div>错误状态: {error ? '有错误' : '正常'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmRolls;
