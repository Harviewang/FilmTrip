import React, { useState, useEffect, useRef } from 'react';
import TimelineSidebar from './components/TimelineSidebar/index.jsx';
import FilmRollGrid from './components/FilmRollGrid/index.jsx';
import FilmStripViewer from './components/FilmStripViewer/index.jsx';
import HeatmapCalendar from '../../components/HeatmapCalendar/index.jsx';

const FilmRolls = () => {
  const [filmRolls, setFilmRolls] = useState([]);
  const [filmStocks, setFilmStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [displayedRolls, setDisplayedRolls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilmRoll, setSelectedFilmRoll] = useState(null);
  const [isFilmStripOpen, setIsFilmStripOpen] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  
  const ITEMS_PER_PAGE = 12;

  const loadMoreRef = useRef(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    fetchFilmRolls();
    fetchFilmStocks();
    fetchHeatmap();
  }, []);

  useEffect(() => {
    if (filmRolls.length > 0) {
      resetPagination();
    }
  }, [selectedYear, selectedMonth, filmRolls]);

  useEffect(() => {
    if (!hasMore) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loadingMoreRef.current) {
        loadingMoreRef.current = true;
        setTimeout(() => {
          loadMoreRolls(false);
          loadingMoreRef.current = false;
        }, 0);
      }
    }, { root: null, rootMargin: '0px', threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, displayedRolls.length]);

  const fetchFilmRolls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/filmRolls');
      if (!response.ok) {
        throw new Error('获取胶卷数据失败');
      }
      const data = await response.json();
      const rolls = Array.isArray(data) ? data : (data?.data ?? data?.filmRolls ?? []);
      setFilmRolls(rolls);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/stats/activity/heatmap', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      if (!res.ok) return; // 静默降级
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json?.data ?? []);
      setHeatmapData(arr);
    } catch (e) {}
  };

  const fetchFilmStocks = async () => {
    try {
      const response = await fetch('/api/filmStocks');
      if (!response.ok) {
        throw new Error('获取胶卷品类数据失败');
      }
      const data = await response.json();
      const stocks = Array.isArray(data) ? data : (data?.data ?? data?.filmStocks ?? []);
      setFilmStocks(stocks);
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
    // 不做年份/月过滤，默认按时间倒序（最近在前）展示全部年份
    return [...filmRolls].sort((a, b) => new Date(b.opened_date || b.created_at) - new Date(a.opened_date || a.created_at));
  };

  const getFilmStockById = (stockId) => {
    return filmStocks.find(stock => stock.id === stockId);
  };

  // 处理胶卷点击
  const handleFilmRollClick = async (filmRoll) => {
    try {
      // 获取胶卷详情（包含照片）
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/filmRolls/${filmRoll.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      });
      if (!response.ok) {
        throw new Error('获取胶卷详情失败');
      }
      const data = await response.json();
      const filmRollWithPhotos = data.data;
      
      setSelectedFilmRoll(filmRollWithPhotos);
      setIsFilmStripOpen(true);
    } catch (err) {
      console.error('获取胶卷详情失败:', err);
      // 如果没有照片，仍然可以打开胶片条
      setSelectedFilmRoll(filmRoll);
      setIsFilmStripOpen(true);
    }
  };

  // 处理胶片条关闭
  const handleFilmStripClose = () => {
    setIsFilmStripOpen(false);
    setSelectedFilmRoll(null);
  };

  // 处理年份选择
  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedMonth(null); // 选择年份时清空月份选择
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
  };

  // 处理胶卷状态更新
  const handleFilmRollStatusChange = async (filmRollId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/filmRolls/${filmRollId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('状态更新失败');
      }

      // 更新本地状态
      setFilmRolls(prevRolls => 
        prevRolls.map(roll => 
          roll.id === filmRollId ? { ...roll, status: newStatus } : roll
        )
      );

      // 如果当前选中的胶卷状态更新了，也要更新
      if (selectedFilmRoll && selectedFilmRoll.id === filmRollId) {
        setSelectedFilmRoll(prev => ({ ...prev, status: newStatus }));
      }

      console.log('胶卷状态更新成功:', { filmRollId, newStatus });
    } catch (error) {
      console.error('胶卷状态更新失败:', error);
      throw error;
    }
  };

  if (loading && filmRolls.length === 0) {
    return (
      <div className="h-screen bg-gray-50 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载胶卷数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 overflow-hidden flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* 整体内容容器 - 居中布局 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 活动热力图（GitHub 风格） */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-700">活动热力图</h2>
          </div>
          <HeatmapCalendar
            data={heatmapData}
            onCellClick={(date, count) => {
              // 目前仅提示，不做筛选
              console.debug('heatmap click', date, count);
            }}
          />
        </div>
        {/* 时间轴展示区 */}
        <FilmRollGrid
          filmRolls={displayedRolls}
          filmStocks={filmStocks}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMoreRolls}
          onFilmRollClick={handleFilmRollClick}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
        <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
          {hasMore ? '下拉加载更多' : '已显示全部'}
        </div>
        <div ref={loadMoreRef} style={{ height: 1 }} />
      </div>

      {/* 胶片条查看器 */}
      <FilmStripViewer
        filmRoll={selectedFilmRoll}
        filmStock={selectedFilmRoll ? getFilmStockById(selectedFilmRoll.film_stock_id) : null}
        isOpen={isFilmStripOpen}
        onClose={handleFilmStripClose}
        onStatusChange={handleFilmRollStatusChange}
      />
    </div>
  );
};

export default FilmRolls;