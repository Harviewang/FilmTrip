const rawShortLinkPrefix = import.meta.env.VITE_SHORT_LINK_PREFIX || (import.meta.env.PROD ? 'https://filmtrip.cn/s' : 'http://localhost:3002/s');
const SHORT_LINK_PREFIX = rawShortLinkPrefix.replace(/\/$/, '');

// API配置
const API_CONFIG = {
  // 根据环境自动选择API地址
  BASE_URL: import.meta.env.PROD 
    ? 'https://api.filmtrip.cn'
    : 'http://localhost:3001',
  
  // API端点
  API_BASE: import.meta.env.PROD 
    ? 'https://api.filmtrip.cn/api'
    : 'http://localhost:3001/api',
  
  SHORT_LINK_PREFIX,
  UPYUN_DIRECT_UPLOAD_ENABLED:
    (import.meta.env.VITE_UPYUN_DIRECT_UPLOAD || import.meta.env.VITE_APP_UPYUN_DIRECT_UPLOAD || 'false')
      .toString()
      .toLowerCase() === 'true'
};

export default API_CONFIG;