# 又拍云 403 错误修复

## 日期
2025-11-13

## 问题描述

批量上传照片时，又拍云API返回403错误，错误消息显示 "form api disabled"。

### 错误信息
- **前端错误**: `批量直传失败: Error: form api disabled`
- **又拍云API错误**: `Failed to load resource: the server responded with a status of 403`
- **上传端点**: `https://v0.api.upyun.com/filmtrip-dev/`

## 问题分析

### 1. 错误来源
- 403错误来自又拍云API，不是后端代码
- 错误消息 "form api disabled" 是又拍云API返回的响应
- 说明又拍云表单上传API可能未启用或配置不正确

### 2. 后端检查
- ✅ `isFormApiConfigured()` 返回 `true`
- ✅ 策略生成成功
- ✅ 签名计算正确
- ✅ 策略格式正确

### 3. 可能的原因
1. **又拍云表单API未启用**
   - 需要在又拍云控制台启用表单上传API
   - 检查又拍云服务配置

2. **又拍云表单API密钥不正确**
   - `UPYUN_FORM_API_SECRET` 可能不正确
   - 需要在又拍云控制台重新生成表单API密钥

3. **又拍云bucket权限问题**
   - bucket可能设置为私有，不允许表单上传
   - 需要检查bucket权限设置

4. **又拍云服务配置问题**
   - 表单上传服务可能未开通
   - 需要检查又拍云服务状态

5. **策略格式问题**
   - 策略格式可能不符合又拍云要求
   - 需要检查策略字段和格式

## 解决方案

### 1. 检查又拍云控制台
1. 登录又拍云控制台
2. 检查 `filmtrip-dev` bucket 的配置
3. 确认表单上传API是否启用
4. 检查表单API密钥是否正确

### 2. 验证表单API密钥
1. 在又拍云控制台找到表单API密钥
2. 确认 `UPYUN_FORM_API_SECRET` 环境变量是否正确
3. 如果密钥不正确，更新环境变量并重启后端服务

### 3. 检查bucket权限
1. 检查bucket的访问权限设置
2. 确认bucket允许表单上传
3. 检查防盗链配置

### 4. 测试上传
1. 使用又拍云官方工具测试表单上传
2. 验证表单API密钥是否有效
3. 检查上传策略是否正确

## 排查步骤

### 1. 检查又拍云配置
```bash
# 检查环境变量
cd backend
node -e "require('dotenv').config(); console.log('UPYUN_FORM_API_SECRET:', process.env.UPYUN_FORM_API_SECRET ? '***' : 'NULL');"
```

### 2. 测试策略生成
```bash
# 测试策略生成
cd backend
node scripts/test-upyun-policy.js
```

### 3. 检查又拍云控制台
1. 登录又拍云控制台
2. 进入 `filmtrip-dev` bucket 设置
3. 检查表单上传API配置
4. 验证表单API密钥

### 4. 测试上传
使用又拍云官方工具或curl测试表单上传：
```bash
# 测试上传（需要有效的策略和签名）
curl -X POST https://v0.api.upyun.com/filmtrip-dev/ \
  -F "file=@test.jpg" \
  -F "policy=..." \
  -F "signature=..."
```

## 相关文档

- [又拍云表单上传API文档](https://help.upyun.com/knowledge-base/form_api/)
- [又拍云API错误码说明](https://docs.upyun.com/api/errno/)
- [又拍云接入规范](../specifications/storage/upyun-integration.md)

## 注意事项

1. **表单API密钥安全**
   - 表单API密钥应该保密
   - 不要将密钥提交到代码仓库
   - 使用环境变量存储密钥

2. **bucket权限**
   - bucket权限设置要正确
   - 确保允许表单上传
   - 检查防盗链配置

3. **策略格式**
   - 策略格式要符合又拍云要求
   - 签名计算要正确
   - 策略字段要完整

## 后续优化

1. **错误处理**
   - 改进错误消息显示
   - 提供更详细的错误信息
   - 添加错误重试机制

2. **日志记录**
   - 记录上传请求和响应
   - 记录错误详情
   - 添加调试日志

3. **测试**
   - 添加单元测试
   - 添加集成测试
   - 测试各种错误场景

