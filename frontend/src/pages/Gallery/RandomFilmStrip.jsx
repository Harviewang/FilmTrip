import React from 'react';
import PropTypes from 'prop-types';
import API_CONFIG from '../../config/api.js';
import LazyImage from '../../components/LazyImage';

const RandomFilmStrip = ({
  photos,
  onRandom,
  isRandomizing,
  onFrameClick,
  error
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
          className="px-3 py-2 rounded-md text-sm bg-blue-600 text-white disabled:opacity-50"
        >
          {isRandomizing ? '随机中…' : '换一组照片'}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-500 mb-2">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(photos || []).slice(0, 6).map((p, idx) => {
          const isAdmin = (() => { try { const u = JSON.parse(localStorage.getItem('user')); return u && u.username === 'admin'; } catch (e) { return false; } })();
          const effectiveProtection = !!(p && (p.effective_protection || p._raw?.effective_protection));
          const isProtectedForViewer = effectiveProtection && !isAdmin;
          const imgSrc = p.size1024 ? `${API_CONFIG.BASE_URL}${p.size1024}` : p.thumbnail ? `${API_CONFIG.BASE_URL}${p.thumbnail}` : (p.original ? `${API_CONFIG.BASE_URL}${p.original}` : '');
          const hasValidImageUrl = !!imgSrc;
          return (
            <div key={p.id || idx} className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: '75%' }}>
              <div className="absolute inset-0">
                {isProtectedForViewer || !hasValidImageUrl ? (
                  <div className="w-full h-full bg-gray-100 text-gray-500 flex items-center justify-center text-center px-3 select-none">
                    <div>
                      <div className="text-3xl mb-2">🔒</div>
                      <div className="text-xs">{isProtectedForViewer ? '该照片涉及隐私或他人肖像，已被管理员加密' : '图片不可用'}</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <LazyImage
                      src={imgSrc}
                      alt={p.title || p.filename || '随机照片'}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handleClick(p, idx)}
                      lazyOptions={{ rootMargin: '150px', threshold: 0.1 }}
                    />
                    {/* 管理员视图：加密则常显锁图标 */}
                    {effectiveProtection && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded" title="加密">🔒</div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

RandomFilmStrip.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.object),
  onRandom: PropTypes.func.isRequired,
  isRandomizing: PropTypes.bool,
  onFrameClick: PropTypes.func,
  error: PropTypes.string
};

export default RandomFilmStrip;
