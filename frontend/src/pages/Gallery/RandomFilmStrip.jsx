import React from 'react';
import PropTypes from 'prop-types';

const RandomFilmStrip = ({
  photos,
  onRandom,
  isRandomizing,
  onFrameClick,
  error,
  renderPhotoCard
}) => {
  const handleClick = (photo, index) => {
    if (!photo) return;
    onFrameClick?.(photo, index);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm text-gray-700">本次随机 · {Math.min(6, photos?.length || 0)} 张</h3>
        <button
          type="button"
          onClick={onRandom}
          disabled={isRandomizing}
          className="px-3 py-2 rounded-md text-sm bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {isRandomizing ? '随机中…' : '换一组照片'}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-500 mb-2 px-3 py-2 bg-red-50 rounded-md">{error}</div>
      )}

      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => {
            const rendered = renderPhotoCard ? renderPhotoCard(photo, true, false) : null;
            if (!rendered) return null;
            return (
              <div
                key={photo.id || index}
                className="group"
                onClick={() => handleClick(photo, index)}
              >
                {rendered}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center">
          <div className="text-gray-400 text-5xl mb-4">📸</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {isRandomizing ? '正在随机中...' : '暂无照片'}
          </h3>
          <p className="text-sm text-gray-400">
            {isRandomizing 
              ? '正在为您挑选照片' 
              : '当前筛选条件下没有可展示的照片，试试调整筛选条件或换一组照片吧'}
          </p>
        </div>
      )}
    </div>
  );
};

RandomFilmStrip.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.object),
  onRandom: PropTypes.func.isRequired,
  isRandomizing: PropTypes.bool,
  onFrameClick: PropTypes.func,
  error: PropTypes.string,
  renderPhotoCard: PropTypes.func
};

export default RandomFilmStrip;
