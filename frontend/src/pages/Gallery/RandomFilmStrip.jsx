import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import API_CONFIG from '../../config/api.js';
import FilmCanister from '../../components/film/FilmCanister';
import LazyImage from '../../components/LazyImage';

const getRotation = (orientation) => {
  switch (orientation) {
    case 3:
      return 180;
    case 6:
      return 90;
    case 8:
      return -90;
    default:
      return 0;
  }
};

const RandomFilmStrip = ({
  filmRoll,
  photos,
  canisterState,
  filmState,
  onRandom,
  isRandomizing,
  onFrameClick,
  error
}) => {
  const heroPhoto = photos?.[0] || null;
  const trailPhotos = useMemo(() => (filmState === 'unrolled' ? photos?.slice(1, 4) ?? [] : []), [photos, filmState]);

  const handleFrameClick = (photo, index) => {
    if (!photo) return;
    onFrameClick?.(photo, index);
  };

  return (
    <div className="random-film-layout flex flex-col lg:flex-row items-center lg:items-start gap-10">
      <div className="flex flex-col items-center gap-4">
        <FilmCanister size={200} state={canisterState} />
        <button
          type="button"
          onClick={onRandom}
          disabled={isRandomizing}
          className={`random-film-button ${
            isRandomizing ? 'random-film-button--disabled' : 'random-film-button--primary'
          }`}
        >
          <span role="img" aria-label="dice">
            🎲
          </span>
          {isRandomizing ? '随机中…' : '换一卷胶片'}
        </button>
        {filmRoll && (
          <div className="text-xs text-gray-500 text-center leading-5 max-w-[140px]">
            <div>{filmRoll.film_roll_brand || filmRoll.brand || '未知品牌'}</div>
            <div>{filmRoll.film_roll_name || filmRoll.name || '未知胶卷'}</div>
            <div>ISO {filmRoll.film_roll_iso || '—'}</div>
          </div>
        )}
        {error && <div className="text-xs text-red-500 text-center max-w-[150px]">{error}</div>}
      </div>

      <div className="flex-1 w-full flex flex-col gap-6">
        <div
          className={`random-film-roll ${filmState === 'unrolled' ? 'random-film-roll--active' : ''}`}
        >
          <div className="random-film-roll__holes random-film-roll__holes--top">
            {Array.from({ length: 9 }).map((_, idx) => (
              <span key={`hole-top-${idx}`} />
            ))}
          </div>

          <div className="random-film-roll__body">
            <div className="random-film-roll__packaging">
              <div className="random-film-roll__brand">
                {filmRoll?.film_roll_brand || filmRoll?.brand || 'ILFORD'}
              </div>
              <div className="random-film-roll__name">
                {filmRoll?.film_roll_name || filmRoll?.name || 'HP5 PLUS'}
              </div>
              <div className="random-film-roll__iso">ISO {filmRoll?.film_roll_iso || 400}</div>
              <div className="random-film-roll__meta">
                {filmRoll?.film_roll_type || 'Black & White'} · {filmRoll?.film_roll_format || '35mm'}
              </div>
            </div>

            <div
              className={`random-film-roll__hero ${filmState === 'unrolled' && heroPhoto ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => {
                if (filmState === 'unrolled' && heroPhoto) handleFrameClick(heroPhoto, 0);
              }}
              role="button"
            >
              {heroPhoto && filmState === 'unrolled' ? (
                <LazyImage
                  src={
                    heroPhoto.size1024
                      ? `${API_CONFIG.BASE_URL}${heroPhoto.size1024}`
                      : heroPhoto.thumbnail
                        ? `${API_CONFIG.BASE_URL}${heroPhoto.thumbnail}`
                        : `${API_CONFIG.BASE_URL}${heroPhoto.original || ''}`
                  }
                  alt={heroPhoto.title || heroPhoto.filename || '随机照片'}
                  className="w-full h-full object-cover"
                  style={{
                    transform: `rotate(${getRotation(heroPhoto?.orientation || heroPhoto?._raw?.orientation)}deg)`
                  }}
                  lazyOptions={{ rootMargin: '150px', threshold: 0.1 }}
                />
              ) : (
                <div className="random-film-roll__hero-placeholder">
                  {filmState === 'unrolled' ? '暂无可展示的胶片' : '等待抽取胶片'}
                </div>
              )}
            </div>
          </div>

          <div className="random-film-roll__holes random-film-roll__holes--bottom">
            {Array.from({ length: 9 }).map((_, idx) => (
              <span key={`hole-bottom-${idx}`} />
            ))}
          </div>
        </div>

        <div className="random-film-trail">
          {trailPhotos.length > 0 ? (
            trailPhotos.map((photo, index) => (
              <div
                key={photo.id || index}
                className="random-film-trail__frame"
                onClick={() => handleFrameClick(photo, index + 1)}
                role="button"
              >
                <div className="random-film-trail__holes random-film-trail__holes--top">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <span key={`trail-top-${index}-${idx}`} />
                  ))}
                </div>
                <div className="random-film-trail__photo">
                  <LazyImage
                    src={
                      photo.size1024
                        ? `${API_CONFIG.BASE_URL}${photo.size1024}`
                        : photo.thumbnail
                          ? `${API_CONFIG.BASE_URL}${photo.thumbnail}`
                          : `${API_CONFIG.BASE_URL}${photo.original || ''}`
                    }
                    alt={photo.title || photo.filename || '随机照片'}
                    className="w-full h-full object-cover"
                    style={{
                      transform: `rotate(${getRotation(photo.orientation || photo._raw?.orientation)}deg)`
                    }}
                    lazyOptions={{ rootMargin: '150px', threshold: 0.1 }}
                  />
                </div>
                <div className="random-film-trail__holes random-film-trail__holes--bottom">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <span key={`trail-bottom-${index}-${idx}`} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">等待抽出更多胶片帧…</div>
          )}
        </div>
      </div>
    </div>
  );
};

RandomFilmStrip.propTypes = {
  filmRoll: PropTypes.object,
  photos: PropTypes.arrayOf(PropTypes.object),
  canisterState: PropTypes.oneOf(['idle', 'random', 'selected']).isRequired,
  filmState: PropTypes.oneOf(['folded', 'unrolled']).isRequired,
  onRandom: PropTypes.func.isRequired,
  isRandomizing: PropTypes.bool,
  onFrameClick: PropTypes.func,
  error: PropTypes.string
};

export default RandomFilmStrip;
