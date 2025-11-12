const rawShortLinkPrefix = import.meta.env.VITE_SHORT_LINK_PREFIX || 'https://filmtrip.app/s';
const SHORT_LINK_PREFIX = rawShortLinkPrefix.replace(/\/$/, '');

// API配置
const API_CONFIG = {
  // 根据环境自动选择API地址
  BASE_URL: import.meta.env.PROD 
    ? 'https://api.filmtrip.imhw.top'
    : 'http://localhost:3001',
  
  // API端点
  API_BASE: import.meta.env.PROD 
    ? 'https://api.filmtrip.imhw.top/api'
    : 'http://localhost:3001/api',
  
  SHORT_LINK_PREFIX
};

export default API_CONFIG;