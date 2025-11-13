# 密钥更换指南

## 📋 需要更换的密钥清单

根据泄露的密钥，以下是需要更换的项目：

### ✅ 需要更换（已提供新密钥）

1. **UPYUN_OPERATOR**（操作员名称/AccessKey）
   - 状态：已泄露，需要更换
   - 新密钥：已在又拍云控制台更换（AccessKey）
   - 配置项：`UPYUN_OPERATOR`

2. **UPYUN_FORM_API_SECRET**（FORM API密钥/文件密钥）
   - 状态：已泄露，需要更换
   - 新密钥：已在又拍云控制台更换（文件密钥）
   - 配置项：`UPYUN_FORM_API_SECRET`

### ✅ 无需更换（无法更换）

3. **UPYUN_PASSWORD**（操作员密码/SecretAccessKey）
   - 状态：**无法更换**
   - 说明：又拍云控制台中的 SecretAccessKey 无法更换，保持原值
   - 配置项：`UPYUN_PASSWORD`
   - ⚠️ 虽然无法更换，但需要确保在 `.env` 文件中正确配置

---

## 🔧 配置步骤

### 步骤1：更新 `.env` 文件

**文件位置**：`backend/.env`

```env
# 又拍云配置
UPYUN_BUCKET=filmtrip-dev
UPYUN_OPERATOR=[新AccessKey，在.env文件中配置，不要出现在文档中]
UPYUN_PASSWORD=[SecretAccessKey，无法更换，保持原值，在.env文件中配置]
UPYUN_FORM_API_SECRET=[新文件密钥，在.env文件中配置，不要出现在文档中]
```

⚠️ **重要**：真实密钥值只在 `backend/.env` 文件中配置，**不要出现在任何文档中**！

### 步骤2：确认UPYUN_PASSWORD

**说明**：
- `UPYUN_PASSWORD` 对应又拍云控制台中的 **SecretAccessKey**
- **SecretAccessKey 无法更换**，需要在 `.env` 文件中使用原值
- 确保 `.env` 文件中的 `UPYUN_PASSWORD` 配置正确

### 步骤3：重启服务

```bash
# 停止后端服务
# 然后重新启动
cd backend
npm run dev
```

### 步骤4：验证配置

```bash
# 检查配置是否正确加载
cd backend
node -e "require('dotenv').config(); const upyun = require('./storage/upyunService'); console.log('UPYUN configured:', upyun.isConfigured()); console.log('Form API configured:', upyun.isFormApiConfigured());"
```

**预期输出**：
```
UPYUN configured: true
Form API configured: true
```

---

## ⚠️ 安全注意事项

### ✅ 必须遵守

1. **只在 `.env` 文件中配置**
   - 不要在代码中硬编码
   - 不要在文档中记录真实密钥
   - 不要在日志中输出密钥

2. **验证 `.gitignore`**
   - 确保 `.env` 文件已在 `.gitignore` 中
   - 确保 `project/credentials/` 目录已在 `.gitignore` 中

3. **提交前检查**
   - 提交前运行 `git status` 检查
   - 确保 `.env` 文件不会被提交

### ❌ 绝对禁止

1. 不要在Git提交中包含 `.env` 文件
2. 不要在文档中记录真实密钥
3. 不要在聊天工具中发送密钥
4. 不要截图包含密钥的内容

---

## 📊 更换状态

### ✅ 已完成

- [x] 从文档中移除旧密钥
- [x] 创建密钥更换指南
- [x] 提供新密钥配置说明

### 🔄 待完成

- [ ] 更新 `backend/.env` 文件（使用新密钥）
- [ ] 确认 `UPYUN_PASSWORD` 是否需要更换
- [ ] 重启后端服务
- [ ] 验证配置是否正确
- [ ] 测试上传功能

---

## 🔗 相关文档

- [密钥泄露应急响应](./secret-leak-response.md)
- [密钥管理指南](../guides/密钥管理指南.md)

---

**创建时间**：2025-11-13  
**最后更新**：2025-11-13

