// API配置
const API_CONFIG = {
  // 根据环境自动选择API地址
  BASE_URL: import.meta.env.PROD 
    ? 'https://api.dbgou.com'
    : 'http://localhost:3001',
  
  // API端点
  API_BASE: import.meta.env.PROD 
    ? 'https://api.dbgou.com/api'
    : 'http://localhost:3001/api',
};

export default API_CONFIG;