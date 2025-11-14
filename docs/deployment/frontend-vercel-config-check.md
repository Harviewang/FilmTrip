# 前端 Vercel 部署配置检查

**创建日期**：2025-11-14  
**问题**：前端部署失败（Error状态）

---

## 🔍 问题分析

从 Vercel 部署列表看到：
- **最新部署** `BV8Hx1bpX` 显示 **Error** 状态（1秒前）
- **当前成功部署** `932WGPpYQ`（18秒前，标记为"Current"）

---

## 📋 Vercel 项目配置检查清单

### 步骤1：检查 Vercel 项目设置

1. **访问 Vercel Dashboard**
   - 网址：https://vercel.com/dashboard
   - 找到前端项目（可能名为 `frontend` 或 `filmtrip-frontend`）

2. **进入项目设置**
   - 点击项目名称
   - 点击顶部导航 **Settings**

3. **检查 General 设置**
   - 点击左侧菜单 **General**
   - 确认以下配置：

#### ✅ Root Directory（根目录）

**正确配置**：
- Root Directory：`frontend`
- ⚠️ **重要**：必须设置为 `frontend`，因为项目是 monorepo 结构

**检查方法**：
- 在 General 页面找到 "Root Directory" 部分
- 确认设置为 `frontend`
- 如果没有设置或设置为 `/`，需要修改

#### ✅ Framework Preset（框架预设）

**正确配置**：
- Framework Preset：`Vite`
- 或设置为 `Other`

#### ✅ Build & Development Settings（构建和开发设置）

**正确配置**：
- Build Command：`npm run build`
- Output Directory：`dist`
- Install Command：`npm install`
- Development Command：`npm run dev`

---

## 🔧 修复步骤

### 如果 Root Directory 配置错误

1. **在 Vercel Dashboard**：
   - 进入项目 → Settings → General
   - 找到 "Root Directory" 部分
   - 点击 "Edit"
   - 设置为：`frontend`
   - 点击 "Save"

2. **验证配置**：
   - 保存后，Vercel 会自动触发新的部署
   - 等待部署完成

---

### 如果构建命令配置错误

1. **检查 vercel.json**：
   - 确认 `frontend/vercel.json` 存在
   - 内容应该包含：
     ```json
     {
       "version": 2,
       "buildCommand": "npm run build",
       "outputDirectory": "dist",
       "framework": "vite"
     }
     ```

2. **检查 package.json**：
   - 确认 `frontend/package.json` 中有 `build` 脚本：
     ```json
     {
       "scripts": {
         "build": "vite build"
       }
     }
     ```

---

## 🚨 常见错误和解决方案

### 错误1：Build failed - Cannot find module

**可能原因**：
- Root Directory 未设置为 `frontend`
- 依赖未正确安装

**解决方案**：
1. 确认 Root Directory 设置为 `frontend`
2. 清除构建缓存：
   - Settings → General → Clear Build Cache
   - 重新部署

### 错误2：Build failed - Output directory not found

**可能原因**：
- Output Directory 配置错误
- 构建未生成 `dist` 目录

**解决方案**：
1. 确认 Output Directory 设置为 `dist`
2. 检查本地构建是否成功：
   ```bash
   cd frontend
   npm run build
   ```
3. 确认生成了 `dist` 目录

### 错误3：Build failed - Missing environment variables

**可能原因**：
- 前端环境变量缺失

**解决方案**：
1. 检查 Settings → Environment Variables
2. 确认以下变量已配置（如果需要）：
   - `VITE_API_BASE`
   - `VITE_BASE_URL`
   - `VITE_SHORT_LINK_PREFIX`
   - `VITE_UPYUN_DIRECT_UPLOAD`

---

## ✅ 验证清单

配置完成后，请确认：

- [ ] ✅ Root Directory 设置为 `frontend`
- [ ] ✅ Framework Preset 设置为 `Vite` 或 `Other`
- [ ] ✅ Build Command 为 `npm run build`
- [ ] ✅ Output Directory 为 `dist`
- [ ] ✅ Install Command 为 `npm install`
- [ ] ✅ `frontend/vercel.json` 文件存在且配置正确
- [ ] ✅ `frontend/package.json` 中有 `build` 脚本
- [ ] ✅ 环境变量已正确配置（如果需要）

---

## 🔍 查看部署日志

如果部署仍然失败，请查看部署日志：

1. **在 Vercel Dashboard**：
   - 进入项目 → Deployments
   - 点击失败的部署（显示 Error 的）
   - 查看 Build Logs 或 Function Logs
   - 查找错误信息

2. **常见日志错误**：
   - `Error: Cannot find module` - 依赖问题
   - `Error: Build failed` - 构建命令问题
   - `Error: Output directory not found` - 输出目录问题

---

## 📋 推荐的 Vercel 配置

### General 设置

- **Project Name**：`frontend` 或 `filmtrip-frontend`
- **Root Directory**：`frontend` ⚠️ **重要**
- **Framework Preset**：`Vite`

### Build & Development Settings

- **Build Command**：`npm run build`
- **Output Directory**：`dist`
- **Install Command**：`npm install`
- **Development Command**：`npm run dev`

### Environment Variables

- `VITE_API_BASE`：`https://api.filmtrip.imhw.top/api`
- `VITE_BASE_URL`：`https://api.filmtrip.imhw.top`
- `VITE_SHORT_LINK_PREFIX`：`https://filmtrip.imhw.top/s`
- `VITE_UPYUN_DIRECT_UPLOAD`：`true`

---

## 🔄 重新部署步骤

1. **修复配置**
   - 按照上面的检查清单修复配置

2. **清除构建缓存**
   - Settings → General → Clear Build Cache

3. **触发新部署**
   - 方法1：推送到 GitHub（会自动触发）
   - 方法2：在 Deployments 页面点击 "Redeploy"
   - 方法3：使用 Vercel CLI：
     ```bash
     cd frontend
     vercel --prod
     ```

4. **验证部署**
   - 等待部署完成
   - 访问网站验证功能正常

---

## 📚 相关文档

- [Vercel 部署指南](../guides/部署指南.md)
- [Vercel 自动部署检查](./vercel-auto-deploy-check.md)
- [环境策略](./environment-strategy.md)

---

**最后更新**：2025-11-14  
**状态**：待检查和修复

