# 生产环境又拍云配置 - 快速参考

## 🚨 部署生产环境前必须修改的配置（否则图片打不开）

### 后端环境变量（.env）

```bash
# ⚠️ 必须修改这些：
UPYUN_BUCKET=filmtrip-prod                    # ❌ 不能是 filmtrip-dev
UPYUN_CDN_DOMAIN=https://img.filmtrip.cn     # ❌ 不能是 http:// 或 localhost
UPYUN_NOTIFY_URL=https://api.filmtrip.cn/api/storage/callback  # ❌ 不能是 localhost

# ⚠️ 必须使用生产环境的密钥：
UPYUN_OPERATOR=生产环境操作员
UPYUN_PASSWORD=生产环境密码
UPYUN_FORM_API_SECRET=生产环境表单API密钥
```

### 前端环境变量（.env.production）

```bash
# ⚠️ 必须修改这些：
VITE_API_BASE_URL=https://api.filmtrip.cn    # ❌ 不能是 http://localhost:3001
VITE_SHORT_LINK_PREFIX=https://filmtrip.cn/s  # ❌ 不能是 localhost:3002
```

### 关键检查点（3项）

1. **✅ 所有域名都使用HTTPS**（不是HTTP）
   - `UPYUN_CDN_DOMAIN`：必须是 `https://`
   - `UPYUN_NOTIFY_URL`：必须是 `https://`
   - 前端API地址：必须是 `https://`

2. **✅ 所有域名都指向生产环境**（不是localhost）
   - 不能用 `localhost`、`127.0.0.1`、`filmtrip-dev`
   - 必须使用 `filmtrip.cn`、`api.filmtrip.cn`、`img.filmtrip.cn`

3. **✅ 又拍云回调URL必须是公网可访问**
   - `UPYUN_NOTIFY_URL` 必须是又拍云服务器能访问到的公网HTTPS地址
   - 不能是内网地址或localhost

### 又拍云控制台检查

- [ ] Bucket名称：`filmtrip-prod`（不是dev）
- [ ] CDN域名：绑定 `img.filmtrip.cn` 并配置HTTPS
- [ ] 回调URL：确认指向 `https://api.filmtrip.cn/api/storage/callback`
- [ ] 表单上传API：已启用
- [ ] 文件密钥：已配置

### 测试步骤（部署后立即测试）

1. **上传测试**：上传一张照片，确认是否成功
2. **显示测试**：检查照片是否在列表中显示
3. **回调测试**：检查后端日志，确认收到又拍云回调
4. **URL测试**：检查图片URL是否正确（包含 `!thumb`、`!preview`、`!large`）

### 常见问题快速排查

| 问题 | 可能原因 | 解决方法 |
|------|---------|---------|
| 图片404 | Bucket不对、样式未配置 | 检查 `UPYUN_BUCKET`、在又拍云控制台配置样式 |
| 图片打不开 | CDN域名未配置或错误 | 检查 `UPYUN_CDN_DOMAIN`、配置HTTPS |
| 上传失败 | 表单API未启用 | 在又拍云控制台启用表单上传API |
| 回调未收到 | 回调URL无法访问 | 检查 `UPYUN_NOTIFY_URL` 是否公网可访问 |

### 紧急回滚方案

如果部署后图片打不开：

1. **立即回滚环境变量**：恢复之前的配置
2. **检查又拍云控制台**：确认bucket、域名、样式配置
3. **检查后端日志**：查看错误信息
4. **临时禁用直传**：设置 `UPYUN_DIRECT_UPLOAD_ENABLED=false`（如果本地有文件备份）

---

**完整检查清单请参考：`docs/deployment/production-upyun-checklist.md`**

