# 又拍云上传和加载当前状态

## 日期
2025-11-13

## 回答您的问题

### 问题：现在本地上传照片和加载图片会在又拍云上上传吗？

**答案**：

1. **新上传的照片**：
   - ✅ **如果前端配置正确**：会使用又拍云直传，照片会上传到又拍云
   - ⚠️ **如果前端未配置**：前端会尝试传统上传，但会被后端拒绝

2. **加载图片**：
   - ✅ **新上传的照片**（`origin_bucket=filmtrip-dev`）：会使用又拍云 CDN URL 加载
   - ✅ **现有照片**（`origin_bucket=local-dev` 或 `NULL`）：会使用本地路径加载

## 当前配置状态

### 后端配置
- ✅ **UPYUN_DIRECT_UPLOAD_ENABLED**: `true` - 已启用又拍云直传
- ✅ **UPYUN_IMAGE_PROCESSING_ENABLED**: `true` - 已启用又拍云图片处理
- ✅ **UPYUN_BUCKET**: `filmtrip-dev`
- ✅ **UPYUN_CDN_DOMAIN**: `https://filmtrip-dev.test.upcdn.net`

### 前端配置
- ⚠️ **VITE_UPYUN_DIRECT_UPLOAD**: 需要在前端 `.env.local` 文件中设置
- 当前状态：未设置（默认 `false`）

## 上传行为

### 1. 新照片上传流程

#### 情况 A：前端配置了 `VITE_UPYUN_DIRECT_UPLOAD=true`
1. 前端调用 `POST /api/storage/policy` 获取上传策略
2. 前端直接上传文件到又拍云（`https://v0.api.upyun.com/filmtrip-dev/`）
3. 又拍云回调后端（`POST /api/storage/callback`）
4. 后端更新照片记录：
   - `origin_bucket` = `filmtrip-dev`
   - `origin_path` = 又拍云路径（如 `dev/WEB/45/2a/f4/...`）

**结果**：✅ 照片上传到又拍云

#### 情况 B：前端未配置 `VITE_UPYUN_DIRECT_UPLOAD=false` 或未设置
1. 前端尝试传统上传（`POST /api/photos` 上传文件）
2. 后端检查 `UPYUN_DIRECT_UPLOAD_ENABLED=true`
3. 后端拒绝上传，返回错误：
   ```
   系统已启用又拍云直传，请先调用 /api/storage/policy 获取上传策略并直传
   ```

**结果**：❌ 上传失败，需要配置前端环境变量

## 图片加载行为

### 1. 图片 URL 生成逻辑

**改进后的逻辑**（已更新）：
```javascript
if (
  photo &&
  upyunService.isImageProcessingEnabled() &&
  photo.origin_path &&
  photo.origin_bucket === upyunService.getConfig().bucket  // 添加了 bucket 检查
) {
  // 使用又拍云 CDN URL
  return upyunService.buildCdnUrl(objectPath, style);
} else {
  // 使用本地路径
  return `/uploads/${filename}`;
}
```

### 2. 不同照片的加载行为

#### 新上传的照片（`origin_bucket=filmtrip-dev`）
- ✅ 使用又拍云 CDN URL
- 原始图片：`https://filmtrip-dev.test.upcdn.net/{origin_path}`
- 缩略图：`https://filmtrip-dev.test.upcdn.net/{origin_path}!thumb`
- 1024尺寸：`https://filmtrip-dev.test.upcdn.net/{origin_path}!preview`
- 2048尺寸：`https://filmtrip-dev.test.upcdn.net/{origin_path}!large`

#### 现有照片（`origin_bucket=local-dev` 或 `NULL`）
- ✅ 使用本地路径
- 原始图片：`/uploads/{filename}`
- 缩略图：`/uploads/thumbnails/{baseName}_thumb.jpg`
- 1024尺寸：`/uploads/size1024/{baseName}_1024.jpg`
- 2048尺寸：`/uploads/size2048/{baseName}_2048.jpg`

## 数据库统计

### 现有照片状态
- **总照片数**: 110
- **有 origin_path (又拍云)**: 109
- **无 origin_path (本地)**: 1
- **origin_bucket=filmtrip-dev**: 0（新上传的照片会有）
- **origin_bucket=local-dev**: 109（现有照片）
- **origin_bucket=NULL**: 1

### 说明
- 现有照片的 `origin_path` 是在本地存储时生成的路径
- 这些照片的 `origin_bucket` 是 `local-dev`，不是 `filmtrip-dev`
- 由于添加了 `origin_bucket` 检查，这些照片会使用本地路径加载，不会尝试使用又拍云 CDN

## 需要做的配置

### 1. 前端环境变量配置

创建或更新 `frontend/.env.local` 文件：
```env
VITE_UPYUN_DIRECT_UPLOAD=true
```

**作用**：
- 启用前端又拍云直传流程
- 前端会使用 `POST /api/storage/policy` 获取上传策略
- 前端会直接上传文件到又拍云

### 2. 重启前端服务器

配置环境变量后，需要重启前端服务器：
```bash
cd frontend
npm run dev
```

## 测试建议

### 1. 测试新照片上传
- [ ] 配置前端环境变量 `VITE_UPYUN_DIRECT_UPLOAD=true`
- [ ] 重启前端服务器
- [ ] 测试单张照片上传
- [ ] 测试批量照片上传
- [ ] 验证照片是否正确上传到又拍云
- [ ] 验证 `origin_bucket` 是否为 `filmtrip-dev`
- [ ] 验证 `origin_path` 是否正确

### 2. 测试图片加载
- [ ] 测试新上传照片的图片加载（应该使用又拍云 CDN URL）
- [ ] 测试现有照片的图片加载（应该使用本地路径）
- [ ] 验证又拍云 CDN URL 是否正确
- [ ] 验证本地路径是否正确回退

### 3. 测试图片样式
- [ ] 测试缩略图样式（`!thumb`）
- [ ] 测试 1024 尺寸样式（`!preview`）
- [ ] 测试 2048 尺寸样式（`!large`）
- [ ] 测试水印样式（`!watermark`，受保护照片）

## 总结

### 当前状态
1. **上传照片**：
   - ✅ 后端已启用又拍云直传
   - ⚠️ 前端需要配置 `VITE_UPYUN_DIRECT_UPLOAD=true`
   - ⚠️ 如果前端未配置，上传会失败

2. **加载图片**：
   - ✅ 新上传的照片（`origin_bucket=filmtrip-dev`）会使用又拍云 CDN URL
   - ✅ 现有照片（`origin_bucket=local-dev`）会使用本地路径
   - ✅ 已添加 `origin_bucket` 检查，确保正确的照片使用正确的 URL

### 下一步操作
1. **配置前端环境变量**：在 `frontend/.env.local` 中设置 `VITE_UPYUN_DIRECT_UPLOAD=true`
2. **重启前端服务器**：使环境变量生效
3. **测试上传功能**：验证新照片是否正确上传到又拍云
4. **测试加载功能**：验证图片是否正确加载

## 相关文档

- [又拍云上传状态说明](./upyun-upload-status.md)
- [又拍云配置说明](./upyun-config-notes.md)
- [又拍云测试结果](./upyun-test-results.md)
- [又拍云接入规范](../specifications/storage/upyun-integration.md)

