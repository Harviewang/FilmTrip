const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const STORAGE_VARIANTS = ['RAW', 'WEB', 'THUMB', 'SHARE'];
const SHORT_CODE_LENGTH = 5;
const SHORT_LINK_PREFIX = (process.env.SHORT_LINK_PREFIX || (process.env.NODE_ENV === 'production' ? 'https://filmtrip.cn/s' : 'http://localhost:3002/s')).replace(/\/$/, '');

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

/**
 * 生成简化版的对象路径（减少信息泄露）
 * 新格式: {hash_prefix_2}/{hash}.{ext}
 * 例如: a7/b3c8f9e2d1a4b5c6d7e8f9a0b1c2d3e4.jpg
 * 
 * 优点：
 * - 隐藏环境信息（dev/prod）
 * - 隐藏类型信息（WEB/RAW等）
 * - 隐藏UUID
 * - 保留2级目录结构（避免单目录文件过多）
 */
const generateObjectPath = ({ variant = 'WEB', extension = '', shortCode = null } = {}) => {
  const normalizedVariant = ensureVariant(variant);
  const ext = normalizeExtension(extension);
  
  // 如果提供了short_code，使用short_code作为文件名（最简洁）
  if (shortCode) {
    // 使用short_code的前2个字符作为目录前缀，保持目录结构
    const prefix = shortCode.slice(0, 2);
    const objectPath = `${prefix}/${shortCode}${ext}`;
    return {
      shortCode,
      objectPath,
      variant: normalizedVariant,
      segments: [prefix],
      env: null // 不暴露环境信息
    };
  }
  
  // 否则使用UUID生成hash路径
  const uuid = uuidv4();
  const hash = crypto.createHash('sha256').update(uuid).digest('hex');
  // 使用hash的前2个字符作为目录前缀
  const prefix = hash.slice(0, 2);
  // 使用hash的前32个字符作为文件名（避免UUID泄露）
  const fileName = hash.slice(0, 32);
  const objectPath = `${prefix}/${fileName}${ext}`;
  
  return {
    uuid,
    objectPath,
    variant: normalizedVariant,
    segments: [prefix],
    env: null // 不暴露环境信息
  };
};

/**
 * 旧版路径生成（保留兼容性，但不推荐使用）
 * 格式: {env}/{variant}/{segments}/{uuid}.{ext}
 */
const generateObjectPathLegacy = ({ variant = 'WEB', extension = '' } = {}) => {
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
  generateObjectPathLegacy, // 保留旧版，但不推荐使用
  generateShortCode,
  getStorageEnv,
  SHORT_CODE_LENGTH,
  SHORT_LINK_PREFIX,
  buildShortLink
};
