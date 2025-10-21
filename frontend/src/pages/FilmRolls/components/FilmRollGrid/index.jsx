import React from 'react';
import FilmCanisterCard from '../FilmCanisterCard/index.jsx';

/**
 * 胶卷时间轴组件 - 胶卷铆钉在时间轴上
 * 按照时间轴结构，胶卷直接显示在月份节点上
 */
const FilmRollGrid = ({ 
  filmRolls = [],
  filmStocks = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  onFilmRollClick,
  selectedYear,
  selectedMonth,
  className = ""
}) => {
  // 获取胶卷对应的胶卷品类信息
  const getFilmStockById = (stockId) => {
    return filmStocks.find(stock => stock.id === stockId);
  };

  // 按时间轴结构组织胶卷
  const getTimelineStructure = () => {
    const result = [];
    
    // 按年份分组
    const yearsData = {};
    filmRolls.forEach(roll => {
      const date = new Date(roll.opened_date || roll.created_at);
      const year = date.getFullYear();
      
      if (!yearsData[year]) {
        yearsData[year] = {};
      }
      
      const month = date.getMonth() + 1;
      if (!yearsData[year][month]) {
        yearsData[year][month] = [];
      }
      yearsData[year][month].push(roll);
    });

    // 转换为数组并按年份排序
    Object.entries(yearsData)
      .sort(([a], [b]) => b - a) // 最新年份在前
      .forEach(([year, monthsData]) => {
        const yearNum = parseInt(year);
        const months = Object.entries(monthsData)
          .map(([month, rolls]) => ({
            month: parseInt(month),
            monthName: getMonthName(parseInt(month)),
            rolls: rolls.sort((a, b) => new Date(b.opened_date || b.created_at) - new Date(a.opened_date || a.created_at))
          }))
          .sort((a, b) => b.month - a.month); // 最新月份在前

        result.push({
          year: yearNum,
          months,
          totalRolls: Object.values(monthsData).flat().length
        });
      });

    return result;
  };

  // 获取月份名称
  const getMonthName = (month) => {
    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return monthNames[month - 1];
  };

  if (loading && filmRolls.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        {/* 加载状态 */}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">加载胶卷数据中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (filmRolls.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        {/* 空状态 */}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">🎞️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无胶卷</h3>
            <p className="text-gray-500">还没有添加任何胶卷</p>
          </div>
        </div>
      </div>
    );
  }

  const timelineData = getTimelineStructure();

  return (
    <div className={`w-full ${className}`}>
      {/* 时间轴展示 */}
      <div className="space-y-10">
        {timelineData.map((yearData, yearIndex) => (
          <div key={yearData.year} className="space-y-6">
            {/* 年份标题 */}
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-gray-900">{yearData.year}年</h2>
              <span className="text-sm text-gray-500">({yearData.totalRolls}卷)</span>
            </div>

            {/* 月份分组 */}
            <div className="space-y-8">
              {yearData.months.map((monthData) => (
                <div key={monthData.month} className="grid grid-cols-[80px_1fr] gap-4 items-start">
                  {/* 左侧：月份标签 + 与内容一体化的纵向分隔线 */}
                  <div className="relative h-full">
                    <div className="text-sm font-semibold text-gray-800 leading-6">{monthData.monthName}</div>
                    <div className="absolute left-[calc(100%-1px)] top-3 bottom-0 w-px bg-gray-300" />
                  </div>

                  {/* 右侧：卡片区域 */}
                  <div className="flex flex-wrap gap-4">
                    {monthData.rolls.map((filmRoll) => {
                      const stock = getFilmStockById(filmRoll.film_stock_id);
                      return (
                        <FilmCanisterCard
                          key={filmRoll.id}
                          filmRoll={filmRoll}
                          filmStock={stock}
                          onClick={onFilmRollClick}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* 年份分隔线 */}
            {yearIndex < timelineData.length - 1 && (
              <div className="border-t border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FilmRollGrid;