import API_CONFIG from '../config/api.js';

const SHORT_LINK_PREFIX_RAW = API_CONFIG.SHORT_LINK_PREFIX || (import.meta.env.PROD ? 'https://filmtrip.cn/s' : 'http://localhost:3002/s');
export const SHORT_LINK_PREFIX = SHORT_LINK_PREFIX_RAW.replace(/\/$/, '');
export const SHORT_LINK_ROUTE_PREFIX = '/s';

export const normalizeShortCode = (value) => {
  if (!value) return '';
  return value.toString().trim().replace(/^\/?s\//i, '').replace(/^\/+/, '').slice(0, 8);
};

export const buildShortLinkFromCode = (code) => {
  const normalized = normalizeShortCode(code);
  if (!normalized) return null;
  return `${SHORT_LINK_PREFIX}/${normalized}`;
};

export const buildShortLinkPath = (code) => {
  const normalized = normalizeShortCode(code);
  if (!normalized) return null;
  return `${SHORT_LINK_ROUTE_PREFIX}/${normalized}`;
};

export const getPhotoShortCode = (photo) => {
  if (!photo) return '';
  return normalizeShortCode(
    photo.shortCode || photo.short_code || photo.shortcode || photo?.codes?.short || photo?._raw?.short_code
  );
};

export const resolvePhotoShortLink = (photo) => {
  const code = getPhotoShortCode(photo);
  return buildShortLinkFromCode(code);
};

export const extractShortCodeFromPath = (pathname) => {
  if (!pathname) return null;
  const match = pathname.match(/^\/s\/([0-9A-Za-z]{5,8})$/);
  return match ? match[1] : null;
};
