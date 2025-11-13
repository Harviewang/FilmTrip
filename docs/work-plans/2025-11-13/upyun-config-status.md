# 又拍云配置状态

## 日期
2025-11-13

## 配置值

已提供的两个值：
1. `[密钥1，已从文档中移除]` ⚠️ **安全提示：密钥不应出现在文档中**
2. `[密钥2，已从文档中移除]` ⚠️ **安全提示：密钥不应出现在文档中**

## 当前配置状态

### ✅ 已配置
- **UPYUN_BUCKET**: `filmtrip-dev`（需要确认实际值）
- **UPYUN_OPERATOR**: `[已配置，已从文档中移除]` ⚠️ **安全提示：密钥不应出现在文档中**
- **UPYUN_FORM_API_SECRET**: `[已配置，已从文档中移除]` ⚠️ **安全提示：密钥不应出现在文档中**
- **UPYUN_CDN_DOMAIN**: `https://img.filmtrip.cn`（需要确认实际值）
- **UPYUN_NOTIFY_URL**: `https://api.filmtrip.cn/api/storage/callback`（需要确认实际值）
- **UPYUN_IMAGE_PROCESSING_ENABLED**: `true`
- **UPYUN_DIRECT_UPLOAD_ENABLED**: `true`

### ❌ 未配置
- **UPYUN_PASSWORD**: **未设置**（必需）
  - 这是操作员密码，用于又拍云 API 认证
  - 如果没有密码，无法使用又拍云服务

## 配置验证结果

```bash
$ node -e "require('dotenv').config(); const upyun = require('./storage/upyunService'); console.log('UPYUN configured:', upyun.isConfigured());"
UPYUN configured: false  # ❌ 配置未生效
```

**原因**：`UPYUN_PASSWORD` 未设置

## 需要确认的信息

### 1. 两个值的具体用途
请确认这两个值分别对应哪个配置项：
- `[密钥1]` = UPYUN_OPERATOR 还是 UPYUN_PASSWORD？
- `[密钥2]` = UPYUN_FORM_API_SECRET 还是 UPYUN_PASSWORD？

⚠️ **安全提示**：密钥值不应出现在文档中，应存储在 `.env` 文件中。

### 2. 必需的配置项
- [ ] **UPYUN_PASSWORD**: 操作员密码（**必需**）
- [ ] **UPYUN_BUCKET**: 存储空间名称（当前：`filmtrip-dev`，需要确认）
- [ ] **UPYUN_CDN_DOMAIN**: CDN 域名（当前：`https://img.filmtrip.cn`，需要确认）
- [ ] **UPYUN_NOTIFY_URL**: 回调 URL（当前：`https://api.filmtrip.cn/api/storage/callback`，需要确认）

### 3. 又拍云控制台配置
- [ ] 创建存储空间
- [ ] 配置 CDN 域名
- [ ] 配置回调 URL
- [ ] 配置图片样式（`thumb`、`preview`、`large`、`watermark`）

## 配置建议

### 选项 A：如果第一个值是操作员名称
```env
UPYUN_OPERATOR=[密钥1，存储在.env文件中]
UPYUN_PASSWORD=<需要提供>
UPYUN_FORM_API_SECRET=[密钥2，存储在.env文件中]
```

### 选项 B：如果第一个值是密码
```env
UPYUN_OPERATOR=<需要提供>
UPYUN_PASSWORD=[密钥1，存储在.env文件中]
UPYUN_FORM_API_SECRET=[密钥2，存储在.env文件中]
```

### 选项 C：如果第二个值是密码
```env
UPYUN_OPERATOR=[密钥1，存储在.env文件中]
UPYUN_PASSWORD=[密钥2，存储在.env文件中]
UPYUN_FORM_API_SECRET=<需要提供>
```

⚠️ **安全提示**：密钥应存储在 `.env` 文件中，不要出现在文档中！

## 下一步操作

1. **确认两个值的用途**：请确认这两个值分别对应哪个配置项
2. **提供缺失的配置**：如果缺少 `UPYUN_PASSWORD` 或其他配置项，请提供
3. **验证配置**：配置完成后，运行验证脚本确认配置是否正确
4. **测试功能**：配置验证通过后，测试又拍云功能是否正常工作

## 验证命令

```bash
# 检查配置
cd backend
node -e "require('dotenv').config(); const upyun = require('./storage/upyunService'); console.log('UPYUN configured:', upyun.isConfigured()); console.log('UPYUN form API configured:', upyun.isFormApiConfigured());"

# 应该输出：
# UPYUN configured: true
# UPYUN form API configured: true
```

## 相关文档

- [又拍云配置说明](./upyun-config-notes.md)
- [又拍云接入规范](../specifications/storage/upyun-integration.md)
- [审计报告](./audit-upyun-integration.md)

