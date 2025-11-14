# Vercel测试检查清单

**创建日期**：2025-11-14  
**目标**：尽快在Vercel进行测试

---

## ✅ 已完成的工作

1. **前端硬编码修复** ✅
   - 所有 `localhost:3001` 已替换为 `API_CONFIG.API_BASE`
   - 代码已准备好部署

2. **代码准备** ✅
   - 前端代码已更新
   - 后端代码已准备好

---

## ⏳ 需要检查和配置的步骤

### 步骤1：检查后端API部署状态 🔴 重要

1. **访问Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到后端项目（可能名为 `backend` 或 `filmtrip-backend`）

2. **检查部署状态**
   - 进入 Deployments 页面
   - 查看最新的部署记录
   - ✅ 如果是 "Ready"：继续下一步
   - ❌ 如果是 "Error"：查看构建日志，修复问题

3. **检查Root Directory**
   - Settings → General → Root Directory
   - 应该设置为：`backend`
   - 如果不是，设置为 `backend` 并保存

---

### 步骤2：配置后端API环境变量 🔴 重要

1. **进入后端项目设置**
   - Vercel Dashboard → 后端项目 → Settings → Environment Variables

2. **添加以下环境变量**：

   #### 数据库配置（必需）
   ```env
   DATABASE_URL=postgresql://postgres:Guluhub%402026@db.xpcriheeehusrqyycdfx.supabase.co:5432/postgres
   ```
   ⚠️ **注意**：密码需要URL编码，`@` 编码为 `%40`

   #### 应用配置（必需）
   ```env
   NODE_ENV=production
   JWT_SECRET=你的JWT密钥（至少32个字符，随机生成）
   ```

   #### CORS配置（必需）
   ```env
   FRONTEND_URL=https://filmtrip.imhw.top
   ```

   #### 文件上传配置（可选）
   ```env
   UPLOAD_PATH=/tmp/uploads
   MAX_FILE_SIZE=10485760
   ```

3. **保存环境变量**
   - 点击 "Save"
   - 选择环境：Production（必需）、Preview、Development（可选）

4. **重新部署后端**
   - Deployments → Redeploy
   - 等待部署完成

---

### 步骤3：验证后端API连接 🔴 重要

1. **测试数据库连接**
   - 在本地测试：
     ```bash
     cd backend
     DATABASE_URL="postgresql://postgres:Guluhub%402026@db.xpcriheeehusrqyycdfx.supabase.co:5432/postgres" npm run test:pg
     ```
   - ✅ 应该显示：`✅ PostgreSQL连接成功！`

2. **测试API端点**
   - 访问：`https://api.filmtrip.imhw.top/api/health`（如果有健康检查端点）
   - 或者测试：`https://api.filmtrip.imhw.top/api/photos?limit=1`
   - ✅ 应该返回JSON数据或错误信息（不是404）

---

### 步骤4：配置前端环境变量 🔴 重要

1. **进入前端项目设置**
   - Vercel Dashboard → 前端项目 → Settings → Environment Variables

2. **添加以下环境变量**：

   ```env
   VITE_API_BASE=https://api.filmtrip.imhw.top/api
   VITE_BASE_URL=https://api.filmtrip.imhw.top
   VITE_SHORT_LINK_PREFIX=https://filmtrip.imhw.top/s
   VITE_UPYUN_DIRECT_UPLOAD=true
   ```

3. **保存环境变量**
   - 点击 "Save"
   - 选择环境：Production（必需）、Preview、Development（可选）

4. **重新部署前端**
   - Deployments → Redeploy
   - 等待部署完成

---

### 步骤5：验证前端部署 🔴 重要

1. **检查前端部署状态**
   - Vercel Dashboard → 前端项目 → Deployments
   - ✅ 确认最新部署状态是 "Ready"

2. **检查Root Directory**
   - Settings → General → Root Directory
   - 应该设置为：`frontend`
   - 如果不是，设置为 `frontend` 并保存

3. **检查Build Settings**
   - Settings → Build and Deployment
   - ✅ 确认Production Overrides已清空（使用Project Settings）
   - ✅ 确认Project Settings正确：
     - Build Command: `cd frontend && npm run build` 或 `npm run build`（如果设置了Root Directory）
     - Output Directory: `frontend/dist` 或 `dist`（如果设置了Root Directory）

---

### 步骤6：测试完整流程 ✅

1. **访问前端网站**
   - https://filmtrip.imhw.top
   - 打开浏览器开发者工具（F12）→ Network标签

2. **测试API请求**
   - 访问网站首页
   - 查看Network标签中的API请求
   - ✅ 应该看到请求发送到：`https://api.filmtrip.imhw.top/api/photos`
   - ✅ 如果返回200或401/403：后端API正常工作
   - ❌ 如果返回404：后端API未正确部署或路由配置错误

3. **测试登录功能**
   - 访问：`https://filmtrip.imhw.top/admin/login`
   - 尝试登录（如果后端API正常，应该能登录）

---

## 🚨 常见问题排查

### 问题1：前端返回404错误

**可能原因**：
1. 后端API未部署
2. 后端API路由配置错误
3. 前端API地址配置错误

**解决方案**：
1. 检查后端API部署状态
2. 检查后端API路由配置（`backend/index.js`）
3. 检查前端环境变量 `VITE_API_BASE`

---

### 问题2：后端API返回500错误

**可能原因**：
1. 数据库连接失败（`DATABASE_URL`配置错误）
2. 数据库表结构未创建
3. 环境变量缺失

**解决方案**：
1. 检查 `DATABASE_URL` 环境变量
2. 验证数据库连接：`npm run test:pg`
3. 检查部署日志中的错误信息

---

### 问题3：前端无法加载

**可能原因**：
1. Root Directory配置错误
2. Build Settings配置错误
3. 构建失败

**解决方案**：
1. 检查Root Directory设置为 `frontend`
2. 清空Production Overrides
3. 查看构建日志

---

## 📋 快速检查清单

完成以下检查后，就可以在Vercel测试了：

- [ ] ✅ 后端API项目已部署（Vercel Dashboard中可见）
- [ ] ✅ 后端部署状态是 "Ready"（不是 "Error"）
- [ ] ✅ 后端Root Directory设置为 `backend`
- [ ] ✅ 后端环境变量已配置（`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`）
- [ ] ✅ 数据库连接测试通过（`npm run test:pg`）
- [ ] ✅ API端点可以访问（`/api/photos` 返回正常或401/403）
- [ ] ✅ 前端项目已部署（Vercel Dashboard中可见）
- [ ] ✅ 前端部署状态是 "Ready"（不是 "Error"）
- [ ] ✅ 前端Root Directory设置为 `frontend`
- [ ] ✅ 前端环境变量已配置（`VITE_API_BASE`）
- [ ] ✅ Production Overrides已清空
- [ ] ✅ 前端网站可以访问（`https://filmtrip.imhw.top`）
- [ ] ✅ 浏览器Network标签显示API请求发送到正确的地址

---

## 🔧 快速操作指南

### 1. 检查后端API部署（5分钟）

```
Vercel Dashboard → 后端项目 → Deployments
检查最新部署状态
如果是Error，查看构建日志
```

### 2. 配置后端环境变量（5分钟）

```
Vercel Dashboard → 后端项目 → Settings → Environment Variables
添加：DATABASE_URL, JWT_SECRET, FRONTEND_URL
保存并重新部署
```

### 3. 验证后端API（2分钟）

```
访问：https://api.filmtrip.imhw.top/api/photos?limit=1
应该返回JSON或401/403（不是404）
```

### 4. 配置前端环境变量（5分钟）

```
Vercel Dashboard → 前端项目 → Settings → Environment Variables
添加：VITE_API_BASE=https://api.filmtrip.imhw.top/api
保存并重新部署
```

### 5. 测试前端（2分钟）

```
访问：https://filmtrip.imhw.top
打开开发者工具 → Network标签
查看API请求是否发送到正确的地址
```

---

## 💡 快速测试命令

### 测试数据库连接（本地）

```bash
cd backend
DATABASE_URL="postgresql://postgres:Guluhub%402026@db.xpcriheeehusrqyycdfx.supabase.co:5432/postgres" npm run test:pg
```

### 测试后端API（本地）

```bash
cd backend
DATABASE_URL="postgresql://postgres:Guluhub%402026@db.xpcriheeehusrqyycdfx.supabase.co:5432/postgres" npm start
# 然后在浏览器访问：http://localhost:3001/api/photos?limit=1
```

### 测试前端API请求（线上）

```bash
# 在浏览器中打开：https://filmtrip.imhw.top
# 打开开发者工具 → Network标签
# 查看API请求地址
```

---

**💡 提示**：如果所有检查项都完成，应该可以在Vercel正常测试了。如果遇到问题，请查看部署日志或联系我。

---

**最后更新**：2025-11-14  
**状态**：准备测试清单

