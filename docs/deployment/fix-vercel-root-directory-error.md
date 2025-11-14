# 修复 Vercel Root Directory 错误

**问题**：`The specified Root Directory "frontend" does not exist. Please update your Project Settings.`

**创建日期**：2025-11-14

---

## 🔍 问题分析

### 错误信息
```
The specified Root Directory "frontend" does not exist. Please update your Project Settings.
```

### 本地检查结果

✅ **本地确认**：
- `frontend` 目录存在
- `frontend` 目录在 Git 仓库中
- `frontend` 目录未被 `.gitignore` 忽略
- `frontend` 目录下有文件（已验证）

❌ **Vercel 错误**：
- 部署时找不到 `frontend` 目录

---

## 🔧 可能的原因和解决方案

### 原因1：Vercel 项目 Git 连接错误

**问题**：
- Vercel 项目连接到了错误的 Git 仓库
- 或连接到了错误的分支

**解决方案**：

1. **检查 Git 连接**：
   - 进入 Vercel Dashboard
   - 前端项目 → Settings → Git
   - 确认以下配置：
     - ✅ Repository: `Harviewang/FilmTrip`
     - ✅ Production Branch: `main`
     - ✅ Root Directory: `frontend`（如果显示）

2. **如果 Git 连接错误**：
   - 点击 "Disconnect" 断开连接
   - 点击 "Connect Git Repository"
   - 选择正确的仓库：`Harviewang/FilmTrip`
   - 确认分支：`main`
   - 连接后会自动触发新部署

---

### 原因2：Root Directory 路径配置错误

**问题**：
- Root Directory 设置了错误的路径
- 或设置了相对路径而不是目录名

**解决方案**：

1. **检查 Root Directory 设置**：
   - 前端项目 → Settings → General
   - 找到 "Root Directory" 部分
   - 应该设置为：`frontend`
   - ⚠️ **不要**使用 `/frontend` 或 `./frontend`

2. **修复 Root Directory**：
   - 点击 "Edit"
   - 设置为：`frontend`（只有目录名，没有斜杠）
   - 点击 "Save"
   - 会自动触发新部署

---

### 原因3：Git 仓库分支不包含 frontend 目录

**问题**：
- Vercel 连接的分支可能不包含 `frontend` 目录
- 或分支中的 `frontend` 目录被删除

**解决方案**：

1. **验证 Git 仓库**：
   ```bash
   git ls-tree HEAD --name-only | grep frontend
   ```
   
   应该能看到：
   ```
   frontend/
   frontend/.gitignore
   frontend/package.json
   ...
   ```

2. **检查分支**：
   ```bash
   git branch -a
   git log --oneline --all --graph -10
   ```

3. **如果分支有问题**：
   - 确保 `main` 分支包含 `frontend` 目录
   - 如果没有，合并或切换到正确的分支

---

### 原因4：Vercel 缓存问题

**问题**：
- Vercel 使用了旧的缓存
- 缓存中的项目结构不包含 `frontend` 目录

**解决方案**：

1. **清除构建缓存**：
   - 前端项目 → Settings → General
   - 找到 "Clear Build Cache" 或类似选项
   - 点击清除缓存
   - 重新部署

2. **强制重新部署**：
   - 进入 Deployments 页面
   - 点击最新的部署（即使是失败的）
   - 点击 "Redeploy"
   - 选择 "Clear Build Cache"（如果有选项）

---

## ✅ 推荐的修复步骤

### 步骤1：检查 Git 连接

1. **访问 Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到前端项目

2. **进入 Git 设置**
   - Settings → Git

3. **确认配置**：
   - ✅ Repository: `Harviewang/FilmTrip`
   - ✅ Production Branch: `main`
   - ✅ Connected: Yes

4. **如果配置错误**：
   - 断开连接
   - 重新连接正确的仓库和分支

---

### 步骤2：检查 Root Directory 设置

1. **进入 General 设置**
   - Settings → General

2. **找到 Root Directory**
   - 应该显示：`frontend`

3. **如果未设置或错误**：
   - 点击 "Edit"
   - 输入：`frontend`（只有目录名）
   - 保存

4. **验证**：
   - 保存后会显示：`Root Directory: frontend`
   - 会自动触发新部署

---

### 步骤3：清除缓存并重新部署

1. **清除构建缓存**：
   - Settings → General → Clear Build Cache
   - 或 Deployments → Redeploy → Clear Build Cache

2. **重新部署**：
   - Deployments → 点击 "Redeploy"
   - 等待部署完成

3. **验证**：
   - 查看部署日志
   - 确认不再出现 Root Directory 错误

---

## 🔍 验证清单

修复后，请确认：

- [ ] ✅ Git 连接正确（Repository: Harviewang/FilmTrip）
- [ ] ✅ Production Branch 设置为 `main`
- [ ] ✅ Root Directory 设置为 `frontend`（不是 `/frontend`）
- [ ] ✅ 构建缓存已清除
- [ ] ✅ 新部署成功（不再出现 Root Directory 错误）
- [ ] ✅ 网站可以正常访问

---

## 🚨 如果问题仍然存在

### 检查 Git 仓库状态

```bash
# 确认frontend目录在仓库中
git ls-tree HEAD --name-only | grep "^frontend"

# 确认frontend目录下有文件
git ls-tree -r HEAD --name-only | grep "^frontend/" | head -10

# 检查最近提交
git log --oneline --all -10
```

### 手动测试部署

1. **使用 Vercel CLI**：
   ```bash
   cd frontend
   vercel --prod
   ```
   
   这会直接从 `frontend` 目录部署，应该能成功。

2. **如果 CLI 部署成功**：
   - 说明代码没问题
   - 问题在 Vercel Dashboard 的配置
   - 检查 Git 连接和 Root Directory 设置

---

## 📚 相关文档

- [前端 Vercel 配置检查](./frontend-vercel-config-check.md)
- [Vercel 部署指南](../guides/部署指南.md)
- [环境策略](./environment-strategy.md)

---

**💡 提示**：最常见的问题是 Root Directory 设置错误。确保设置为 `frontend`（只有目录名，没有前导斜杠）。

---

**最后更新**：2025-11-14  
**状态**：待修复

