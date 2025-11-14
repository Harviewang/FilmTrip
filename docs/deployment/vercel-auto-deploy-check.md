# 如何确认 Vercel 自动部署已启用

## 📋 检查步骤

### 方法1：检查 Git 连接设置（最准确）

1. **打开 Vercel Dashboard**
   - 访问 [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - 找到并点击您的后端项目（`backend`）

2. **进入 Git 设置**
   - 点击左侧菜单的 **"Git"**
   - 或点击 **Settings** → **Git**

3. **检查连接状态**
   
   ✅ **已连接（自动部署启用）**：
   - 显示 "Connected to GitHub"
   - 仓库名称：`Harviewang/FilmTrip`
   - Production Branch: `main`
   - 有 "Disconnect" 按钮

   ❌ **未连接（需要手动部署）**：
   - 显示 "Connect Git Repository"
   - 有 "Connect" 按钮
   - 需要点击连接 GitHub 仓库

---

### 方法2：查看部署记录

1. **打开 Deployments 页面**
   - 在项目页面，点击顶部导航的 **"Deployments"**

2. **查看部署触发方式**
   
   ✅ **自动部署**：
   - 部署记录显示 "Triggered by GitHub push"
   - 或显示 "Triggered by GitHub commit"
   - 有 GitHub 提交信息链接

   ⚠️ **手动部署**：
   - 部署记录显示 "Triggered manually"
   - 或显示 "Redeployed"
   - 没有 GitHub 提交信息

---

### 方法3：实时测试

1. **推送代码到 GitHub**
   ```bash
   git push origin main
   ```

2. **观察 Vercel Dashboard**
   - 等待 10-30 秒
   - 在 Deployments 页面刷新
   - 如果出现新的部署记录 → ✅ 自动部署已启用
   - 如果没有新部署 → ⚠️ 需要检查 Git 连接

---

## 🔧 如果自动部署未启用

### 步骤1：连接 GitHub 仓库

1. 在 Vercel 项目页面，点击 **Settings** → **Git**
2. 点击 **"Connect Git Repository"**
3. 选择 **GitHub**
4. 授权 Vercel 访问 GitHub
5. 选择仓库：`Harviewang/FilmTrip`
6. 确认 Production Branch 是 `main`
7. 点击 **"Connect"**

### 步骤2：验证连接

1. 连接成功后，会显示：
   - ✅ "Connected to GitHub"
   - ✅ 仓库名称
   - ✅ Production Branch

2. 推送测试代码：
   ```bash
   git commit --allow-empty -m "test: 测试自动部署"
   git push origin main
   ```

3. 等待 1-2 分钟，检查 Vercel 是否有新部署

---

## 📊 自动部署的工作原理

### 触发条件

Vercel 会在以下情况自动部署：

1. **推送到 main 分支**（生产环境）
   - 自动触发 Production 部署
   - 使用 Production 环境变量

2. **创建 Pull Request**（预览环境）
   - 自动触发 Preview 部署
   - 使用 Preview 环境变量
   - 每个 PR 都有独立的预览 URL

3. **推送到其他分支**（预览环境）
   - 自动触发 Preview 部署
   - 使用 Preview 环境变量

### 部署流程

```
GitHub Push → Vercel 检测 → 触发构建 → 部署完成
    ↓              ↓              ↓           ↓
  推送代码      自动检测      执行构建    更新网站
```

---

## ✅ 验证清单

完成以下检查，确认自动部署已正确配置：

- [ ] ✅ Vercel 项目已连接到 GitHub 仓库
- [ ] ✅ 仓库名称正确：`Harviewang/FilmTrip`
- [ ] ✅ Production Branch 设置为 `main`
- [ ] ✅ 最近的部署显示 "Triggered by GitHub push"
- [ ] ✅ 推送代码后，Vercel 自动创建新部署
- [ ] ✅ 部署日志显示构建成功

---

## 🚨 常见问题

### Q1: 推送代码后没有自动部署？

**检查清单**：
1. ✅ Git 连接是否正常（Settings → Git）
2. ✅ 推送的分支是否是 `main`（生产环境）
3. ✅ 等待 1-2 分钟（Vercel 需要时间检测）
4. ✅ 检查 Vercel 部署日志是否有错误

### Q2: 如何禁用自动部署？

1. 进入 Settings → Git
2. 点击 "Disconnect" 断开 Git 连接
3. 之后只能手动部署

### Q3: 如何只部署特定分支？

1. 进入 Settings → Git
2. 在 "Production Branch" 中选择特定分支
3. 只有推送到该分支才会触发生产部署

---

## 💡 最佳实践

1. **保持 Git 连接**：确保 Vercel 始终连接到 GitHub
2. **使用分支保护**：在 GitHub 中设置分支保护规则
3. **监控部署**：定期检查部署日志，确保没有错误
4. **使用预览部署**：在合并 PR 前，使用预览部署测试

---

**💡 提示**：如果刚才推送了代码，等待 1-2 分钟后检查 Vercel Deployments 页面，应该能看到新的部署记录。



