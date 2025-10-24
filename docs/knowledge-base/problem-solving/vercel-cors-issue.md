# Vercel部署CORS问题复盘

**日期**: 2025-10-24  
**问题类型**: 部署配置、CORS跨域  
**影响范围**: 生产环境前端无法访问后端API

---

## 🚨 问题描述

### 现象
- ✅ 前端页面 `https://filmtrip.imhw.top` 可以正常打开
- ❌ 照片列表无法加载，显示空白
- ❌ 无法登录管理后台
- ✅ 后端API `https://api.filmtrip.imhw.top` 单独访问正常

### 错误信息
浏览器控制台显示CORS跨域错误：
```
Access to fetch at 'https://api.filmtrip.imhw.top/api/photos' from origin 'https://filmtrip.imhw.top' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🔍 问题根因

**CORS配置缺失生产环境域名**

在 `backend/index.js` 的CORS配置中，只包含了开发环境域名：
```javascript
const allowedOrigins = [
  'http://localhost:3000',  // 前端开发服务器
  'http://localhost:3002',  // 管理后台开发服务器
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002'
  // ❌ 缺少生产环境域名
];
```

---

## ✅ 解决方案

### 1. 更新CORS配置
在 `backend/index.js` 中添加生产环境域名：

```javascript
const allowedOrigins = [
  'http://localhost:3000',  // 前端开发服务器
  'http://localhost:3002',  // 管理后台开发服务器
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  'https://filmtrip.imhw.top',  // 生产环境前端
  'https://filmtrip.cn'  // 备用生产环境前端
];
```

### 2. 重新部署后端
```bash
cd backend && vercel --prod
```

### 3. 验证修复
```bash
curl -H "Origin: https://filmtrip.imhw.top" -I "https://api.filmtrip.imhw.top/api/photos"
```

期望返回：
```
access-control-allow-origin: https://filmtrip.imhw.top
```

---

## 📋 预防措施

### 1. 域名管理清单
每次新增域名时，需要同步更新以下位置：

**后端CORS配置** (`backend/index.js`):
```javascript
const allowedOrigins = [
  // 开发环境
  'http://localhost:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  
  // 生产环境
  'https://filmtrip.imhw.top',
  'https://filmtrip.cn',
  // ⚠️ 新增域名时在此处添加
];
```

**前端API配置** (`frontend/src/config/api.js`):
```javascript
const API_CONFIG = {
  BASE_URL: import.meta.env.PROD 
    ? 'https://api.filmtrip.imhw.top'  // ⚠️ 确保与后端域名一致
    : 'http://localhost:3001',
};
```

**Vercel自定义域名**:
- 前端: `filmtrip.imhw.top` → `https://filmtrip.imhw.top`
- 后端: `api.filmtrip.imhw.top` → `https://api.filmtrip.imhw.top`

### 2. 部署检查清单
每次部署后需要验证：

- [ ] 前端页面可以正常打开
- [ ] 照片列表可以正常加载
- [ ] 登录功能正常工作
- [ ] CORS头信息正确返回
- [ ] 所有API端点响应正常

### 3. 环境变量配置
考虑使用环境变量管理域名：

```javascript
// 在Vercel项目设置中添加环境变量
CORS_ALLOWED_ORIGINS=https://filmtrip.imhw.top,https://filmtrip.cn
```

然后在代码中使用：
```javascript
const additionalOrigins = process.env.CORS_ALLOWED_ORIGINS;
if (additionalOrigins) {
  const extraOrigins = additionalOrigins.split(',').map(origin => origin.trim());
  allowedOrigins.push(...extraOrigins);
}
```

---

## 🔧 相关文件

- `backend/index.js` - CORS配置
- `frontend/src/config/api.js` - API地址配置
- `backend/vercel.json` - 后端部署配置
- `frontend/vercel.json` - 前端部署配置

---

## 📚 参考文档

- [Vercel CORS配置指南](https://vercel.com/docs/concepts/functions/serverless-functions/cors)
- [Express CORS中间件文档](https://expressjs.com/en/resources/middleware/cors.html)
- [MDN CORS文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**修复时间**: 2025-10-24  
**修复人员**: Claude (Anthropic Sonnet 4.5) in Cursor  
**验证状态**: ✅ 已修复并验证通过
