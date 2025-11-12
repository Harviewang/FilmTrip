const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const STORAGE_VARIANTS = ['RAW', 'WEB', 'THUMB', 'SHARE'];
const SHORT_CODE_LENGTH = 5;
const SHORT_LINK_PREFIX = (process.env.SHORT_LINK_PREFIX || 'https://filmtrip.app/s').replace(/\/$/, '');

const getStorageEnv = () => process.env.STORAGE_ENV || (process.env.NODE_ENV === 'production' ? 'prod' : 'dev');

const normalizeExtension = (ext = '') => {
  if (!ext) return '';
  return ext.startsWith('.') ? ext : `.${ext}`;
};

const ensureVariant = (variant) => {
  const normalized = (variant || '').toString().trim().toUpperCase() || 'WEB';
  if (!STORAGE_VARIANTS.includes(normalized)) {
    throw new Error(`INVALID_STORAGE_VARIANT:${normalized}`);
  }
  return normalized;
};

const calcHashes = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('HASH_BUFFER_REQUIRED');
  }
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');
  return { sha256, md5 };
};

const getHashedSegments = (input) => {
  const digest = crypto.createHash('sha1').update(input).digest('hex');
  return [digest.slice(0, 2), digest.slice(2, 4), digest.slice(4, 6)];
};

const generateObjectPath = ({ variant = 'WEB', extension = '' } = {}) => {
  const normalizedVariant = ensureVariant(variant);
  const ext = normalizeExtension(extension);
  const uuid = uuidv4();
  const segments = getHashedSegments(uuid);
  const env = getStorageEnv();
  const objectPath = `${env}/${normalizedVariant}/${segments.join('/')}/${uuid}${ext}`;
  return {
    uuid,
    objectPath,
    variant: normalizedVariant,
    segments,
    env
  };
};

const randomBase62 = (length) => {
  if (!length || length <= 0) {
    throw new Error('INVALID_BASE62_LENGTH');
  }
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = crypto.randomInt(0, BASE62_ALPHABET.length);
    result += BASE62_ALPHABET[index];
  }
  return result;
};

const generateShortCode = async ({ exists, baseLength = SHORT_CODE_LENGTH, maxAttempts = 10 } = {}) => {
  if (exists && typeof exists !== 'function') {
    throw new Error('SHORTCODE_EXISTS_FN_INVALID');
  }
  const length = baseLength || SHORT_CODE_LENGTH;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const candidate = randomBase62(length);
    if (!exists) {
      return candidate;
    }
    // 兼容同步和异步校验
    const taken = await Promise.resolve(exists(candidate));
    if (!taken) {
      return candidate;
    }
  }
  throw new Error('SHORTCODE_GENERATION_FAILED');
};

const buildShortLink = (shortCode) => {
  if (!shortCode) return null;
  return `${SHORT_LINK_PREFIX}/${shortCode}`;
};

module.exports = {
  STORAGE_VARIANTS,
  ensureVariant,
  calcHashes,
  generateObjectPath,
  generateShortCode,
  getStorageEnv,
  SHORT_CODE_LENGTH,
  SHORT_LINK_PREFIX,
  buildShortLink
};
