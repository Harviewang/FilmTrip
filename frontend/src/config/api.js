const rawShortLinkPrefix = import.meta.env.VITE_SHORT_LINK_PREFIX || (import.meta.env.PROD ? 'https://filmtrip.cn/s' : 'http://localhost:3002/s');
const SHORT_LINK_PREFIX = rawShortLinkPrefix.replace(/\/$/, '');

// API配置
// 优先使用环境变量，否则根据环境自动选择
const API_CONFIG = {
  // 根据环境自动选择API地址
  BASE_URL: import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.PROD 
      ? 'https://api.filmtrip.imhw.top'  // 测试环境使用 imhw.top
      : 'http://localhost:3001'
  ),
  
  // API端点
  API_BASE: import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.PROD 
      ? 'https://api.filmtrip.imhw.top/api'  // 测试环境使用 imhw.top
      : 'http://localhost:3001/api'
  ),
  
  SHORT_LINK_PREFIX,
  UPYUN_DIRECT_UPLOAD_ENABLED:
    (import.meta.env.VITE_UPYUN_DIRECT_UPLOAD || import.meta.env.VITE_APP_UPYUN_DIRECT_UPLOAD || 'false')
      .toString()
      .toLowerCase() === 'true'
};

export default API_CONFIG;