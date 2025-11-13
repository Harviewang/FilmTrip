# 照片列表过滤修复

## 日期
2025-11-13

## 问题描述

用户提出：**只有图片上传成功了，才能显示在图片列表中**。

当前问题：
1. 占位符记录（上传失败）仍然显示在照片列表中
2. 前端显示无法加载的图片，造成用户困惑
3. 占位符记录应该只在回调成功后才显示

## 解决方案

### 1. 过滤占位符记录
在照片列表查询中，过滤掉占位符记录：
- 如果 `origin_bucket` 匹配又拍云 bucket，且 `origin_path` 为 `null`，则不显示
- 本地存储的照片不受影响（只要 `filename` 有值就显示）
- 通过 `short_code` 查询单张照片时，不过滤（允许查看占位符状态）

### 2. 过滤逻辑
```sql
NOT (p.origin_bucket = ? AND (p.origin_path IS NULL OR p.origin_path = ''))
```

### 3. 应用范围
- `getAllPhotos`：照片列表查询
- `getRandomPhotos`：随机照片查询
- `getPhotoById`：单张照片查询（不过滤，允许查看占位符）

## 修复内容

### 1. getAllPhotos 过滤逻辑
**文件**: `backend/controllers/photoController.js`

**修改**:
- 在 WHERE 条件中添加占位符过滤
- 只有当 `short_code` 查询时，不过滤（允许查看单张照片）

```javascript
// 过滤占位符记录：只显示上传成功的照片
if (!shortCodeFilter) {
  const upyunBucket = upyunService.isConfigured() ? upyunService.getConfig().bucket : null;
  if (upyunBucket) {
    // 又拍云已配置：过滤掉占位符记录（origin_bucket=upyunBucket 但 origin_path=null）
    whereConditions.push(`
      NOT (p.origin_bucket = ? AND (p.origin_path IS NULL OR p.origin_path = ''))
    `);
    queryParams.push(upyunBucket);
  }
}
```

### 2. getRandomPhotos 过滤逻辑
**文件**: `backend/controllers/photoController.js`

**修改**:
- 在 WHERE 条件中添加占位符过滤
- 与 `getAllPhotos` 使用相同的过滤逻辑

```javascript
// 过滤占位符记录：只显示上传成功的照片
if (upyunBucket) {
  whereConditions.push(`
    NOT (p.origin_bucket = ? AND (p.origin_path IS NULL OR p.origin_path = ''))
  `);
  queryParams.push(upyunBucket);
}
```

### 3. getPhotoById 不过滤
**文件**: `backend/controllers/photoController.js`

**说明**:
- 单张照片查询不过滤占位符
- 允许查看占位符状态（例如：上传失败后查看详情）

## 测试场景

### 1. 占位符照片（又拍云）
- `origin_bucket`: `filmtrip-dev`
- `origin_path`: `null`
- **结果**: 不显示 ✅

### 2. 上传成功的又拍云照片
- `origin_bucket`: `filmtrip-dev`
- `origin_path`: `dev/WEB/test/path.jpg`
- **结果**: 显示 ✅

### 3. 本地存储照片
- `origin_bucket`: `null` 或 `local-dev`
- `origin_path`: `null`
- `filename`: `test.jpg`
- **结果**: 显示 ✅

### 4. 通过 short_code 查询
- 即使占位符记录，也可以通过 `short_code` 查询
- **结果**: 显示（允许查看占位符状态）✅

## 相关文档

### 又拍云 FORM API 文档
- [又拍云 FORM API 文档](https://help.upyun.com/knowledge-base/form_api/)
- 文档中没有明确说明如何启用 FORM API
- FORM API 默认启用，只需要配置正确的表单 API 密钥

### 又拍云 FORM API 配置
1. 登录又拍云控制台
2. 进入 bucket 设置
3. 查看表单上传 API 密钥
4. 配置 `UPYUN_FORM_API_SECRET` 环境变量

### 回调通知
- 上传成功后，又拍云会调用 `notify-url` 回调
- 回调成功后，`origin_path` 会被设置
- 只有回调成功，照片才会显示在列表中

## 相关文件

- `backend/controllers/photoController.js` - 照片查询逻辑
- `backend/storage/photoPlaceholderService.js` - 占位符创建逻辑
- `backend/controllers/storageController.js` - 回调处理逻辑

## 参考

- [又拍云 FORM API 文档](https://help.upyun.com/knowledge-base/form_api/)
- [占位符照片问题修复](./placeholder-photo-fix.md)

