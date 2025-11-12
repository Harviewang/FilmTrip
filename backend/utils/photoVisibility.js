const jwt = require('jsonwebtoken');
const { buildShortLink } = require('../storage/namingService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const buildVariantUrls = (filename) => {
  if (!filename || typeof filename !== 'string' || !filename.trim()) {
    return {
      original: null,
      thumbnail: null,
      size1024: null,
      size2048: null
    };
  }
  const safeName = filename.trim();
  const baseName = safeName.replace(/\.[^.]+$/, '');
  return {
    original: `/uploads/${safeName}`,
    thumbnail: `/uploads/thumbnails/${baseName}_thumb.jpg`,
    size1024: `/uploads/size1024/${baseName}_1024.jpg`,
    size2048: `/uploads/size2048/${baseName}_2048.jpg`
  };
};

const normalizeBooleanFlag = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return ['1', 'true', 'yes', 'on'].includes(normalized);
  }
  return false;
};

const resolveIsAdmin = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) return false;
    if (Array.isArray(decoded.roles)) {
      return decoded.roles.includes('admin');
    }
    return decoded.username === 'admin';
  } catch (error) {
    console.warn('[photoVisibility] Token 验证失败，按访客处理:', error.message);
    return false;
  }
};

const sanitizePhotoForViewer = (photo, { isAdmin } = {}) => {
  const variants = buildVariantUrls(photo.filename);
  const photoProtected = normalizeBooleanFlag(photo.is_protected);
  const rollProtected = normalizeBooleanFlag(photo.roll_is_protected);
  const effectiveProtection = photoProtected || rollProtected;
  const protectionLevel = photo.protection_level || photo.roll_protection_level || null;
  const allowVariants = isAdmin || !effectiveProtection;

  const safeRaw = allowVariants
    ? { ...photo, variants }
    : {
        ...photo,
        filename: undefined,
        original: undefined,
        thumbnail: undefined,
        size1024: undefined,
        size2048: undefined,
        variants: undefined
      };

  const sanitized = {
    ...photo,
    filename: allowVariants ? photo.filename : null,
    original: allowVariants ? variants.original : null,
    thumbnail: allowVariants ? variants.thumbnail : null,
    size1024: allowVariants ? variants.size1024 : null,
    size2048: allowVariants ? variants.size2048 : null,
    shortCode: photo.short_code,
    short_code: photo.short_code,
    short_link: buildShortLink(photo.short_code),
    is_protected: photoProtected,
    roll_is_protected: rollProtected,
    protection_level: protectionLevel,
    roll_protection_level: photo.roll_protection_level,
    effective_protection: effectiveProtection,
    _raw: safeRaw
  };

  return sanitized;
};

module.exports = {
  buildVariantUrls,
  normalizeBooleanFlag,
  resolveIsAdmin,
  sanitizePhotoForViewer
};

