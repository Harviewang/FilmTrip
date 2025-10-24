import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * 胶片底片条矢量组件。
 *
 * - 支持“folded”（未抽出，仅片头）与“unrolled”（抽出状态）两种模式
 * - 通过 `frames` 控制帧位数量与内容占位，真正的照片由父组件负责渲染覆盖
 * - 统一使用 35mm 胶片比例（帧窗口 24x36，带齿孔）
 */
const FilmStrip = ({
  width = 520,
  height = 180,
  state = 'folded',
  frameCount: fallbackFrameCount = 5,
  frames = [],
  className,
  showGuideline = false,
  onFrameClick
}) => {
  const resolvedFrameCount =
    state === 'unrolled' ? Math.max(frames.length || fallbackFrameCount, 1) : fallbackFrameCount;
  const frameWidth = width / (resolvedFrameCount + 2);
  const frameHeight = height * 0.55;
  const frameGap = frameWidth * 0.1;
  const stripRadius = height * 0.12;

  const renderPerforations = (position) => {
    const slots = Array.from({ length: resolvedFrameCount + 2 });
    return (
      <g>
        {slots.map((_, index) => (
          <rect
            key={`${position}-${index}`}
            x={frameGap + index * (frameWidth + frameGap)}
            y={position === 'top' ? height * 0.1 : height - height * 0.18}
            width={frameWidth * 0.32}
            height={height * 0.08}
            rx={height * 0.015}
            fill="#111"
          />
        ))}
      </g>
    );
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('film-strip-svg', className)}
    >
      {/* 胶片背景 */}
      <rect x={0} y={0} width={width} height={height} fill="#0f172a" rx={stripRadius} />
      <rect
        x={0}
        y={height * 0.18}
        width={width}
        height={height * 0.64}
        fill="#202938"
        rx={stripRadius * 0.8}
      />

      {/* 片头区域 */}
      <rect
        x={0}
        y={height * 0.2}
        width={frameWidth * 1.1}
        height={frameHeight}
        rx={stripRadius * 0.6}
        fill="#2f3747"
      />

      {/* 抽出状态下的帧窗口 */}
      {state === 'unrolled' && (
        <g transform={`translate(${frameWidth * 1.2}, ${height * 0.2})`}>
          {Array.from({ length: resolvedFrameCount }).map((_, index) => {
            const frame = frames[index];
            const x = index * (frameWidth + frameGap);
            return (
              <g key={`frame-${frame?.id ?? index}`}>
                <rect
                  x={x}
                  y={0}
                  width={frameWidth}
                  height={frameHeight}
                  rx={6}
                  fill="#111827"
                  className="film-strip__frame"
                  />
                <foreignObject
                  x={x}
                  y={0}
                  width={frameWidth}
                  height={frameHeight}
                  className="film-strip__frame-foreign"
                >
                  <div
                    className="w-full h-full rounded-[6px] overflow-hidden relative bg-slate-900 cursor-pointer group"
                    onClick={frame?.onClick ?? (onFrameClick ? () => onFrameClick(index, frame) : null)}
                  >
                    {frame?.content}
                  </div>
                </foreignObject>
                <text
                  x={x + frameWidth / 2}
                  y={frameHeight + 16}
                  fontSize={10}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  className="select-none pointer-events-none"
                  style={{ letterSpacing: '0.12em' }}
                >
                  {frame?.label ?? String(index + 1).padStart(2, '0')}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* 齿孔 */}
      {renderPerforations('top')}
      {renderPerforations('bottom')}

      {/* 辅助线 */}
      {showGuideline && (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke="#fb923c"
          strokeDasharray="6 4"
          fill="transparent"
        />
      )}
    </svg>
  );
};

FilmStrip.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  state: PropTypes.oneOf(['folded', 'unrolled']),
  frameCount: PropTypes.number,
  frames: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      content: PropTypes.node,
      label: PropTypes.string,
      onClick: PropTypes.func
    })
  ),
  className: PropTypes.string,
  showGuideline: PropTypes.bool,
  onFrameClick: PropTypes.func
};

export default FilmStrip;
