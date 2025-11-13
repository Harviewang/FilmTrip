# 又拍云上传和加载状态说明

## 日期
2025-11-13

## 当前配置状态

### 后端配置
- ✅ **UPYUN_DIRECT_UPLOAD_ENABLED**: `true` - 已启用又拍云直传
- ✅ **UPYUN_IMAGE_PROCESSING_ENABLED**: `true` - 已启用又拍云图片处理
- ✅ **UPYUN_BUCKET**: `filmtrip-dev`
- ✅ **UPYUN_CDN_DOMAIN**: `https://filmtrip-dev.test.upcdn.net`

### 前端配置
- ⚠️ **VITE_UPYUN_DIRECT_UPLOAD**: 未设置（需要在前端 `.env` 文件中设置）
- ⚠️ **前端默认值**: `false`（如果未设置环境变量）

## 上传行为分析

### 1. 照片上传流程

#### 当前状态
- **后端**: `UPYUN_DIRECT_UPLOAD_ENABLED=true`
  - 后端会拒绝传统上传方式（`POST /api/photos` 上传文件）
  - 后端会返回错误：`系统已启用又拍云直传，请先调用 /api/storage/policy 获取上传策略并直传`

- **前端**: `DIRECT_UPLOAD_ENABLED` 依赖于 `VITE_UPYUN_DIRECT_UPLOAD` 环境变量
  - 如果 `VITE_UPYUN_DIRECT_UPLOAD=true`，前端会使用又拍云直传流程
  - 如果 `VITE_UPYUN_DIRECT_UPLOAD=false` 或未设置，前端会尝试使用传统上传方式（会被后端拒绝）

#### 上传流程

**又拍云直传流程（推荐）**：
1. 前端调用 `POST /api/storage/policy` 获取上传策略
2. 前端直接上传文件到又拍云（`https://v0.api.upyun.com/filmtrip-dev/`）
3. 又拍云回调后端（`POST /api/storage/callback`）
4. 后端更新照片记录（设置 `origin_path`、`origin_bucket` 等）

**传统上传流程（已禁用）**：
1. 前端上传文件到后端（`POST /api/photos`）
2. 后端保存文件到本地磁盘
3. 后端处理图片（生成缩略图等）
4. 后端保存照片记录到数据库

### 2. 图片加载流程

#### 当前状态
- **后端**: `UPYUN_IMAGE_PROCESSING_ENABLED=true`
- **图片 URL 生成逻辑**：
  ```javascript
  if (photo && upyunService.isImageProcessingEnabled() && photo.origin_path) {
    // 使用又拍云 CDN URL
    return upyunService.buildCdnUrl(objectPath, style);
  } else {
    // 使用本地路径
    return `/uploads/${filename}`;
  }
  ```

#### 加载行为

**又拍云 CDN URL（当 `origin_path` 存在时）**：
- 原始图片：`https://filmtrip-dev.test.upcdn.net/{origin_path}`
- 缩略图：`https://filmtrip-dev.test.upcdn.net/{origin_path}!thumb`
- 1024尺寸：`https://filmtrip-dev.test.upcdn.net/{origin_path}!preview`
- 2048尺寸：`https://filmtrip-dev.test.upcdn.net/{origin_path}!large`
- 水印图片：`https://filmtrip-dev.test.upcdn.net/{origin_path}!watermark`（受保护照片）

**本地路径（当 `origin_path` 不存在时）**：
- 原始图片：`/uploads/{filename}`
- 缩略图：`/uploads/thumbnails/{baseName}_thumb.jpg`
- 1024尺寸：`/uploads/size1024/{baseName}_1024.jpg`
- 2048尺寸：`/uploads/size2048/{baseName}_2048.jpg`

## 现有照片状态

### 数据库统计
- **总照片数**: 110
- **有 origin_path (又拍云)**: 109
- **无 origin_path (本地)**: 1

### 问题分析
- 现有照片虽然有 `origin_path`，但是 `origin_bucket` 是 `local-dev`，不是 `filmtrip-dev`
- 这意味着这些照片的 `origin_path` 可能是在本地存储时生成的路径，而不是又拍云的实际路径
- 如果直接使用这些 `origin_path` 构建又拍云 CDN URL，可能会导致 404 错误

## 问题与解决方案

### 问题 1: 前端环境变量未设置
**问题**: 前端 `VITE_UPYUN_DIRECT_UPLOAD` 未设置，可能导致前端尝试使用传统上传方式

**解决方案**: 在前端 `.env` 文件中设置：
```env
VITE_UPYUN_DIRECT_UPLOAD=true
```

### 问题 2: 现有照片的 origin_path 可能不正确
**问题**: 现有照片的 `origin_path` 和 `origin_bucket` 可能是在本地存储时生成的，不是又拍云的实际路径

**解决方案**: 
1. 检查现有照片是否真的在又拍云上
2. 如果不在，需要迁移现有照片到又拍云
3. 更新数据库中的 `origin_bucket` 为 `filmtrip-dev`
4. 确保 `origin_path` 是正确的又拍云路径

### 问题 3: 图片加载可能失败
**问题**: 如果现有照片的 `origin_path` 不正确，使用又拍云 CDN URL 加载图片可能会失败

**解决方案**: 
1. 检查 `buildVariantUrls` 函数的逻辑
2. 如果 `origin_bucket` 不是又拍云的 bucket，应该使用本地路径
3. 或者添加检查：只有当 `origin_bucket` 匹配又拍云 bucket 时才使用 CDN URL

## 建议的改进

### 1. 改进图片 URL 生成逻辑
```javascript
const buildVariantUrls = (photoOrFilename) => {
  // ...
  if (
    photo &&
    upyunService.isImageProcessingEnabled() &&
    photo.origin_path &&
    photo.origin_bucket === upyunService.getConfig().bucket  // 添加 bucket 检查
  ) {
    // 使用又拍云 CDN URL
    return upyunService.buildCdnUrl(objectPath, style);
  }
  // 否则使用本地路径
  return localPaths;
};
```

### 2. 添加前端环境变量配置
创建 `frontend/.env` 文件：
```env
VITE_UPYUN_DIRECT_UPLOAD=true
```

### 3. 添加照片迁移脚本
创建脚本将现有照片迁移到又拍云：
- 检查照片是否在又拍云上
- 如果不在，上传到又拍云
- 更新数据库中的 `origin_bucket` 和 `origin_path`

## 测试建议

### 1. 测试新照片上传
- [ ] 测试前端直传流程
- [ ] 验证照片是否正确上传到又拍云
- [ ] 验证回调是否正确处理
- [ ] 验证照片记录是否正确更新

### 2. 测试图片加载
- [ ] 测试新上传照片的图片加载
- [ ] 测试现有照片的图片加载
- [ ] 验证又拍云 CDN URL 是否正确
- [ ] 验证本地路径是否正确回退

### 3. 测试图片样式
- [ ] 测试缩略图样式
- [ ] 测试 1024 尺寸样式
- [ ] 测试 2048 尺寸样式
- [ ] 测试水印样式（受保护照片）

## 相关文档

- [又拍云配置说明](./upyun-config-notes.md)
- [又拍云配置状态](./upyun-config-status.md)
- [又拍云测试结果](./upyun-test-results.md)
- [又拍云接入规范](../specifications/storage/upyun-integration.md)

