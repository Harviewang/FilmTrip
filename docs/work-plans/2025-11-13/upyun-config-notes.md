# 又拍云配置说明

## 日期
2025-11-13

## 提供的配置值

用户提供了两个配置值：
1. `[密钥1，已从文档中移除]` ⚠️ **安全提示：密钥不应出现在文档中**
2. `[密钥2，已从文档中移除]` ⚠️ **安全提示：密钥不应出现在文档中**

## 配置假设

基于常见的又拍云配置模式，当前配置假设：

- **UPYUN_OPERATOR** = `[密钥1，存储在.env文件中]`（第一个值）
- **UPYUN_FORM_API_SECRET** = `[密钥2，存储在.env文件中]`（第二个值）

⚠️ **安全提示**：密钥应存储在 `.env` 文件中，不要出现在文档中！

## 需要确认的配置项

### 1. 操作员配置
- [ ] **UPYUN_OPERATOR**: 操作员名称（已配置，存储在.env文件中）
- [ ] **UPYUN_PASSWORD**: 操作员密码（**需要提供**）
- [ ] **UPYUN_FORM_API_SECRET**: 表单 API 密钥（已配置，存储在.env文件中）

⚠️ **安全提示**：密钥值不应出现在文档中，应存储在 `.env` 文件中。

### 2. 存储空间配置
- [ ] **UPYUN_BUCKET**: 存储空间名称（当前配置：`filmtrip-dev`，**需要确认实际值**）
- [ ] **UPYUN_CDN_DOMAIN**: CDN 域名（当前配置：`https://img.filmtrip.cn`，**需要确认实际值**）

### 3. 回调配置
- [ ] **UPYUN_NOTIFY_URL**: 回调 URL（当前配置：`https://api.filmtrip.cn/api/storage/callback`，**需要确认实际值**）
- [ ] **UPYUN_RETURN_URL**: 返回 URL（可选，当前配置：空）

### 4. 功能开关
- [x] **UPYUN_IMAGE_PROCESSING_ENABLED**: 图片处理开关（当前配置：`true`）
- [x] **UPYUN_DIRECT_UPLOAD_ENABLED**: 直传开关（当前配置：`true`）

## 配置验证

### 1. 检查配置是否生效
```bash
# 检查环境变量是否正确加载
cd backend
node -e "require('dotenv').config(); console.log('UPYUN_OPERATOR:', process.env.UPYUN_OPERATOR); console.log('UPYUN_FORM_API_SECRET:', process.env.UPYUN_FORM_API_SECRET ? '***' : 'NOT SET');"
```

### 2. 测试策略生成
```bash
# 使用有效的管理员 token 测试策略生成
curl -X POST http://localhost:3001/api/storage/policy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "fileName": "test.jpg",
    "size": 1024,
    "film_roll_id": "test-roll-id"
  }'
```

### 3. 验证又拍云服务配置
```bash
# 检查又拍云服务是否配置正确
curl -X GET http://localhost:3001/api/storage/protected-url \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "path": "/test/path.jpg",
    "expiresIn": 300
  }'
```

## 注意事项

1. **密钥安全**：
   - 不要将 `.env` 文件提交到 Git 仓库
   - 不要在日志中输出密钥信息
   - 使用环境变量管理密钥

2. **配置确认**：
   - 确认 `UPYUN_OPERATOR` 和 `UPYUN_FORM_API_SECRET` 的配置是否正确
   - 确认 `UPYUN_PASSWORD` 是否已配置
   - 确认 `UPYUN_BUCKET` 和 `UPYUN_CDN_DOMAIN` 是否已配置

3. **回调 URL**：
   - 确认 `UPYUN_NOTIFY_URL` 是否可在公网访问
   - 确认回调 URL 是否已配置到又拍云控制台

4. **图片样式**：
   - 确认在又拍云控制台已配置图片样式（`thumb`、`preview`、`large`、`watermark`）
   - 确认样式名称与配置文件中的名称一致

## 下一步工作

1. [ ] 确认两个配置值的具体用途
2. [ ] 配置 `UPYUN_PASSWORD`（操作员密码）
3. [ ] 配置 `UPYUN_BUCKET`（存储空间名称）
4. [ ] 配置 `UPYUN_CDN_DOMAIN`（CDN 域名）
5. [ ] 配置 `UPYUN_NOTIFY_URL`（回调 URL）
6. [ ] 在又拍云控制台配置图片样式
7. [ ] 测试策略生成接口
8. [ ] 测试直传流程
9. [ ] 测试回调处理

## 相关文档

- [又拍云接入规范](../specifications/storage/upyun-integration.md)
- [审计报告](./audit-upyun-integration.md)
- [工作总结](./summary.md)

