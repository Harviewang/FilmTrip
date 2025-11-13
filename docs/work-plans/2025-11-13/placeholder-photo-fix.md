# 占位符照片问题修复

## 日期
2025-11-13

## 问题描述

用户上传照片时，占位符记录已创建，但文件未上传到又拍云，导致：
1. 数据库中有占位符记录（`origin_bucket=filmtrip-dev`，`origin_path` 有值）
2. 但文件实际上没有上传到又拍云（没有 `storage_files` 记录，没有 `UPLOAD_CALLBACK`）
3. 前端仍然显示图片（因为 `variants` 中有又拍云CDN URL），但图片无法加载

### 问题照片
- 短链接: `1Iwtq`
- ID: `eb6b4e59-f545-4c29-b70a-985aae43492d`
- 文件名: `95ecfe55-f8d6-4c39-9c37-25857837bd43.jpg`
- `origin_bucket`: `filmtrip-dev`
- `origin_path`: `dev/WEB/9b/b0/9c/95ecfe55-f8d6-4c39-9c37-25857837bd43.jpg`
- `storage_files` 记录: 0
- `UPLOAD_CALLBACK` 记录: 0

## 问题分析

### 1. 上传流程
1. 前端调用 `/api/storage/policy` 获取上传策略
2. 后端创建占位符照片记录（`createPhotoPlaceholder`）
3. 后端返回策略和签名
4. 前端尝试上传到又拍云
5. **上传失败（403错误）**
6. 又拍云没有调用回调
7. 占位符记录仍然存在，但文件未上传

### 2. 问题根源
- 占位符创建时，`origin_bucket` 和 `origin_path` 都被设置了
- 但实际上传失败，文件不存在
- 前端仍然显示图片，因为 `variants` 中有又拍云CDN URL

### 3. 影响
- 数据库中有无效的占位符记录
- 前端显示无法加载的图片
- 用户困惑（为什么图片显示但无法加载）

## 解决方案

### 1. 修复占位符创建逻辑
- 占位符阶段，`origin_bucket` 和 `origin_path` 都设为 `null`
- 只有回调成功后才设置这些字段
- 这样可以通过检查 `origin_path` 是否为 `null` 来判断上传是否成功

### 2. 修复图片URL生成逻辑
- 如果 `origin_path` 为 `null`，不生成又拍云CDN URL
- 如果 `origin_bucket` 不匹配又拍云 bucket，使用本地路径
- 如果 `origin_path` 有值且 `origin_bucket` 匹配，使用又拍云CDN URL

### 3. 清理失败的占位符
- 创建清理脚本，删除上传失败的占位符记录
- 识别标准：有 `POLICY_CREATED` 但没有 `UPLOAD_CALLBACK`，且没有 `storage_files` 记录

## 修复内容

### 1. 占位符创建逻辑
**文件**: `backend/storage/photoPlaceholderService.js`

**修改前**:
```javascript
bucket || null, // 占位符阶段，先设置 bucket
saveKey, // 占位符阶段，设置 origin_path
```

**修改后**:
```javascript
null, // 占位符阶段，origin_bucket 设为 null，等回调成功后再更新
null, // 占位符阶段，origin_path 设为 null，等回调成功后再更新
```

### 2. 图片URL生成逻辑
**文件**: `backend/controllers/photoController.js`

**修改**: 在 `buildVariantUrls` 函数中，只有当 `origin_path` 有值且 `origin_bucket` 匹配又拍云 bucket 时，才使用又拍云CDN URL。

### 3. EXIF读取逻辑
**文件**: `backend/controllers/photoController.js`

**修改**: 只有当文件存储在本地时，才尝试读取EXIF信息。如果文件存储在又拍云，跳过EXIF读取，使用数据库中的 `orientation` 字段。

### 4. 清理脚本
**文件**: `backend/scripts/cleanup-failed-uploads.js`

**功能**: 清理上传失败的占位符照片记录。

## 测试结果

### 1. 清理脚本
- ✅ 成功删除上传失败的占位符照片
- ✅ 成功删除相关的 `storage_actions` 记录
- ✅ 数据库已清理干净

### 2. 占位符创建
- ✅ 占位符阶段，`origin_bucket` 和 `origin_path` 都设为 `null`
- ✅ 回调成功后，这些字段会被更新

### 3. 图片URL生成
- ✅ 占位符照片（`origin_path=null`）会使用本地路径
- ✅ 又拍云照片（`origin_path` 有值）会使用又拍云CDN URL
- ✅ 本地照片（`origin_bucket=local-dev`）会使用本地路径

## 后续优化建议

### 1. 前端错误处理
- 如果上传失败，前端应该删除占位符记录
- 或者标记为上传失败，允许用户重试

### 2. 定时清理任务
- 定期清理上传失败的占位符记录
- 例如：24小时后仍未收到回调的占位符记录

### 3. 上传状态跟踪
- 添加 `upload_status` 字段到 `photos` 表
- 状态：`pending`（占位符）、`uploading`（上传中）、`success`（成功）、`failed`（失败）

### 4. 前端重试机制
- 如果上传失败，前端应该提供重试选项
- 或者自动重试（最多3次）

## 相关文件

- `backend/storage/photoPlaceholderService.js` - 占位符创建逻辑
- `backend/controllers/storageController.js` - 策略生成和回调处理
- `backend/controllers/photoController.js` - 图片URL生成和EXIF读取
- `backend/scripts/cleanup-failed-uploads.js` - 清理脚本
- `frontend/src/views/PhotoManagement.jsx` - 前端上传逻辑

## 参考

- [又拍云接入规范](../specifications/storage/upyun-integration.md)
- [占位符照片清理脚本](../backend/scripts/cleanup-failed-uploads.js)

