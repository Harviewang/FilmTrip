# MapTiler API Key 泄露响应

**创建日期**：2025-11-14  
**严重程度**：🔴 高  
**状态**：已泄露，需要立即处理

---

## 🚨 问题概述

MapTiler API Key `DKuhLqblnLLkKdQ88ScQ` 已在Git仓库中泄露，包括在GitHub公开仓库中。

---

## 📋 泄露位置

### 已提交到Git的文件（GitHub公开仓库）

1. **`docs/work-plans/2025-10-24/密钥管理与部署修复.md`**
   - 第55行：`MAPTILER_KEY=DKuhLqblnLLkKdQ88ScQ`
   - 状态：✅ 已提交到Git

2. **`docs/work-plans/2025-10-21/daily-note.md`**
   - 包含：`VITE_MAPTILER_KEY=DKuhLqblnLLkKdQ88ScQ`
   - 状态：✅ 已提交到Git

3. **`backend/routes/geocode.js`**
   - 代码中硬编码：`const MAPTILER_KEY = 'DKuhLqblnLLkKdQ88ScQ';`
   - 状态：✅ 已提交到Git（严重！）

4. **`test-maptiler-global.js`**
   - 测试文件中硬编码
   - 状态：✅ 已提交到Git

### Git历史记录

从Git历史看到，这些文件在以下提交中已经包含key：
- `d64b819` - docs: 完善密钥管理系统并修复Vercel部署
- `82f5ea9` - feat: 添加MapTiler反向地理编码API
- 其他相关提交

---

## 🔴 立即执行的操作

### 步骤1：禁用/重新生成MapTiler API Key（最高优先级）

1. **访问MapTiler Dashboard**
   - https://cloud.maptiler.com/
   - 登录您的账号

2. **禁用或删除泄露的Key**
   - 进入 API Keys 页面
   - 找到 `DKuhLqblnLLkKdQ88ScQ`
   - **立即禁用或删除**

3. **创建新的API Key**
   - 创建新的API Key
   - 记录新的Key（这次不要泄露！）

---

### 步骤2：从代码中删除硬编码的Key

#### 2.1 修复 `backend/routes/geocode.js`

**当前代码**：
```javascript
const MAPTILER_KEY = 'DKuhLqblnLLkKdQ88ScQ';
```

**修复为**：
```javascript
const MAPTILER_KEY = process.env.MAPTILER_KEY || process.env.VITE_MAPTILER_KEY;
```

---

#### 2.2 从文档中删除Key

**文件**：
- `docs/work-plans/2025-10-24/密钥管理与部署修复.md`
- `docs/work-plans/2025-10-21/daily-note.md`

**修复**：替换为占位符：
```bash
MAPTILER_KEY=[密钥已移除，存储在环境变量中]
```

---

#### 2.3 修复测试文件

**文件**：`test-maptiler-global.js`

**修复**：使用环境变量：
```javascript
const MAPTILER_KEY = process.env.MAPTILER_KEY || process.env.VITE_MAPTILER_KEY;
```

---

### 步骤3：清理Git历史（可选但推荐）

**⚠️ 注意**：如果仓库是公开的，GitHub上已经暴露了，但清理Git历史仍然有价值。

**方法1：使用git filter-branch**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/routes/geocode.js test-maptiler-global.js docs/work-plans/2025-10-24/密钥管理与部署修复.md docs/work-plans/2025-10-21/daily-note.md" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送（危险！）
git push origin --force --all
```

**方法2：使用BFG Repo-Cleaner**
```bash
# 创建替换文件
echo 'DKuhLqblnLLkKdQ88ScQ==>[REMOVED]' > replacements.txt

# 运行BFG
bfg --replace-text replacements.txt

# 清理并推送
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin --force --all
```

**⚠️ 警告**：
- 清理Git历史会影响所有协作者
- 需要强制推送，可能影响其他分支
- 建议先备份仓库

---

### 步骤4：更新环境变量

#### 后端环境变量（Vercel）

1. **访问Vercel Dashboard**
   - 后端项目 → Settings → Environment Variables

2. **添加环境变量**
   ```
   名称: MAPTILER_KEY
   值: [新的MapTiler API Key]
   环境: Production, Preview, Development
   ```

#### 前端环境变量（Vercel）

1. **访问Vercel Dashboard**
   - 前端项目 → Settings → Environment Variables

2. **更新环境变量**
   ```
   名称: VITE_MAPTILER_KEY
   值: [新的MapTiler API Key]
   环境: Production, Preview, Development
   ```

---

## 📋 修复清单

- [ ] ✅ 在MapTiler中禁用/删除泄露的API Key
- [ ] ✅ 创建新的MapTiler API Key
- [ ] ✅ 从 `backend/routes/geocode.js` 删除硬编码的key
- [ ] ✅ 从 `test-maptiler-global.js` 删除硬编码的key
- [ ] ✅ 从文档中删除key（替换为占位符）
- [ ] ✅ 更新Vercel后端环境变量（MAPTILER_KEY）
- [ ] ✅ 更新Vercel前端环境变量（VITE_MAPTILER_KEY）
- [ ] ⏳ 清理Git历史（可选）
- [ ] ✅ 提交修复
- [ ] ✅ 重新部署后端和前端

---

## 💡 预防措施

### 1. 使用环境变量

**✅ 正确做法**：
```javascript
const MAPTILER_KEY = process.env.MAPTILER_KEY || process.env.VITE_MAPTILER_KEY;
```

**❌ 错误做法**：
```javascript
const MAPTILER_KEY = 'DKuhLqblnLLkKdQ88ScQ'; // 永远不要硬编码！
```

---

### 2. 检查提交前

**使用pre-commit hook**：
```bash
# .git/hooks/pre-commit
#!/bin/bash
if git diff --cached | grep -q "MAPTILER_KEY.*="; then
  echo "⚠️ 警告：检测到MapTiler Key！"
  echo "请确保使用环境变量，不要硬编码！"
  exit 1
fi
```

---

### 3. 使用密钥扫描工具

- **GitGuardian**：自动扫描仓库中的密钥
- **truffleHog**：扫描Git历史中的密钥
- **gitleaks**：轻量级密钥扫描工具

---

## 🔍 当前影响评估

### 泄露范围

- **GitHub公开仓库**：✅ 是的，key已暴露
- **Git历史**：✅ 是的，在多个提交中
- **已推送到远程**：✅ 是的

### 潜在风险

1. **配额滥用**：攻击者可能使用您的MapTiler配额
2. **费用**：如果超出免费额度，可能产生费用
3. **服务中断**：如果配额耗尽，地图功能可能无法使用

### 缓解措施

1. **立即禁用key**：防止进一步滥用
2. **监控使用量**：在MapTiler Dashboard中查看异常使用
3. **重新生成key**：确保旧key无法使用

---

## 📚 相关文档

- [密钥泄露响应计划](./secret-leak-response.md)
- [安全审计报告](./security-audit-2025-11-14.md)
- [密钥管理指南](../guides/密钥管理指南.md)

---

## ⚠️ 重要提醒

**这次泄露的原因是**：
1. 在文档中记录了key（`docs/work-plans/2025-10-24/密钥管理与部署修复.md`）
2. 在代码中硬编码了key（`backend/routes/geocode.js`）
3. 这些文件被提交到了Git并推送到GitHub

**教训**：
- ❌ **永远不要**在代码中硬编码API密钥
- ❌ **永远不要**在文档中记录真实的密钥
- ✅ **始终使用**环境变量
- ✅ **使用**.gitignore保护敏感文件

---

**💡 提示**：即使清理了Git历史，GitHub上的公开仓库中仍然可以访问历史记录。最好的方法是：
1. 立即禁用泄露的key
2. 创建新的key
3. 从代码和文档中删除旧key
4. 更新环境变量

---

**最后更新**：2025-11-14  
**状态**：🔴 紧急 - 需要立即处理

