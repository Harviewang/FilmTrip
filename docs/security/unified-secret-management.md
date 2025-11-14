# 统一密钥管理方案

**创建日期**：2025-11-14  
**目的**：建立统一的密钥管理体系，防止密钥泄露

---

## 🚨 当前问题分析

### 密钥泄露的根本原因

1. **缺乏统一的密钥管理规范**
   - 密钥分散在多个文件中
   - 没有统一的存储位置
   - 没有明确的访问控制

2. **代码审查不足**
   - 硬编码密钥被提交到Git
   - 文档中记录了真实密钥
   - 没有pre-commit检查

3. **安全意识不足**
   - 在文档中记录密钥（以为不会被提交）
   - 在代码中硬编码密钥（方便开发）
   - 没有意识到Git历史会永久保存

---

## ✅ 统一密钥管理方案

### 方案架构

```
密钥管理架构：
┌─────────────────────────────────────┐
│  密钥存储层（唯一真实来源）          │
│  project/credentials/secrets.conf   │
│  - 所有密钥集中存储                  │
│  - 已添加到.gitignore               │
│  - 永远不会提交到Git                 │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  环境变量层（运行时使用）            │
│  - 本地：.env（已忽略）              │
│  - Vercel：环境变量配置              │
│  - 从secrets.conf加载到环境变量      │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  应用代码层（只读取环境变量）        │
│  - 永远不硬编码密钥                  │
│  - 只从process.env读取               │
│  - 提供清晰的错误提示                │
└─────────────────────────────────────┘
```

---

## 📋 密钥管理规范

### 1. 密钥存储规范

#### ✅ 唯一存储位置

**所有密钥必须存储在**：
```
project/credentials/secrets.conf
```

**文件结构**：
```bash
# 数据库配置
DATABASE_URL=postgresql://...

# MapTiler配置
MAPTILER_KEY=...

# 又拍云配置
UPYUN_OPERATOR=...
UPYUN_PASSWORD=...
UPYUN_FORM_API_SECRET=...

# JWT配置
JWT_SECRET=...

# 其他服务密钥
...
```

#### ✅ 文件保护

1. **`.gitignore` 保护**：
   ```
   project/credentials/secrets.conf
   ```

2. **权限保护**：
   ```bash
   chmod 600 project/credentials/secrets.conf
   ```

3. **备份保护**：
   - 不要将备份文件提交到Git
   - 使用加密备份（如密码管理器）

---

### 2. 代码使用规范

#### ✅ 正确做法

**使用环境变量**：
```javascript
// ✅ 正确：从环境变量读取
const MAPTILER_KEY = process.env.MAPTILER_KEY || process.env.VITE_MAPTILER_KEY;

if (!MAPTILER_KEY) {
  throw new Error('MAPTILER_KEY is not configured');
}
```

**提供清晰的错误提示**：
```javascript
if (!MAPTILER_KEY) {
  console.error('⚠️ MAPTILER_KEY is not configured in environment variables');
  console.error('请设置环境变量或在project/credentials/secrets.conf中配置');
  return res.status(500).json({
    success: false,
    message: '地图服务配置错误：缺少MAPTILER_KEY'
  });
}
```

#### ❌ 错误做法

**永远不要**：
```javascript
// ❌ 错误：硬编码密钥
const MAPTILER_KEY = 'YOUR_API_KEY_HERE';

// ❌ 错误：在注释中记录密钥
// MAPTILER_KEY=YOUR_API_KEY_HERE

// ❌ 错误：在文档中记录真实密钥
// 配置：MAPTILER_KEY=YOUR_API_KEY_HERE
```

---

### 3. 文档规范

#### ✅ 正确做法

**使用占位符**：
```markdown
**MapTiler配置**:
```bash
MAPTILER_KEY=[密钥存储在环境变量中]
```
- 配置位置：`project/credentials/secrets.conf`
- 环境变量：`VITE_MAPTILER_KEY`（前端）、`MAPTILER_KEY`（后端）
- ⚠️ **安全警告**: 密钥已从文档中移除，请使用环境变量配置
```

#### ❌ 错误做法

**永远不要**：
```markdown
// ❌ 错误：在文档中记录真实密钥
MAPTILER_KEY=YOUR_API_KEY_HERE
```

---

## 🛡️ 预防措施

### 1. Pre-commit Hook（代码提交前检查）

**创建 `.git/hooks/pre-commit`**：
```bash
#!/bin/bash

# 检查是否包含硬编码的密钥模式
if git diff --cached | grep -E "(MAPTILER_KEY|JWT_SECRET|DATABASE_URL|UPYUN_|API_KEY).*=" | grep -v "process.env\|import.meta.env\|\[.*已移除\|\[.*存储在" | grep -v "^\s*#"; then
  echo "⚠️  警告：检测到可能的密钥硬编码！"
  echo ""
  echo "请确保："
  echo "1. 使用环境变量（process.env.XXX 或 import.meta.env.XXX）"
  echo "2. 不要在代码中硬编码密钥"
  echo "3. 不要在文档中记录真实密钥"
  echo ""
  read -p "是否继续提交？(y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

**安装**：
```bash
chmod +x .git/hooks/pre-commit
```

---

### 2. 密钥扫描工具

#### 使用 GitGuardian（推荐）

1. **安装GitGuardian CLI**：
   ```bash
   pip install ggshield
   ```

2. **扫描仓库**：
   ```bash
   ggshield scan repo .
   ```

3. **集成到CI/CD**：
   ```yaml
   # .github/workflows/security.yml
   - name: Scan for secrets
     run: ggshield scan repo .
   ```

#### 使用 gitleaks

1. **安装**：
   ```bash
   brew install gitleaks
   ```

2. **扫描**：
   ```bash
   gitleaks detect --source . --verbose
   ```

3. **配置规则**：
   ```toml
   # .gitleaks.toml
   [[rules]]
   id = "maptiler-key"
   description = "MapTiler API Key"
   regex = '''[A-Za-z0-9]{20,}'''  # 匹配长密钥模式
   ```

---

### 3. 代码审查清单

**提交前检查**：
- [ ] ✅ 没有硬编码的API密钥
- [ ] ✅ 没有在注释中记录密钥
- [ ] ✅ 没有在文档中记录真实密钥
- [ ] ✅ 所有密钥都使用环境变量
- [ ] ✅ `.env` 文件已添加到 `.gitignore`
- [ ] ✅ `project/credentials/` 已添加到 `.gitignore`

---

## 📁 密钥管理目录结构

```
project/credentials/
├── README.md              # 密钥管理说明
├── secrets.conf           # 主密钥配置文件（.gitignore）
├── secrets.conf.example   # 示例文件（可提交，不含真实密钥）
├── load-secrets.sh        # 密钥加载脚本
└── .gitignore            # 确保secrets.conf不被提交
```

---

## 🔧 密钥加载和使用

### 本地开发环境

**加载密钥**：
```bash
# 方式1：使用加载脚本
source project/credentials/load-secrets.sh

# 方式2：手动加载
export $(cat project/credentials/secrets.conf | xargs)
```

**在代码中使用**：
```javascript
// 后端
const MAPTILER_KEY = process.env.MAPTILER_KEY;

// 前端（Vite）
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
```

---

### Vercel部署环境

**配置环境变量**：
1. Vercel Dashboard → 项目 → Settings → Environment Variables
2. 从 `secrets.conf` 复制密钥值
3. 添加到Vercel环境变量
4. 选择环境（Production/Preview/Development）

**⚠️ 注意**：
- 不要在Vercel Dashboard中截图分享
- 不要将Vercel环境变量导出到文件并提交

---

## 📋 密钥清单

### 当前管理的密钥

| 服务 | 环境变量名 | 存储位置 | 状态 |
|------|-----------|---------|------|
| **Supabase** | `DATABASE_URL` | `project/credentials/secrets.conf` | ✅ 已管理 |
| **MapTiler** | `VITE_MAPTILER_KEY` / `MAPTILER_KEY` | `project/credentials/secrets.conf` | ⚠️ 需要重新生成 |
| **又拍云** | `UPYUN_OPERATOR`, `UPYUN_PASSWORD`, `UPYUN_FORM_API_SECRET` | `project/credentials/secrets.conf` | ✅ 已管理 |
| **JWT** | `JWT_SECRET` | `project/credentials/secrets.conf` | ✅ 已管理 |

---

## 🚨 密钥泄露响应流程

### 发现泄露时

1. **立即禁用密钥**
   - 在服务提供商处禁用/删除泄露的密钥
   - 创建新的密钥

2. **从代码中删除**
   - 删除硬编码的密钥
   - 替换为环境变量

3. **从文档中删除**
   - 替换为占位符
   - 添加安全警告

4. **清理Git历史**（可选）
   - 使用BFG或git filter-branch
   - 强制推送（需要团队协调）

5. **更新环境变量**
   - 在Vercel中更新环境变量
   - 在本地更新 `secrets.conf`

6. **重新部署**
   - 重新部署所有受影响的服务

---

## ✅ 实施检查清单

### 立即执行

- [ ] ✅ 创建统一的密钥存储位置（`project/credentials/secrets.conf`）
- [ ] ✅ 将所有密钥迁移到统一位置
- [ ] ✅ 从代码中删除所有硬编码的密钥
- [ ] ✅ 从文档中删除所有真实密钥
- [ ] ✅ 添加pre-commit hook
- [ ] ✅ 配置密钥扫描工具
- [ ] ✅ 更新 `.gitignore` 确保密钥文件不被提交

### 长期维护

- [ ] ✅ 定期审查密钥使用情况
- [ ] ✅ 定期轮换密钥（每3-6个月）
- [ ] ✅ 监控密钥使用情况（异常使用告警）
- [ ] ✅ 培训团队成员密钥管理规范

---

## 📚 相关文档

- [密钥泄露响应计划](./secret-leak-response.md)
- [MapTiler Key泄露响应](./maptiler-key-leak-response.md)
- [安全审计报告](./security-audit-2025-11-14.md)
- [密钥管理指南](../guides/密钥管理指南.md)

---

## 💡 最佳实践总结

### ✅ 必须遵守

1. **唯一存储位置**：所有密钥存储在 `project/credentials/secrets.conf`
2. **环境变量使用**：代码中只使用环境变量，永远不硬编码
3. **文档占位符**：文档中使用占位符，不记录真实密钥
4. **Git保护**：确保密钥文件不被提交到Git
5. **定期审查**：定期检查代码和文档中是否有密钥泄露

### ❌ 永远不要

1. ❌ 在代码中硬编码密钥
2. ❌ 在文档中记录真实密钥
3. ❌ 在注释中记录密钥
4. ❌ 将密钥文件提交到Git
5. ❌ 在公开场合分享密钥

---

**💡 提示**：建立统一的密钥管理方案后，所有密钥都应该：
1. 存储在 `project/credentials/secrets.conf`（唯一真实来源）
2. 通过环境变量传递给应用
3. 代码中只读取环境变量，不硬编码
4. 文档中使用占位符，不记录真实密钥

---

**最后更新**：2025-11-14  
**状态**：统一密钥管理方案

