import React from 'react';

/**
 * 时间轴组件 - 整体列表设计
 * 左边年月层级，右边对应胶卷，统一白色背景
 */
const TimelineSidebar = ({ 
  years = [], 
  selectedYear, 
  selectedMonth,
  onYearSelect,
  onMonthSelect,
  filmRolls = [],
  className = ""
}) => {
  // 获取所有年份的完整数据结构
  const getAllData = () => {
    const result = [];
    
    years.forEach(year => {
      const yearRolls = filmRolls.filter(roll => {
        const date = new Date(roll.opened_date || roll.created_at);
        return date.getFullYear() === year;
      });

      if (yearRolls.length > 0) {
        // 按月份分组
        const monthsData = {};
        yearRolls.forEach(roll => {
          const date = new Date(roll.opened_date || roll.created_at);
          const month = date.getMonth() + 1;
          
          if (!monthsData[month]) {
            monthsData[month] = [];
          }
          monthsData[month].push(roll);
        });

        // 转换为数组并按月份排序
        const months = Object.entries(monthsData)
          .map(([month, rolls]) => ({
            month: parseInt(month),
            monthName: getMonthName(parseInt(month)),
            rolls: rolls
          }))
          .sort((a, b) => a.month - b.month);

        result.push({
          year,
          months,
          totalRolls: yearRolls.length
        });
      }
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

  const allData = getAllData();

  return (
    <div className={`w-full ${className}`}>
      {/* 标题区域 */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 mb-1">胶卷时光</h1>
        <p className="text-sm text-gray-600">按年月浏览胶卷</p>
      </div>
      
      {/* 时间轴内容 */}
      <div>
        {allData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-3xl mb-2">📅</div>
            <p className="text-sm text-gray-500">暂无胶卷数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allData.map((yearData, yearIndex) => (
              <div key={yearData.year} className="space-y-2">
                {/* 年份标题 */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {yearData.year}年
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({yearData.totalRolls}卷)
                  </span>
                </div>
                
                {/* 月份列表 */}
                <div className="ml-4 space-y-1">
                  {yearData.months.map((monthData, monthIndex) => {
                    const isSelected = selectedYear === yearData.year && selectedMonth === monthData.month;
                    return (
                      <div key={monthData.month} className="flex items-center space-x-3 py-1">
                        {/* 月份节点 */}
                        <button
                          onClick={() => onMonthSelect(monthData.month)}
                          className={`flex items-center space-x-2 hover:bg-gray-50 px-2 py-1 rounded transition-colors ${
                            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-blue-600' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm">
                            {monthData.monthName}
                          </span>
                        </button>
                        
                        {/* 胶卷数量 */}
                        <span className={`text-xs ${
                          isSelected ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {monthData.rolls.length}卷
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* 年份分隔线 */}
                {yearIndex < allData.length - 1 && (
                  <div className="border-t border-gray-100 mt-4"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineSidebar;