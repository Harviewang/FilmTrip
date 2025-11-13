# 又拍云图片加载问题修复

## 日期
2025-11-13

## 问题描述

用户反馈有2张照片加载失败，显示"加载失败"占位符。

## 问题分析

### 1. 问题照片
- `03da5191-d768-4e62-88fa-4a1981cb3f78.jpg` (ID: `f8f787a3-3ed1-405f-8294-dd134ba7e027`)
- `path.jpg` (ID: `e21b7c52-0b58-4e0c-9bff-fdd072fc34c6`)

### 2. 问题原因
1. **前端代码问题**：
   - 前端代码总是使用 `${API_CONFIG.BASE_URL}${photo.size1024 || photo.thumbnail}` 来构建图片 URL
   - 对于又拍云 CDN URL（完整 URL，如 `https://filmtrip-dev.test.upcdn.net/...`），这会错误地拼接成：
     - `http://localhost:3001/https://filmtrip-dev.test.upcdn.net/...` ❌
   - 对于本地路径（相对路径，如 `/uploads/thumbnails/...`），这会正确拼接成：
     - `http://localhost:3001/uploads/thumbnails/...` ✅

2. **照片存储位置**：
   - 这两张照片的 `origin_bucket` 是 `filmtrip-dev`，存储在又拍云
   - 它们使用又拍云 CDN URL（`https://filmtrip-dev.test.upcdn.net/...`）
   - 本地文件不存在（❌）

3. **又拍云 CDN 访问问题**：
   - 测试域名 `filmtrip-dev.test.upcdn.net` 可能无法访问
   - 或者 SSL 证书问题
   - 或者文件不存在于又拍云

## 修复方案

### 1. 前端代码修复
修改 `frontend/src/pages/Gallery/index.jsx` 中的图片 URL 构建逻辑：

**修复前**：
```javascript
src={`${API_CONFIG.BASE_URL}${photo.size1024 || photo.thumbnail}?v=${stableTimestamp}`}
```

**修复后**：
```javascript
src={(() => {
  const imageUrl = photo.size1024 || photo.thumbnail;
  if (!imageUrl) return '';
  // 如果是完整的 URL（又拍云 CDN），直接使用
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return `${imageUrl}?v=${stableTimestamp}`;
  }
  // 如果是相对路径（本地文件），拼接 BASE_URL
  return `${API_CONFIG.BASE_URL}${imageUrl}?v=${stableTimestamp}`;
})()}
```

### 2. 修复位置
- `AdaptiveCard` 组件中的 `LazyImage`（第796行）
- 瀑布流视图中的 `img` 标签（第1186行）

### 3. 修复效果
- ✅ 完整 URL（又拍云 CDN）会直接使用，不会拼接 `BASE_URL`
- ✅ 相对路径（本地文件）会正确拼接 `BASE_URL`
- ✅ 支持混合模式（又拍云 + 本地存储）

## 测试结果

### 1. API 响应
- 受保护照片：`thumbnail` (top-level) = `null`，`variants.thumbnail` = `/uploads/thumbnails/...`
- 未受保护照片：`thumbnail` (top-level) = `/uploads/thumbnails/...` 或 `https://filmtrip-dev.test.upcdn.net/...`
- 又拍云照片：`variants.thumbnail` = `https://filmtrip-dev.test.upcdn.net/...`

### 2. 前端代码
- ✅ 已修复图片 URL 构建逻辑
- ✅ 支持完整 URL 和相对路径
- ✅ 支持又拍云 CDN 和本地存储

### 3. 待验证
- [ ] 又拍云 CDN URL 是否可以访问
- [ ] 图片是否正常显示
- [ ] 是否需要配置 CORS 或其他网络设置

## 后续优化建议

### 1. 又拍云 CDN 访问
- 检查又拍云 CDN 域名配置是否正确
- 检查 SSL 证书是否有效
- 检查文件是否存在于又拍云
- 检查网络连接是否正常

### 2. 错误处理
- 添加图片加载失败的回退机制
- 添加网络错误的错误提示
- 添加重试机制

### 3. 性能优化
- 添加图片预加载
- 添加图片懒加载
- 添加图片缓存

## 相关文件

- `frontend/src/pages/Gallery/index.jsx` - 前端图片显示逻辑
- `frontend/src/config/api.js` - API 配置
- `backend/controllers/photoController.js` - 后端图片 URL 生成逻辑
- `backend/storage/upyunService.js` - 又拍云服务

## 参考

- [又拍云 CDN 文档](https://help.upyun.com/knowledge-base/cdn/)
- [又拍云图片处理文档](https://help.upyun.com/knowledge-base/image/)

