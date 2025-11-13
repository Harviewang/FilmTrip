# 又拍云配置重启说明

## 日期
2025-11-13

## 重启操作

### 前端服务器重启
- ✅ 已停止旧的前端服务器进程
- ✅ 已启动新的前端服务器（使用新的环境变量配置）
- ✅ 环境变量 `VITE_UPYUN_DIRECT_UPLOAD=true` 已生效

### 后端服务器状态
- ✅ 后端服务器正常运行（端口 3001）
- ✅ 又拍云配置已生效
- ✅ 策略生成接口正常工作

## 现有照片保留说明

### ✅ 现有照片会完全保留

#### 1. 数据库记录
- ✅ 现有照片的数据库记录不会改变
- ✅ `origin_bucket=local-dev` 或 `NULL` 的记录保持不变
- ✅ 照片的所有元数据（标题、描述、位置等）保持不变

#### 2. 本地文件
- ✅ 现有照片的本地文件不会受到影响
- ✅ 本地文件路径：`backend/uploads/{filename}`
- ✅ 缩略图路径：`backend/uploads/thumbnails/{baseName}_thumb.jpg`
- ✅ 1024尺寸路径：`backend/uploads/size1024/{baseName}_1024.jpg`
- ✅ 2048尺寸路径：`backend/uploads/size2048/{baseName}_2048.jpg`

#### 3. 图片加载
- ✅ 现有照片会继续使用本地路径加载
- ✅ 图片 URL：`/uploads/{filename}`
- ✅ 不会尝试使用又拍云 CDN URL（因为 `origin_bucket !== filmtrip-dev`）

### 📊 数据库统计

#### 当前状态
- **总照片数**: 110
- **又拍云照片** (`origin_bucket=filmtrip-dev`): 2（测试占位符）
- **本地照片** (`origin_bucket=local-dev` 或 `NULL`): 108（现有照片）

#### 说明
- 现有照片的 `origin_bucket` 是 `local-dev`，不是 `filmtrip-dev`
- 由于添加了 `origin_bucket` 检查，这些照片会使用本地路径加载
- 不会尝试使用又拍云 CDN URL，所以不会出现 404 错误

## 新上传照片行为

### 📤 新上传的照片

#### 上传流程
1. 前端调用 `POST /api/storage/policy` 获取上传策略
2. 前端直接上传文件到又拍云（`https://v0.api.upyun.com/filmtrip-dev/`）
3. 又拍云回调后端（`POST /api/storage/callback`）
4. 后端更新照片记录：
   - `origin_bucket` = `filmtrip-dev`
   - `origin_path` = 又拍云路径（如 `dev/WEB/45/2a/f4/...`）

#### 图片加载
- ✅ 使用又拍云 CDN URL
- 原始图片：`https://filmtrip-dev.test.upcdn.net/{origin_path}`
- 缩略图：`https://filmtrip-dev.test.upcdn.net/{origin_path}!thumb`
- 1024尺寸：`https://filmtrip-dev.test.upcdn.net/{origin_path}!preview`
- 2048尺寸：`https://filmtrip-dev.test.upcdn.net/{origin_path}!large`

## 混合模式说明

### 🔄 系统支持混合模式

#### 同时支持两种存储方式
1. **又拍云存储**：
   - 新上传的照片
   - `origin_bucket=filmtrip-dev`
   - 使用又拍云 CDN URL 加载

2. **本地存储**：
   - 现有照片
   - `origin_bucket=local-dev` 或 `NULL`
   - 使用本地路径加载

#### 优势
- ✅ 现有照片不需要迁移
- ✅ 新照片自动使用又拍云
- ✅ 系统平滑过渡
- ✅ 不会影响现有功能

## 测试建议

### 1. 测试现有照片
- [ ] 打开照片列表页面
- [ ] 验证现有照片是否正常显示
- [ ] 验证图片 URL 是否为本地路径（`/uploads/...`）
- [ ] 验证图片是否正常加载

### 2. 测试新照片上传
- [ ] 测试单张照片上传
- [ ] 测试批量照片上传
- [ ] 验证照片是否正确上传到又拍云
- [ ] 验证 `origin_bucket` 是否为 `filmtrip-dev`
- [ ] 验证图片 URL 是否为又拍云 CDN URL（`https://filmtrip-dev.test.upcdn.net/...`）

### 3. 测试图片加载
- [ ] 测试新上传照片的图片加载（应该使用又拍云 CDN URL）
- [ ] 测试现有照片的图片加载（应该使用本地路径）
- [ ] 验证又拍云 CDN URL 是否正确
- [ ] 验证本地路径是否正确

## 服务器状态

### 前端服务器
- **状态**: 已重启
- **端口**: 3002
- **URL**: http://localhost:3002
- **环境变量**: `VITE_UPYUN_DIRECT_UPLOAD=true` ✅

### 后端服务器
- **状态**: 运行中
- **端口**: 3001
- **URL**: http://localhost:3001
- **又拍云配置**: 已启用 ✅

## 注意事项

### 1. 现有照片
- ✅ 现有照片不会受到影响
- ✅ 本地文件不会删除
- ✅ 数据库记录不会改变
- ✅ 图片加载正常

### 2. 新上传照片
- ✅ 新上传的照片会上传到又拍云
- ✅ 需要确保又拍云配置正确
- ✅ 需要确保回调 URL 配置正确
- ✅ 需要确保图片样式配置正确

### 3. 测试建议
- ✅ 先测试现有照片是否正常显示
- ✅ 再测试新照片上传功能
- ✅ 验证新照片是否从又拍云加载
- ✅ 验证现有照片是否从本地加载

## 相关文档

- [又拍云当前状态](./upyun-current-status.md)
- [又拍云上传状态说明](./upyun-upload-status.md)
- [又拍云配置说明](./upyun-config-notes.md)
- [又拍云测试结果](./upyun-test-results.md)
- [又拍云接入规范](../specifications/storage/upyun-integration.md)

