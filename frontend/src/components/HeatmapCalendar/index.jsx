import React, { useMemo } from 'react';

// GitHub-like heatmap calendar (53 weeks x 7 days), week starts on Sunday
// props: data [{date: 'YYYY-MM-DD', count: number}], levels: number[] thresholds, onCellClick
const HeatmapCalendar = ({ data = [], levels = [0, 1, 3, 6, 10], onCellClick, className = '' }) => {
  // map date->count
  const dateMap = useMemo(() => {
    const m = new Map();
    (data || []).forEach(d => m.set(d.date, d.count || 0));
    return m;
  }, [data]);

  // align to Sunday of the week, build 53 columns ending today
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // back to Sunday
    const endDow = end.getDay(); // 0=Sun
    const endAligned = new Date(end);
    // GitHub显示到当前周列即可
    const totalCols = 53;
    const start = new Date(endAligned);
    start.setDate(endAligned.getDate() - (totalCols * 7 - 1));

    const cols = [];
    const monthLbls = Array(totalCols).fill('');
    for (let i = 0; i < totalCols; i++) {
      const col = [];
      for (let j = 0; j < 7; j++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i * 7 + j);
        const ds = d.toISOString().slice(0, 10);
        const c = dateMap.get(ds) || 0;
        col.push({ date: ds, count: c, month: d.getMonth() });
      }
      // 月份标签：当本列包含月初(日期为1)时显示该月简称
      const firstOfMonth = col.find(cell => new Date(cell.date).getDate() === 1);
      if (firstOfMonth) {
        const m = new Date(firstOfMonth.date).toLocaleString('en', { month: 'short' });
        monthLbls[i] = m;
      }
      cols.push(col);
    }
    return { weeks: cols, monthLabels: monthLbls };
  }, [dateMap]);

  const colorFor = (c) => {
    // approximate GitHub greens
    if (c <= levels[0]) return 'bg-gray-100'; // 0
    if (c <= levels[1]) return 'bg-green-100';
    if (c <= levels[2]) return 'bg-green-200';
    if (c <= levels[3]) return 'bg-green-400';
    return 'bg-green-600';
  };

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      {/* Month row */}
      <div className="inline-flex items-start">
        <div className="w-8" />
        <div className="flex text-[10px] text-gray-500 select-none">
          {weeks.map((_, i) => (
            <div key={`m-${i}`} className="w-3 h-4 mr-1 text-center">
              {monthLabels[i]}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="inline-flex items-start mt-1">
        {/* Y-axis labels like GitHub (Mon/Wed/Fri)*/}
        <div className="w-8 flex flex-col text-[10px] text-gray-500 leading-4 select-none">
          <span className="mt-1">Mon</span>
          <span className="mt-6">Wed</span>
          <span className="mt-6">Fri</span>
        </div>
        <div className="flex">
          {weeks.map((col, i) => (
            <div key={i} className="flex flex-col mr-1 space-y-1">
              {col.map((cell, idx) => (
                <div
                  key={cell.date}
                  className={`w-3 h-3 ${colorFor(cell.count)} hover:ring-1 hover:ring-black/5 cursor-pointer`}
                  title={`${cell.date} · ${cell.count} activity`}
                  onClick={() => onCellClick && onCellClick(cell.date, cell.count)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-end space-x-1 text-xs text-gray-500 select-none">
        <span>Less</span>
        <span className="w-3 h-3 bg-gray-100 inline-block" />
        <span className="w-3 h-3 bg-green-100 inline-block" />
        <span className="w-3 h-3 bg-green-200 inline-block" />
        <span className="w-3 h-3 bg-green-400 inline-block" />
        <span className="w-3 h-3 bg-green-600 inline-block" />
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
