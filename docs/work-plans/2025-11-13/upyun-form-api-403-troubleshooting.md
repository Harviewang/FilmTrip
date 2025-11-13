# 又拍云 FORM API 403 错误排查

## 日期
2025-11-13

## 问题描述

上传照片时遇到 403 错误：
- 错误代码: `403 Forbidden`
- 错误消息: `form api disabled`
- 响应中包含 `no-sign` 字段: `9cafadd40563923b1bd6fe3f008f7c6d`

## 错误详情

### 前端错误信息
```
POST https://v0.api.upyun.com/filmtrip-dev/ 403 (Forbidden)
{
  "code": 403,
  "url": "dev/WEB/f5/b5/1f/525e6afe-8496-4a9a-bba5-5c322234accb.jpg",
  "time": 1763012662,
  "message": "form api disabled",
  "no-sign": "9cafadd40563923b1bd6fe3f008f7c6d"
}
```

### 后端配置
- `UPYUN_BUCKET`: `filmtrip-dev`
- `UPYUN_OPERATOR`: `2f7e682861014d71a9119678f8027deb`
- `UPYUN_PASSWORD`: 已配置
- `UPYUN_FORM_API_SECRET`: `KsdvRi49VRNj7W9NcHQj9BYDAPw=`

### 策略生成验证
- ✅ 策略生成成功
- ✅ 签名生成正确（MD5 验证通过）
- ✅ Policy 字段完整
- ✅ 过期时间合理

## 问题分析

### 1. `no-sign` 字段的含义
根据又拍云文档，`no-sign` 字段表示：
- 表单 API 验证密钥获取失败
- 又拍云无法获取到我们使用的密钥
- 这通常意味着 FORM API 功能未启用，或者密钥不正确

### 2. `form api disabled` 错误
- 错误消息明确表示 FORM API 功能未启用
- 虽然控制台中"文件密钥"已开启，但 FORM API 可能需要单独启用
- 或者"文件密钥"和"FORM API 密钥"是不同的概念

### 3. 可能的原因
1. **又拍云控制台中 FORM API 功能未启用**
   - 文件密钥已开启，但 FORM API 功能可能需要单独启用
   - 需要在又拍云控制台中找到 FORM API 设置并启用

2. **密钥类型错误**
   - "文件密钥"可能不是 FORM API 密钥
   - FORM API 可能需要使用不同的密钥
   - 需要在又拍云控制台中找到 FORM API 专用密钥

3. **认证方式错误**
   - 当前使用 `policy + signature` 方式（旧方式）
   - 可能需要使用 `authorization header` 方式（新方式）
   - 或者需要使用 REST API 的认证方式

## 解决方案

### 方案1：检查又拍云控制台 FORM API 设置

1. **登录又拍云控制台**
   - 访问 https://console.upyun.com/
   - 使用账号登录

2. **进入服务配置**
   - 选择 `filmtrip-dev` 服务
   - 进入服务配置页面

3. **查找 FORM API 设置**
   - 查找"表单上传"或"FORM API"相关设置
   - 确认 FORM API 功能是否已启用
   - 如果未启用，请启用该功能

4. **获取 FORM API 密钥**
   - 如果 FORM API 有独立的密钥，请获取该密钥
   - 更新 `UPYUN_FORM_API_SECRET` 环境变量

### 方案2：使用 authorization header 认证

根据又拍云文档，FORM API 可以使用 `authorization header` 方式认证：

```javascript
// 使用 authorization header 而不是 policy + signature
const passwordDigest = crypto.createHash('md5').update(password).digest('hex');
const date = new Date().toUTCString();
const signatureBase = `POST&/${bucket}/&${date}&0&`;
const hmac = crypto.createHmac('sha1', passwordDigest);
hmac.update(signatureBase);
const signature = hmac.digest('base64');
const authorization = `UPYUN ${operator}:${signature}`;

// 上传时使用 authorization header
fetch(endpoint, {
  method: 'POST',
  headers: {
    'Authorization': authorization,
    'Date': date
  },
  body: formData
});
```

### 方案3：检查 bucket 权限

1. **检查 bucket 权限设置**
   - 确认 bucket 是否允许 FORM API 上传
   - 检查 bucket 的访问权限设置

2. **检查操作员权限**
   - 确认操作员是否有 FORM API 上传权限
   - 检查操作员的权限设置

## 测试验证

### 1. 检查配置
```bash
# 检查环境变量
grep UPYUN_FORM_API_SECRET backend/.env

# 测试策略生成
node backend/scripts/test-upyun-policy.js
```

### 2. 测试上传
- 使用 Postman 或 curl 测试 FORM API 上传
- 检查响应中的错误信息
- 验证签名是否正确

### 3. 检查又拍云控制台
- 查看 FORM API 功能是否已启用
- 查看是否有 FORM API 专用密钥
- 查看 bucket 权限设置

## 相关文档

### 又拍云 FORM API 文档
- [又拍云 FORM API 文档](https://help.upyun.com/knowledge-base/form_api/)
- 文档中提到了签名认证，但没有明确说明如何启用 FORM API

### 又拍云控制台
- 登录又拍云控制台
- 进入服务配置
- 查找 FORM API 相关设置

## 下一步行动

1. **检查又拍云控制台**
   - 确认 FORM API 功能是否已启用
   - 查找 FORM API 专用密钥
   - 检查 bucket 权限设置

2. **尝试使用 authorization header**
   - 修改前端上传代码，使用 authorization header
   - 测试是否能够成功上传

3. **联系又拍云技术支持**
   - 如果问题仍然存在，联系又拍云技术支持
   - 询问如何启用 FORM API 功能
   - 询问 FORM API 密钥的获取方式

## 相关文件

- `backend/storage/upyunService.js` - 又拍云服务
- `backend/controllers/storageController.js` - 存储控制器
- `frontend/src/views/PhotoManagement.jsx` - 前端上传组件

## 参考

- [又拍云 FORM API 文档](https://help.upyun.com/knowledge-base/form_api/)
- [又拍云 FORM API 密钥更新](./upyun-form-api-secret-update.md)

