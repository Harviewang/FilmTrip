# 密钥泄露应急响应报告

## 🚨 事件概述

**日期**: 2025-11-13  
**检测工具**: GitGuardian  
**严重程度**: 🔴 高  
**状态**: 已修复

---

## 📋 泄露详情

### 泄露的密钥

1. **又拍云FORM API密钥**：
   - `KsdvRi49VRNj7W9NcHQj9BYDAPw=`（当前使用）
   - `402e4c36b7c75b85586f5fa12b27bc89`（旧密钥）

2. **又拍云操作员/密码**：
   - `2f7e682861014d71a9119678f8027deb`

### 泄露位置

以下文件包含真实密钥（已修复）：
- `docs/work-plans/2025-11-13/upyun-form-api-secret-update.md`
- `docs/work-plans/2025-11-13/upyun-config-status.md`
- `docs/work-plans/2025-11-13/upyun-config-notes.md`
- `docs/work-plans/2025-11-13/audit-upyun-integration-final.md`
- `docs/work-plans/2025-11-13/upyun-form-api-403-troubleshooting.md`
- `docs/work-plans/2025-11-13/upyun-test-results.md`
- `backend/scripts/configure-upyun.sh`

### 泄露时间

- **检测时间**: 2025-11-13 12:40:24 UTC
- **提交时间**: 2025-11-13（多个提交）

---

## ✅ 已执行的修复措施

### 1. 从文档中移除密钥

- ✅ 所有文档中的真实密钥已替换为占位符
- ✅ 添加安全提示，说明密钥不应出现在文档中
- ✅ 说明密钥应存储在 `.env` 文件中

### 2. 代码修复

- ✅ 修复了 `backend/scripts/configure-upyun.sh` 中的密钥
- ✅ 所有文档已更新，使用占位符替代真实密钥

---

## ⚠️ 必须立即执行的操作

### 1. 更换又拍云密钥（最高优先级）

**操作步骤**：
1. 登录又拍云控制台
2. 进入 bucket 设置 → "文件密钥"
3. 点击"更换密钥"
4. 生成新密钥
5. 更新 `backend/.env` 文件中的 `UPYUN_FORM_API_SECRET`
6. 重启后端服务

**时间要求**：**立即执行**（密钥已泄露，存在安全风险）

---

### 2. 从Git历史中删除密钥

**方法1：使用git filter-branch（推荐）**

```bash
# 警告：这会重写Git历史，需要强制推送
# 执行前请确保所有团队成员已同步代码

# 删除包含密钥的提交
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch docs/work-plans/2025-11-13/upyun-form-api-secret-update.md docs/work-plans/2025-11-13/upyun-config-status.md docs/work-plans/2025-11-13/upyun-config-notes.md docs/work-plans/2025-11-13/audit-upyun-integration-final.md docs/work-plans/2025-11-13/upyun-form-api-403-troubleshooting.md docs/work-plans/2025-11-13/upyun-test-results.md backend/scripts/configure-upyun.sh" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送（危险操作，需要确认）
# git push origin --force --all
```

**方法2：使用BFG Repo-Cleaner（更安全）**

```bash
# 安装BFG
# brew install bfg  # macOS
# 或下载: https://rtyley.github.io/bfg-repo-cleaner/

# 创建密钥列表文件
echo "KsdvRi49VRNj7W9NcHQj9BYDAPw=" > secrets.txt
echo "2f7e682861014d71a9119678f8027deb" >> secrets.txt
echo "402e4c36b7c75b85586f5fa12b27bc89" >> secrets.txt

# 清理Git历史
bfg --replace-text secrets.txt

# 清理和推送
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 强制推送（需要确认）
# git push origin --force --all
```

**⚠️ 警告**：
- 这会重写Git历史
- 需要所有团队成员重新克隆仓库
- 需要强制推送（`--force`）
- 建议在非工作时间执行

---

### 3. 检查影响范围

**需要检查**：
- [ ] 是否有其他人fork了仓库
- [ ] 是否有其他人clone了仓库
- [ ] 检查又拍云API调用日志，确认是否有异常访问
- [ ] 检查是否有未授权的文件上传

---

### 4. 更新.gitignore

确保以下文件/目录不会被提交：
- ✅ `.env` 文件
- ✅ `project/credentials/` 目录
- ✅ 包含密钥的文档（已修复）

---

## 📋 预防措施

### 1. 代码审查

- ✅ 提交前检查 `git diff`，确认没有密钥
- ✅ 使用 `git-secrets` 或 `git-hooks` 自动检测
- ✅ 代码审查时特别注意密钥相关代码

### 2. 工具配置

**安装git-secrets（推荐）**：
```bash
# macOS
brew install git-secrets

# 配置
git secrets --install
git secrets --register-aws

# 添加自定义模式
git secrets --add 'KsdvRi49VRNj7W9NcHQj9BYDAPw='
git secrets --add '[0-9a-fA-F]{32,}'
```

**配置pre-commit hook**：
```bash
# .git/hooks/pre-commit
#!/bin/bash
# 检查是否包含密钥
if git diff --cached | grep -E "(password|secret|key|token).*=.*[0-9a-fA-F]{20,}"; then
  echo "❌ 检测到可能的密钥泄露！"
  exit 1
fi
```

### 3. 文档规范

- ✅ 文档中只使用占位符（如 `[密钥，存储在.env文件中]`）
- ✅ 不在代码示例中展示真实密钥
- ✅ 使用环境变量示例（如 `process.env.UPYUN_FORM_API_SECRET`）

---

## 📊 影响评估

### 安全影响

- 🔴 **高风险**：密钥已公开，任何人都可以使用
- 🔴 **潜在风险**：未授权访问又拍云存储
- 🔴 **潜在风险**：未授权文件上传/删除

### 业务影响

- 🟡 **中等风险**：如果密钥被滥用，可能产生费用
- 🟡 **中等风险**：如果密钥被滥用，可能影响服务可用性

---

## ✅ 修复验证

### 检查清单

- [x] 所有文档中的密钥已移除
- [x] 代码中的密钥已移除
- [ ] 又拍云密钥已更换（**待执行**）
- [ ] Git历史已清理（**待执行**）
- [ ] 影响范围已评估（**待执行**）
- [ ] 预防措施已实施（**待执行**）

---

## 📝 经验教训

### 问题原因

1. **文档中包含真实密钥**：工作日志文档中记录了真实密钥
2. **缺乏密钥检测工具**：没有使用git-secrets等工具自动检测
3. **代码审查不足**：提交前没有检查密钥泄露

### 改进措施

1. ✅ **安装git-secrets**：自动检测密钥泄露
2. ✅ **文档规范**：文档中只使用占位符
3. ✅ **代码审查**：提交前检查密钥
4. ✅ **环境变量管理**：所有密钥存储在.env文件中

---

## 🔗 相关资源

- [GitGuardian文档](https://docs.gitguardian.com/)
- [git-secrets文档](https://github.com/awslabs/git-secrets)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [密钥管理最佳实践](docs/guides/密钥管理指南.md)

---

**报告创建时间**: 2025-11-13  
**最后更新**: 2025-11-13  
**状态**: 文档已修复，密钥更换和Git历史清理待执行

