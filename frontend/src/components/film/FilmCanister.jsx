import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * 基础胶卷暗盒矢量组件。
 *
 * 设计目标：
 * - 通过 props 控制三种状态：`idle`（初始）、`random`（随机滚动）、`selected`（确定）
 * - 支持自定义包装贴纸图（packageImage），默认使用渐变占位
 * - 输出纯 SVG，方便在不同尺寸下复用
 *
 * 注意：动画（例如老虎机式滚动）由父组件控制，这里仅提供基本结构和辅助的 className。
 */
const FilmCanister = ({
  size = 180,
  state = 'idle',
  className,
  showGuideline = false
}) => {
  const width = size * 0.48;
  const height = size;
  const capHeight = height * 0.14;
  const hubWidth = width * 0.4;
  const hubHeight = height * 0.22;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('film-canister-svg', className)}
    >
      <defs>
        <linearGradient id="canister-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1f2a3b" />
          <stop offset="100%" stopColor="#0b121f" />
        </linearGradient>
        <linearGradient id="canister-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#101a2c" />
          <stop offset="100%" stopColor="#060b15" />
        </linearGradient>
      </defs>

      {/* 顶部盖子 */}
      <ellipse
        cx={width / 2}
        cy={capHeight * 0.55}
        rx={(width * 0.78) / 2}
        ry={capHeight * 0.58}
        fill="#0e1626"
      />
      <rect
        x={width * 0.11}
        y={capHeight * 0.4}
        width={width * 0.78}
        height={capHeight * 0.9}
        rx={capHeight * 0.45}
        fill="url(#canister-highlight)"
      />

      {/* 主体 */}
      <rect
        x={width * 0.11}
        y={capHeight}
        width={width * 0.78}
        height={height - capHeight * 2}
        rx={width * 0.22}
        fill="url(#canister-shadow)"
        className={clsx({
          'film-canister-package--spinning': state === 'random'
        })}
      />

      {/* 底部盖子 */}
      <rect
        x={width * 0.11}
        y={height - capHeight * 1.3}
        width={width * 0.78}
        height={capHeight * 0.95}
        rx={capHeight * 0.45}
        fill="#050a14"
      />
      <ellipse
        cx={width / 2}
        cy={height - capHeight * 0.7}
        rx={(width * 0.78) / 2}
        ry={capHeight * 0.55}
        fill="#050a14"
      />

      {/* 上方轴心 */}
      <rect
        x={width / 2 - hubWidth / 2}
        y={-capHeight * 0.2}
        width={hubWidth}
        height={hubHeight}
        rx={hubWidth * 0.35}
        fill="#0c1524"
      />

      {/* 状态高亮 */}
      {state === 'selected' && (
        <rect
          x={width * 0.11}
          y={capHeight}
          width={width * 0.78}
          height={height - capHeight * 2}
          rx={width * 0.22}
          fill="rgba(59, 130, 246, 0.25)"
        />
      )}

      {showGuideline && (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke="#3182ce"
          strokeDasharray="4 3"
          fill="transparent"
        />
      )}
    </svg>
  );
};

FilmCanister.propTypes = {
  size: PropTypes.number,
  state: PropTypes.oneOf(['idle', 'random', 'selected']),
  className: PropTypes.string,
  showGuideline: PropTypes.bool
};

export default FilmCanister;
