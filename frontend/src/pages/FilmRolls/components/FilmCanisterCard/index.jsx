import React from 'react';
import API_CONFIG from '../../../../config/api.js';
import LazyImage from '../../../../components/LazyImage';

// 胶卷暗盒卡片（以暗盒图为主图，底部显示卷名）
const FilmCanisterCard = ({
  filmRoll,
  filmStock,
  onClick,
  className = ''
}) => {
  const imageSrc = filmStock?.canister_image || filmStock?.cartridge_image || filmStock?.image_url || '';
  const title = filmRoll?.name || filmStock?.series || filmStock?.name || '';

  return (
    <div
      className={`group cursor-pointer select-none`}
      onClick={() => onClick?.(filmRoll)}
      title={title}
    >
      {/* 拟物暗盒主体 */}
      <div className={`relative w-28 h-40 bg-white rounded-sm border border-gray-300 shadow-sm overflow-hidden ${className}`}>
        {/* 顶盖 */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-black" />
        {/* 底部黑条 */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black" />
        {/* 右侧拉片耳（把手） */}
        <div className="absolute top-6 right-[-14px] w-8 h-24 bg-gray-400 rounded-md"></div>
        {/* 小孔点缀 */}
        <div className="absolute bottom-3 right-[-6px] w-2 h-2 bg-white rounded-sm"></div>
        <div className="absolute bottom-6 right-[-6px] w-2 h-2 bg-white rounded-sm"></div>

        {/* 主图 */}
        {imageSrc ? (
          <LazyImage
            src={imageSrc.startsWith('/') ? `${API_CONFIG.BASE_URL}${imageSrc}` : imageSrc}
            alt={title}
            className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="absolute inset-2 flex items-center justify-center text-gray-300 text-3xl" style={{ display: imageSrc ? 'none' : 'flex' }}>
          🎞️
        </div>
      </div>

      {/* 底部标题条 */}
      <div className="mt-2 max-w-[7rem]">
        <div className="text-center text-xs text-gray-700 truncate">{title}</div>
      </div>
    </div>
  );
};

export default FilmCanisterCard;
