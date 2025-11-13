const axios = require('axios');
const crypto = require('crypto');

const TRUE_SET = new Set(['true', '1', 'yes', 'on']);

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  const normalized = value.toString().trim().toLowerCase();
  if (normalized.length === 0) {
    return defaultValue;
  }
  if (TRUE_SET.has(normalized)) {
    return true;
  }
  return false;
};

const sanitizeDomain = (value) => {
  if (!value) return '';
  let domain = value.trim();
  if (!domain) return '';
  domain = domain.replace(/\/+$/, '');
  // 如果域名已经包含协议，直接返回
  if (/^https?:\/\//i.test(domain)) {
    return domain;
  }
  // 对于测试域名 (test.upcdn.net)，默认使用 HTTP（开发环境）
  // 生产环境应该使用 HTTPS 和正式域名
  if (domain.includes('test.upcdn.net')) {
    return `http://${domain}`;
  }
  // 其他域名默认使用 HTTPS
  return `https://${domain}`;
};

const ensureLeadingSlash = (path) => {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
};

const stripLeadingSlash = (path) => {
  if (!path) return '';
  return path.startsWith('/') ? path.slice(1) : path;
};

const stripStylePrefix = (style) => {
  if (!style) return '';
  return style.replace(/^!+/, '').trim();
};

const getConfig = () => ({
  bucket: (process.env.UPYUN_BUCKET || '').trim(),
  operator: (process.env.UPYUN_OPERATOR || '').trim(),
  password: process.env.UPYUN_PASSWORD || '',
  formApiSecret: process.env.UPYUN_FORM_API_SECRET || '',
  cdnDomain: sanitizeDomain(process.env.UPYUN_CDN_DOMAIN || ''),
  imageProcessingEnabled: parseBoolean(process.env.UPYUN_IMAGE_PROCESSING_ENABLED, false),
  styles: {
    thumb: stripStylePrefix(process.env.UPYUN_STYLE_THUMB || 'thumb'),
    size1024: stripStylePrefix(process.env.UPYUN_STYLE_SIZE1024 || 'preview'),
    size2048: stripStylePrefix(process.env.UPYUN_STYLE_SIZE2048 || 'large'),
    watermark: stripStylePrefix(process.env.UPYUN_STYLE_WATERMARK || 'watermark')
  }
});

const isConfigured = () => {
  const cfg = getConfig();
  return Boolean(cfg.bucket && cfg.operator && cfg.password);
};

const isFormApiConfigured = () => {
  const cfg = getConfig();
  return isConfigured() && Boolean(cfg.formApiSecret);
};

const getPasswordDigest = () => {
  const cfg = getConfig();
  const source = cfg.password || '';
  return crypto.createHash('md5').update(source).digest('hex');
};

const buildSignatureString = ({ method, path, date, contentLength = 0, contentMd5 = '', includeBucket = true }) => {
  const cfg = getConfig();
  const canonicalMethod = (method || 'GET').toUpperCase();
  const normalizedPath = ensureLeadingSlash(path || '/');
  const canonicalPath = includeBucket ? `/${cfg.bucket}${normalizedPath}` : normalizedPath;
  const lengthString = contentLength === undefined || contentLength === null
    ? '0'
    : contentLength.toString();
  const md5String = contentMd5 || '';
  return [canonicalMethod, canonicalPath, date || '', lengthString, md5String].join('&');
};

const generateAuthorizationHeader = ({ method, path, date, contentLength = 0, contentMd5 = '', includeBucket = true }) => {
  if (!isConfigured()) {
    throw new Error('UPYUN_CONFIG_MISSING');
  }
  const passwordDigest = getPasswordDigest();
  const signatureBase = buildSignatureString({ method, path, date, contentLength, contentMd5, includeBucket });
  const hmac = crypto.createHmac('sha1', passwordDigest);
  hmac.update(signatureBase);
  const signature = hmac.digest('base64');
  const cfg = getConfig();
  return `UPYUN ${cfg.operator}:${signature}`;
};

const verifyAuthorization = ({ authorization, method, path, date, contentLength = 0, contentMd5 = '', includeBucket = true }) => {
  if (!authorization) return false;
  try {
    const expected = generateAuthorizationHeader({ method, path, date, contentLength, contentMd5, includeBucket });
    return authorization.trim() === expected.trim();
  } catch (error) {
    return false;
  }
};

const buildResourcePath = (objectPath, style) => {
  if (!objectPath) {
    throw new Error('UPYUN_RESOURCE_PATH_REQUIRED');
  }
  const cleanStyle = stripStylePrefix(style);
  const pathWithSlash = ensureLeadingSlash(stripLeadingSlash(objectPath));
  if (!cleanStyle) {
    return pathWithSlash;
  }
  return `${pathWithSlash}!${cleanStyle}`;
};

const getBucketEndpoint = () => {
  const cfg = getConfig();
  if (!cfg.bucket) {
    throw new Error('UPYUN_BUCKET_MISSING');
  }
  return `https://v0.api.upyun.com/${cfg.bucket}`;
};

const getBucketDomain = () => {
  const cfg = getConfig();
  if (!cfg.bucket) {
    throw new Error('UPYUN_BUCKET_MISSING');
  }
  return `https://${cfg.bucket}.b0.upaiyun.com`;
};

const buildCdnUrl = (objectPath, style) => {
  const cfg = getConfig();
  // 如果样式配置为空，直接使用原始文件路径（不使用样式）
  // 这样可以避免404错误，直到又拍云样式配置完成
  if (!style || !style.trim()) {
    const base = cfg.cdnDomain || getBucketDomain();
    const path = ensureLeadingSlash(objectPath);
    return `${base}${path}`;
  }
  const resourcePath = buildResourcePath(objectPath, style);
  const base = cfg.cdnDomain || getBucketDomain();
  return `${base}${resourcePath}`;
};

const generateSignedUrl = (objectPath, { expiresIn = 300, style, useCdn = false } = {}) => {
  if (!isConfigured()) {
    throw new Error('UPYUN_CONFIG_MISSING');
  }
  const resourcePath = buildResourcePath(objectPath, style);
  const expire = Math.floor(Date.now() / 1000) + Math.max(1, expiresIn);
  const cfg = getConfig();
  const tokenSource = `${resourcePath}&${expire}&${cfg.password}`;
  const token = crypto.createHash('md5').update(tokenSource).digest('hex');
  const base = useCdn && cfg.cdnDomain ? cfg.cdnDomain : getBucketDomain();
  return `${base}${resourcePath}?_upt=${token}.${expire}`;
};

const generatePolicy = ({
  saveKey,
  fileSize,
  mime,
  notifyUrl,
  returnUrl,
  expirationSeconds = 300,
  allowFileTypes,
  metadata,
  useAuthorizationHeader = false // 新增：是否使用 authorization header
} = {}) => {
  if (!isConfigured()) {
    throw new Error('UPYUN_CONFIG_MISSING');
  }
  const cfg = getConfig();
  const expiration = Math.floor(Date.now() / 1000) + Math.max(10, expirationSeconds);
  const maxSize = Math.max(1, fileSize || 50 * 1024 * 1024);
  const date = new Date().toUTCString();
  const policy = {
    bucket: cfg.bucket,
    'save-key': saveKey,
    expiration
  };
  
  // 如果使用 authorization header，不需要 date 字段
  if (!useAuthorizationHeader) {
    policy['date'] = date;
  }
  
  policy['content-length-range'] = `0,${maxSize}`;
  
  if (mime) {
    policy['content-type'] = mime;
  }
  if (notifyUrl) {
    policy['notify-url'] = notifyUrl;
  }
  if (returnUrl) {
    policy['return-url'] = returnUrl;
  }
  if (Array.isArray(allowFileTypes) && allowFileTypes.length > 0) {
    policy['allow-file-type'] = allowFileTypes.join(',');
  }
  if (metadata && typeof metadata === 'object') {
    Object.entries(metadata).forEach(([key, value]) => {
      policy[`x-upyun-meta-${key}`] = value;
    });
  }
  
  const policyEncoded = Buffer.from(JSON.stringify(policy)).toString('base64');
  
  let signature = null;
  let authorization = null;
  
  if (useAuthorizationHeader) {
    // 使用 authorization header 方式（新方式，使用 password）
    const passwordDigest = getPasswordDigest();
    const signatureBase = `POST&/${cfg.bucket}/&${date}&0&`;
    const hmac = crypto.createHmac('sha1', passwordDigest);
    hmac.update(signatureBase);
    const sig = hmac.digest('base64');
    authorization = `UPYUN ${cfg.operator}:${sig}`;
  } else {
    // 使用 policy + signature 方式（旧方式，需要 formApiSecret）
    if (!cfg.formApiSecret) {
      throw new Error('UPYUN_FORM_API_SECRET_MISSING');
    }
    signature = crypto
      .createHash('md5')
      .update(`${policyEncoded}&${cfg.formApiSecret}`)
      .digest('hex');
  }
  
  return {
    policy: policyEncoded,
    signature,
    authorization,
    date: useAuthorizationHeader ? date : undefined,
    bucket: cfg.bucket,
    saveKey,
    expiration,
    processingEnabled: cfg.imageProcessingEnabled,
    useAuthorizationHeader
  };
};

const deleteObject = async (objectPath) => {
  if (!isConfigured()) {
    throw new Error('UPYUN_CONFIG_MISSING');
  }
  const cfg = getConfig();
  const resource = ensureLeadingSlash(objectPath);
  const url = `${getBucketEndpoint()}${resource}`;
  const method = 'DELETE';
  const date = new Date().toUTCString();
  const authorization = generateAuthorizationHeader({
    method,
    path: resource,
    date,
    contentLength: 0,
    contentMd5: '',
    includeBucket: true
  });
  await axios({
    method,
    url,
    headers: {
      Authorization: authorization,
      Date: date
    }
  });
};

const purgeUrls = async (urls = []) => {
  if (!isConfigured()) {
    throw new Error('UPYUN_CONFIG_MISSING');
  }
  const sanitized = Array.isArray(urls)
    ? urls.map((item) => (item || '').toString().trim()).filter((item) => item.length > 0)
    : [];
  if (sanitized.length === 0) {
    throw new Error('UPYUN_PURGE_URLS_REQUIRED');
  }
  const endpoint = 'https://purge.upyun.com/purge/';
  const method = 'POST';
  const date = new Date().toUTCString();
  const body = new URLSearchParams({ purge: sanitized.join('\n') }).toString();
  const contentLength = Buffer.byteLength(body);
  const authorization = generateAuthorizationHeader({
    method,
    path: '/purge/',
    date,
    contentLength,
    contentMd5: '',
    includeBucket: false
  });
  const response = await axios({
    method,
    url: endpoint,
    headers: {
      Authorization: authorization,
      Date: date,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: body
  });
  return response.data;
};

const verifyCallbackRequest = ({ method, path, headers }) => {
  if (!isConfigured()) {
    return true;
  }
  if (!headers) {
    return false;
  }
  const authorization = headers.authorization || headers.Authorization;
  const date = headers.date || headers.Date;
  const contentLength = headers['content-length'] || headers['Content-Length'] || '0';
  const contentMd5 = headers['content-md5'] || headers['Content-MD5'] || '';
  if (!authorization || !date) {
    return false;
  }
  return verifyAuthorization({
    authorization,
    method,
    path,
    date,
    contentLength,
    contentMd5,
    includeBucket: false
  });
};

const isImageProcessingEnabled = () => {
  const cfg = getConfig();
  return isConfigured() && cfg.imageProcessingEnabled;
};

const getStyleName = (key) => {
  const cfg = getConfig();
  return cfg.styles[key] || '';
};

const getCdnDomain = () => {
  const cfg = getConfig();
  return cfg.cdnDomain;
};

const shouldUseCdn = () => isConfigured() && Boolean(getCdnDomain());

module.exports = {
  getConfig,
  isConfigured,
  isFormApiConfigured,
  isImageProcessingEnabled,
  getStyleName,
  getCdnDomain,
  getBucketDomain,
  shouldUseCdn,
  buildCdnUrl,
  generatePolicy,
  generateSignedUrl,
  deleteObject,
  purgeUrls,
  verifyCallbackRequest,
  generateAuthorizationHeader,
  buildResourcePath
};

