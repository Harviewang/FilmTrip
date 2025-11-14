# Vercel环境变量配置清单

**创建日期**：2025-11-14  
**用途**：快速配置Vercel环境变量，准备测试

---

## 🔴 后端API环境变量（必需）

### 在Vercel Dashboard配置

**路径**：后端项目 → Settings → Environment Variables

### 1. 数据库配置（必需）🔴

```
名称: DATABASE_URL
值: postgresql://postgres:Guluhub%402026@db.xpcriheeehusrqyycdfx.supabase.co:5432/postgres
环境: Production（必需）、Preview（可选）、Development（可选）
```

⚠️ **注意**：
- 密码中的 `@` 需要URL编码为 `%40`
- 完整密码：`Guluhub@2026`
- URL编码后：`Guluhub%402026`
- 项目ID：`xpcriheeehusrqyycdfx`

---

### 2. JWT密钥（必需）🔴

```
名称: JWT_SECRET
值: [生成一个至少32个字符的随机字符串]
环境: Production（必需）、Preview（可选）、Development（可选）
```

💡 **生成方法**：
```bash
# 使用Node.js生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**示例值**（仅示例，请使用您自己的）：
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

---

### 3. CORS配置（必需）🔴

```
名称: FRONTEND_URL
值: https://filmtrip.imhw.top
环境: Production（必需）、Preview（可选）、Development（可选）
```

---

### 4. 应用配置（可选）

```
名称: NODE_ENV
值: production
环境: Production（可选）

名称: JWT_EXPIRES_IN
值: 7d
环境: Production（可选）、Preview（可选）、Development（可选）
```

---

## 🔴 前端环境变量（必需）

### 在Vercel Dashboard配置

**路径**：前端项目 → Settings → Environment Variables

### 1. API基础地址（必需）🔴

```
名称: VITE_API_BASE
值: https://api.filmtrip.imhw.top/api
环境: Production（必需）、Preview（可选）、Development（可选）
```

---

### 2. API基础URL（必需）🔴

```
名称: VITE_BASE_URL
值: https://api.filmtrip.imhw.top
环境: Production（必需）、Preview（可选）、Development（可选）
```

---

### 3. 短链接前缀（可选）

```
名称: VITE_SHORT_LINK_PREFIX
值: https://filmtrip.imhw.top/s
环境: Production（可选）、Preview（可选）、Development（可选）
```

---

### 4. 又拍云直接上传（可选）

```
名称: VITE_UPYUN_DIRECT_UPLOAD
值: true
环境: Production（可选）、Preview（可选）、Development（可选）
```

---

## 📋 快速配置步骤

### 后端API配置（5分钟）

1. **访问Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到后端项目

2. **进入环境变量设置**
   - Settings → Environment Variables

3. **添加环境变量**
   - 点击 "Add New"
   - 按顺序添加：
     1. `DATABASE_URL` = `postgresql://postgres:Guluhub%402026@db.xpcriheeehusrqyycdfx.supabase.co:5432/postgres`
     2. `JWT_SECRET` = `[生成随机字符串]`
     3. `FRONTEND_URL` = `https://filmtrip.imhw.top`
     4. `NODE_ENV` = `production`（可选）

4. **选择环境**
   - ✅ 勾选 "Production"（必需）
   - ✅ 可选：勾选 "Preview" 和 "Development"

5. **保存并重新部署**
   - 点击 "Save"
   - 进入 Deployments 页面
   - 点击 "Redeploy"

---

### 前端配置（5分钟）

1. **访问Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到前端项目

2. **进入环境变量设置**
   - Settings → Environment Variables

3. **添加环境变量**
   - 点击 "Add New"
   - 按顺序添加：
     1. `VITE_API_BASE` = `https://api.filmtrip.imhw.top/api`
     2. `VITE_BASE_URL` = `https://api.filmtrip.imhw.top`
     3. `VITE_SHORT_LINK_PREFIX` = `https://filmtrip.imhw.top/s`（可选）
     4. `VITE_UPYUN_DIRECT_UPLOAD` = `true`（可选）

4. **选择环境**
   - ✅ 勾选 "Production"（必需）
   - ✅ 可选：勾选 "Preview" 和 "Development"

5. **保存并重新部署**
   - 点击 "Save"
   - 进入 Deployments 页面
   - 点击 "Redeploy"

---

## ✅ 验证配置

### 验证后端API

1. **测试数据库连接**（本地）
   ```bash
   cd backend
   DATABASE_URL="postgresql://postgres:Guluhub%402026@db.xpcriheeehusrqyycdfx.supabase.co:5432/postgres" npm run test:pg
   ```
   ✅ 应该显示：`✅ PostgreSQL连接成功！`

2. **测试API端点**（线上）
   ```bash
   curl https://api.filmtrip.imhw.top/api/photos?limit=1
   ```
   ✅ 应该返回JSON数据或401/403错误（不是404）

---

### 验证前端

1. **访问前端网站**
   - https://filmtrip.imhw.top
   - 打开浏览器开发者工具（F12）→ Network标签

2. **检查API请求**
   - 访问网站首页
   - 查看Network标签中的API请求
   - ✅ 应该看到请求发送到：`https://api.filmtrip.imhw.top/api/photos`
   - ✅ 如果返回200或401/403：后端API正常工作
   - ❌ 如果返回404：后端API未正确部署或路由配置错误

---

## 🔐 安全提醒

⚠️ **重要**：
- 所有环境变量都应该在Vercel Dashboard中配置
- **不要**将真实的环境变量值提交到Git仓库
- `DATABASE_URL` 包含数据库密码，必须保密
- `JWT_SECRET` 必须使用强随机字符串

---

## 📚 相关文档

- [Vercel测试检查清单](./vercel-test-checklist.md)
- [后端API连接检查](./backend-api-connection-check.md)
- [环境策略](./environment-strategy.md)

---

**💡 提示**：配置完环境变量后，记得重新部署前后端项目，使环境变量生效。

---

**最后更新**：2025-11-14  
**状态**：配置清单

