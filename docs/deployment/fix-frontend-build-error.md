# 修复前端部署Build错误

**创建日期**：2025-11-14  
**问题**：前端部署失败，错误：`npm error Missing script: "build"`

---

## 🔍 问题分析

### 错误信息
```
npm error Missing script: "build"
Error: Command "npm run build" exited with 1
```

### 可能的原因

1. **Vercel项目Root Directory配置错误**
   - Root Directory未设置为 `frontend`
   - 导致Vercel在项目根目录执行build命令

2. **Vercel项目Build Command配置错误**
   - Build Command配置为 `npm run build`（在根目录）
   - 但根目录的package.json没有build脚本

3. **前端项目识别问题**
   - Vercel没有正确识别前端项目
   - Framework Preset配置错误

---

## 🔧 解决方案

### 方案1：检查并修复Root Directory（推荐）

1. **访问Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到前端项目（Project Name: `frontend`）

2. **检查Root Directory（在Build and Deployment设置中）**
   - Settings → **Build and Deployment**（不是General）
   - 找到 "Root Directory" 设置
   - 应该设置为：`frontend`
   - 如果未设置或设置为空，设置为 `frontend` 并保存

3. **检查Build Settings**
   - 在同一页面（Build and Deployment）
   - Build Command 应该是：`npm run build`
   - Output Directory 应该是：`dist`
   - Install Command 应该是：`npm install`

4. **清空Production Overrides**
   - 在同一页面展开 "Production Overrides"
   - 清空所有字段（如果有的话）
   - 保存

5. **重新部署**
   - Deployments → 选择最新的部署 → Redeploy
   - 等待部署完成

---

### 方案2：如果Root Directory已正确

如果Root Directory已经是 `frontend`，但仍然失败：

1. **检查前端package.json**
   - 确认 `frontend/package.json` 中有 `build` 脚本
   - 应该是：`"build": "vite build"`

2. **检查Vercel构建日志**
   - Deployments → 点击失败的部署
   - 查看 Build Logs
   - 查找具体错误信息

3. **验证本地构建**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   - 如果本地构建失败，修复问题
   - 如果本地构建成功，问题在Vercel配置

---

## 📋 验证清单

- [ ] ✅ Root Directory 设置为 `frontend`
- [ ] ✅ Build Command 为 `npm run build`
- [ ] ✅ Output Directory 为 `dist`
- [ ] ✅ Install Command 为 `npm install`
- [ ] ✅ Production Overrides 已清空
- [ ] ✅ `frontend/package.json` 中有 `build` 脚本
- [ ] ✅ 本地构建成功（`cd frontend && npm run build`）
- [ ] ✅ 重新部署成功

---

## 🚨 常见问题

### Q1: Root Directory已设置为frontend，但仍然失败？

**A**: 
1. 检查 `frontend/package.json` 中是否有 `build` 脚本
2. 检查Vercel构建日志中的具体错误
3. 尝试清除构建缓存并重新部署

### Q2: 本地构建成功，但Vercel构建失败？

**A**: 
1. 检查Vercel环境变量配置
2. 检查Node.js版本是否匹配
3. 检查依赖安装是否成功

---

## 📚 相关文档

- [前端Vercel配置检查](./frontend-vercel-config-check.md)
- [修复Vercel Build Overrides](./fix-vercel-build-overrides.md)
- [修复Vercel Root Directory错误](./fix-vercel-root-directory-error.md)

---

**💡 提示**：最常见的原因是Root Directory配置错误。确保设置为 `frontend`，这样Vercel会在 `frontend` 目录下执行 `npm run build`。

---

**最后更新**：2025-11-14  
**状态**：待修复

