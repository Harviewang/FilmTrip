# 后端API连接检查

**创建日期**：2025-11-14  
**问题**：前端请求后端API返回404，需要检查后端API部署和数据库连接

---

## 🔍 问题分析

### 从Vercel日志看到

**前端日志显示**：
- 大量404错误：`/api/photos`, `/api/filmStocks`, `/api/filmRolls` 等
- 前端在请求后端API，但找不到API端点

**前端架构**：
- 前端 → 后端API（`api.filmtrip.imhw.top`） → Supabase数据库
- 这是标准的三层架构，**不是前端直接访问Supabase**

---

## ✅ 已修复的问题

### 前端硬编码修复

已修复所有硬编码的 `localhost:3001`，替换为 `API_CONFIG.API_BASE`：

- ✅ `FilmStockManagement.jsx`
- ✅ `FilmRollManagement.jsx`
- ✅ `CameraManagement.jsx`
- ✅ `FilmStripViewer/index.jsx`
- ✅ `FilmCanisterCard/index.jsx`

现在前端会根据环境变量自动选择正确的API地址：
- 生产环境：`https://api.filmtrip.imhw.top/api`
- 开发环境：`http://localhost:3001/api`

---

## 🔍 需要检查的问题

### 问题1：后端API部署状态

**检查步骤**：

1. **访问Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到后端项目（可能名为 `backend` 或 `filmtrip-backend`）

2. **检查部署状态**
   - 进入 Deployments 页面
   - 查看最新的部署记录
   - 确认部署状态是 "Ready"（不是 "Error"）

3. **测试API端点**
   ```bash
   # 测试健康检查端点
   curl https://api.filmtrip.imhw.top/api/health
   
   # 测试照片列表
   curl https://api.filmtrip.imhw.top/api/photos?limit=1
   ```

4. **如果API返回404**
   - 检查后端项目部署是否成功
   - 检查后端项目的Root Directory设置（应该是 `backend`）
   - 检查后端项目的 `vercel.json` 配置

---

### 问题2：后端API数据库连接

**检查步骤**：

1. **检查后端环境变量**
   - Vercel Dashboard → 后端项目 → Settings → Environment Variables
   - 确认 `DATABASE_URL` 已配置
   - 确认格式正确：`postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

2. **验证数据库连接**
   - 检查后端部署日志
   - 查找数据库连接相关的日志
   - 确认是否有连接错误

3. **测试数据库连接**
   - 在本地测试：
     ```bash
     cd backend
     npm run test:pg
     ```
   - 应该显示：`✅ PostgreSQL连接成功！`

---

### 问题3：后端API路由配置

**检查步骤**：

1. **检查后端路由文件**
   - 确认 `backend/index.js` 中有API路由配置
   - 确认路由前缀是 `/api`

2. **检查Vercel配置**
   - 确认 `backend/vercel.json` 配置正确
   - 确认路由重写规则正确

---

## 🔧 修复步骤

### 步骤1：检查后端API部署

1. **访问Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到后端项目

2. **检查部署状态**
   - Deployments → 查看最新部署
   - 如果是 "Error"，查看构建日志

3. **如果部署失败**
   - 检查 Root Directory（应该是 `backend`）
   - 检查 `vercel.json` 配置
   - 检查环境变量配置

---

### 步骤2：检查后端数据库连接

1. **检查环境变量**
   - Settings → Environment Variables
   - 确认 `DATABASE_URL` 已配置
   - 确认密码已更新（新密码：`Guluhub@2026`，URL编码：`Guluhub%402026`）

2. **更新DATABASE_URL（如果需要）**
   ```
   postgresql://postgres:Guluhub%402026@db.xpcriheeehusrqyycdfx.supabase.co:5432/postgres
   ```

3. **重新部署后端**
   - Deployments → Redeploy
   - 等待部署完成

4. **验证连接**
   - 查看部署日志
   - 确认没有数据库连接错误

---

### 步骤3：验证API端点

1. **测试健康检查**
   ```bash
   curl https://api.filmtrip.imhw.top/api/health
   ```

2. **测试照片列表**
   ```bash
   curl https://api.filmtrip.imhw.top/api/photos?limit=1
   ```

3. **如果返回404**
   - 检查后端路由配置
   - 检查 `vercel.json` 配置
   - 检查后端部署状态

---

## 📋 架构说明

### 当前架构（标准三层架构）

```
前端（React）
  ↓ HTTP请求
后端API（Node.js/Express）
  ↓ 数据库查询
Supabase PostgreSQL
```

**说明**：
- ✅ 前端通过后端API访问数据（**这是正确的**）
- ✅ 后端API连接Supabase数据库（**这是正确的**）
- ❌ 前端**不应该**直接访问Supabase（这是架构问题）

### 数据流

1. **前端发起请求**：
   - 前端代码调用：`API_CONFIG.API_BASE + '/photos'`
   - 生产环境：`https://api.filmtrip.imhw.top/api/photos`

2. **后端API处理**：
   - 后端接收请求：`/api/photos`
   - 后端连接Supabase数据库
   - 执行SQL查询：`SELECT * FROM photos ...`

3. **返回数据**：
   - Supabase返回数据
   - 后端API格式化数据
   - 返回JSON给前端

---

## ⚠️ 常见问题

### Q1: 为什么前端不能直接访问Supabase？

**A**: 
- **安全原因**：数据库凭证不应该暴露在前端
- **架构原因**：业务逻辑应该在后端处理
- **权限原因**：后端可以控制访问权限和数据处理

### Q2: 前端应该如何使用Supabase？

**A**: 
有两种方式：

**方式1（当前使用）**：前端 → 后端API → Supabase
- ✅ 安全（凭证在后端）
- ✅ 灵活（后端可以处理业务逻辑）
- ✅ 适合复杂应用

**方式2（不推荐）**：前端直接使用Supabase客户端
- ⚠️ 需要暴露Supabase密钥
- ⚠️ 业务逻辑在前端
- ⚠️ 安全性较差

### Q3: 如何确认后端API连接到Supabase？

**A**: 
1. 检查后端部署日志
2. 测试API端点是否返回数据
3. 检查数据库连接状态
4. 查看Vercel日志中的数据库相关错误

---

## ✅ 验证清单

完成检查后，请确认：

- [ ] ✅ 后端API项目已部署（Vercel Dashboard中可见）
- [ ] ✅ 后端部署状态是 "Ready"（不是 "Error"）
- [ ] ✅ 后端环境变量已配置（`DATABASE_URL`）
- [ ] ✅ 数据库连接测试通过（`npm run test:pg`）
- [ ] ✅ API端点可以访问（`/api/health` 返回正常）
- [ ] ✅ 前端环境变量已配置（`VITE_API_BASE`）
- [ ] ✅ 前端代码已修复（无硬编码 `localhost:3001`）
- [ ] ✅ 前端请求指向正确的后端地址（`api.filmtrip.imhw.top`）

---

## 📚 相关文档

- [修复硬编码问题](./fix-hardcoded-api-urls.md)（待创建）
- [前端Vercel配置检查](./frontend-vercel-config-check.md)
- [Vercel Build Overrides修复](./fix-vercel-build-overrides.md)
- [Supabase密码重置指南](../security/password-reset-guide.md)

---

**💡 提示**：当前架构是正确的（前端→后端→Supabase）。问题可能在于：
1. 后端API未正确部署
2. 后端API数据库连接配置错误
3. 前端请求地址配置错误

---

**最后更新**：2025-11-14  
**状态**：前端硬编码已修复，待检查后端API部署和数据库连接

