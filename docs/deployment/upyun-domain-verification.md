# 又拍云域名验证和绑定指南

## 日期
2025-11-13

## ✅ 已完成的配置

### 1. DNS验证记录（TXT）
- **主机记录**：`upyun-verify`
- **记录类型**：`TXT`
- **记录值**：`70605d3b11fe9fb69f87a6efbf35547a`
- **完整域名**：`upyun-verify.filmtrip.cn`
- **记录ID**：`1988946609119589376`
- **状态**：✅ 已添加成功

### 2. CDN域名记录（CNAME）
- **主机记录**：`img`
- **记录类型**：`CNAME`
- **记录值**：`filmtrip-dev.test.upcdn.net`
- **完整域名**：`img.filmtrip.cn`
- **状态**：✅ 已存在且值正确

---

## 📋 后续步骤

### 步骤1：等待DNS生效（5-10分钟）
DNS记录通常在5-10分钟内生效。可以验证：
```bash
# 验证TXT记录
dig upyun-verify.filmtrip.cn TXT

# 验证CNAME记录
dig img.filmtrip.cn CNAME
```

### 步骤2：在又拍云控制台验证域名
1. 登录又拍云控制台
2. 进入「服务管理」→「CDN」→「域名管理」
3. 点击「添加域名」
4. 输入域名：`img.filmtrip.cn`
5. 选择验证方式：DNS验证
6. 点击「验证」
7. 等待系统检测TXT记录（可能需要几分钟）

### 步骤3：绑定域名
验证通过后：
1. 在又拍云控制台点击「绑定」
2. 选择存储空间：`filmtrip-prod`（生产环境）或对应bucket
3. 确认绑定

### 步骤4：配置SSL证书（推荐）
1. 在域名管理页面，找到 `img.filmtrip.cn`
2. 点击「SSL证书」
3. 选择证书方式：
   - **自动证书**（推荐）：又拍云自动申请Let's Encrypt证书
   - **手动上传**：上传自有证书
4. 等待证书申请完成（通常几分钟）

### 步骤5：更新环境变量
验证和绑定完成后，更新生产环境变量：
```bash
# 后端环境变量
UPYUN_CDN_DOMAIN=https://img.filmtrip.cn
```

### 步骤6：测试访问
```bash
# 测试CDN域名是否生效
curl -I https://img.filmtrip.cn/test.jpg

# 测试图片URL
curl -I https://img.filmtrip.cn/a7/b3c8f.jpg!thumb
```

---

## 📝 注意事项

### DNS生效时间
- TXT记录：通常5-10分钟生效
- CNAME记录：已存在，无需等待
- 又拍云验证：DNS生效后，又拍云需要几分钟检测TXT记录

### 域名验证失败处理
如果验证失败：
1. 检查DNS记录是否生效：`dig upyun-verify.filmtrip.cn TXT`
2. 确认TXT记录值是否正确：`70605d3b11fe9fb69f87a6efbf35547a`
3. 等待更长时间后重试（有时需要15-30分钟）

### SSL证书配置
- **自动证书**：又拍云自动申请，免费，推荐使用
- **手动上传**：需要自行申请证书并上传
- **证书生效**：配置后通常几分钟内生效

### 生产环境配置
验证通过后，需要更新：
1. 环境变量：`UPYUN_CDN_DOMAIN=https://img.filmtrip.cn`
2. 确保使用HTTPS（不是HTTP）
3. 更新生产环境的bucket名称（如果不是 `filmtrip-dev`）

---

## 🔍 验证命令

### 验证DNS记录
```bash
# 验证TXT记录
dig upyun-verify.filmtrip.cn TXT +short
# 期望输出: "70605d3b11fe9fb69f87a6efbf35547a"

# 验证CNAME记录
dig img.filmtrip.cn CNAME +short
# 期望输出: filmtrip-dev.test.upcdn.net
```

### 验证SSL证书
```bash
# 检查SSL证书
openssl s_client -connect img.filmtrip.cn:443 -servername img.filmtrip.cn < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

### 验证CDN访问
```bash
# 测试CDN域名访问
curl -I https://img.filmtrip.cn/
# 期望返回: HTTP/1.1 200 或 403（正常，因为路径不存在）
```

---

## 📞 问题排查

### 问题1：DNS记录未生效
**症状**：`dig` 命令查询不到记录
**解决**：
1. 等待更长时间（最多30分钟）
2. 清除DNS缓存：`sudo dscacheutil -flushcache`（macOS）
3. 检查DNS服务商是否有延迟

### 问题2：又拍云验证失败
**症状**：又拍云控制台显示验证失败
**解决**：
1. 确认TXT记录值完全正确（包括大小写）
2. 确认记录类型是TXT（不是其他类型）
3. 等待更长时间后重试

### 问题3：SSL证书申请失败
**症状**：证书申请失败
**解决**：
1. 确认域名已验证并绑定
2. 确认CNAME记录已生效
3. 联系又拍云客服

---

## ✅ 完成检查清单

- [ ] DNS TXT记录已添加（✅ 已完成）
- [ ] DNS CNAME记录已配置（✅ 已完成）
- [ ] 等待DNS生效（5-10分钟）
- [ ] 在又拍云控制台验证域名
- [ ] 绑定域名到存储空间
- [ ] 配置SSL证书
- [ ] 更新生产环境变量
- [ ] 测试CDN域名访问
- [ ] 测试图片URL生成

---

**最后更新**：2025-11-13  
**状态**：DNS记录已配置，等待验证中

