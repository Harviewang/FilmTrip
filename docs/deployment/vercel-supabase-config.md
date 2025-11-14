# Vercel 配置 Supabase PostgreSQL 数据库指南

本指南详细说明如何在 Vercel 项目中配置 Supabase PostgreSQL 数据库环境变量。

---

## 📋 前置条件

- ✅ 已创建 Supabase 项目
- ✅ 已获取 Supabase 数据库连接字符串
- ✅ 已在 Vercel 创建了前端和后端项目
- ✅ 已登录 Vercel Dashboard

---

## 🔑 Supabase 连接信息

> ⚠️ **安全提示**：本文档不包含真实的数据库密码。密码应存储在Vercel环境变量中，不要提交到Git仓库。

### 如何获取 Supabase 连接信息

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 点击左侧菜单 **Settings** → **Database**
4. 在 **Connection string** 部分查看连接信息
5. 选择 **URI** 标签获取直接连接字符串

### 连接字符串格式

**直接连接**（推荐用于Vercel Serverless Functions）：
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

**连接池**（推荐用于高并发场景）：
```
postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**参数说明**：
- `[PASSWORD]`：数据库密码（存储在Vercel环境变量中）
- `[PROJECT-ID]`：Supabase项目ID（可在项目设置中查看）
- `[REGION]`：数据库区域（如 `ap-southeast-1`）

**⚠️ 注意**：
- 密码中的 `@` 需要URL编码为 `%40`
- 如果使用Connection Pooling，连接字符串格式会不同
- 建议使用直接连接（URI格式）用于Vercel Serverless Functions

---

## 🚀 配置步骤

### 步骤1：进入 Vercel 项目设置

#### 1.1 打开 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的后端项目（例如：`backend` 或 `filmtrip-backend`）
3. 点击项目名称进入项目详情页

#### 1.2 进入环境变量设置

1. 在项目详情页，点击顶部导航栏的 **Settings**
2. 在左侧菜单中找到 **Environment Variables**
3. 点击进入环境变量配置页面

---

### 步骤2：添加数据库环境变量

#### 2.1 添加 DATABASE_URL

在环境变量配置页面：

1. 在 **Key** 输入框中输入：`DATABASE_URL`
2. 在 **Value** 输入框中输入您的Supabase连接字符串：
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```
   **⚠️ 注意**：
   - 将 `[PASSWORD]` 替换为您的数据库密码（密码中的 `@` 需要URL编码为 `%40`）
   - 将 `[PROJECT-ID]` 替换为您的Supabase项目ID
   - 连接字符串应存储在Vercel环境变量中，不要提交到Git仓库
3. **Environment** 选择：
   - ✅ Production（生产环境）
   - ✅ Preview（预览环境）
   - ✅ Development（开发环境，可选）
4. 点击 **Save** 保存

**📝 说明**：
- **Production**：用于生产环境部署
- **Preview**：用于PR预览和测试部署
- **Development**：用于本地开发（如果需要）

---

#### 2.2 添加其他必要的环境变量

除了 `DATABASE_URL`，后端还需要其他环境变量：

##### 应用配置
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Production, Preview

- **Key**: `PORT`
- **Value**: `3001`（Vercel会自动设置，但建议保留）
- **Environment**: Production, Preview

- **Key**: `JWT_SECRET`
- **Value**: `[您的JWT密钥，请使用强密码]`
- **Environment**: Production, Preview

##### 又拍云配置
- **Key**: `UPYUN_BUCKET`
- **Value**: `filmtrip-dev`
- **Environment**: Production, Preview

- **Key**: `UPYUN_OPERATOR`
- **Value**: `[您的又拍云操作员名称]`
- **Environment**: Production, Preview

- **Key**: `UPYUN_PASSWORD`
- **Value**: `[您的又拍云操作员密码]`
- **Environment**: Production, Preview

- **Key**: `UPYUN_FORM_API_SECRET`
- **Value**: `[您的又拍云表单API密钥]`
- **Environment**: Production, Preview

- **Key**: `UPYUN_CDN_DOMAIN`
- **Value**: `http://filmtrip-dev.test.upcdn.net`（测试环境）或 `https://img.filmtrip.cn`（生产环境）
- **Environment**: Production, Preview

- **Key**: `UPYUN_NOTIFY_URL`
- **Value**: `https://api.filmtrip.imhw.top/api/storage/callback`（测试环境）或 `https://api.filmtrip.cn/api/storage/callback`（生产环境）
- **Environment**: Production, Preview

- **Key**: `UPYUN_IMAGE_PROCESSING_ENABLED`
- **Value**: `true`
- **Environment**: Production, Preview

- **Key**: `UPYUN_DIRECT_UPLOAD_ENABLED`
- **Value**: `true`
- **Environment**: Production, Preview

##### CORS配置（可选）
- **Key**: `CORS_ALLOWED_ORIGINS`
- **Value**: `https://filmtrip.imhw.top,https://filmtrip.cn`（多个域名用逗号分隔）
- **Environment**: Production, Preview

---

### 步骤3：验证环境变量

#### 3.1 检查已添加的变量

在环境变量列表页面，您应该看到：
- ✅ `DATABASE_URL` - 已添加到 Production 和 Preview
- ✅ `NODE_ENV` - 已添加到 Production 和 Preview
- ✅ 其他必要的环境变量

#### 3.2 重新部署项目

**重要**：添加或修改环境变量后，需要重新部署项目才能生效。

1. 在项目详情页，点击 **Deployments** 标签
2. 找到最新的部署记录
3. 点击 **Redeploy**（或点击三个点菜单，选择 **Redeploy**）
4. 选择 **Use existing Build Cache**（使用现有构建缓存）
5. 点击 **Redeploy** 确认

**或者**：
- 推送新的代码到 GitHub（如果有配置自动部署）
- Vercel 会自动触发新的部署并使用最新的环境变量

---

### 步骤4：测试数据库连接

#### 4.1 查看部署日志

1. 在 **Deployments** 页面，点击最新的部署记录
2. 点击 **Build Logs** 或 **Function Logs**
3. 查找数据库连接相关的日志：
   ```
   📊 使用PostgreSQL数据库
   ✅ PostgreSQL连接成功
   ```

#### 4.2 测试 API 端点

访问后端健康检查端点：
```
https://api.filmtrip.imhw.top/api/health
```

如果返回正常，说明数据库连接成功。

---

## 🔧 前端项目配置（可选）

如果您的前端也需要直接访问数据库（不推荐），可以添加相同的环境变量。

**通常前端不需要直接配置数据库连接**，前端通过后端 API 访问数据。

---

## 📋 完整环境变量清单

### 后端项目（Vercel）环境变量

```env
# 数据库配置（Supabase PostgreSQL）
# ⚠️ 安全提示：请将 [PASSWORD] 和 [PROJECT-ID] 替换为实际值
# 密码应存储在Vercel环境变量中，不要提交到Git仓库
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# 应用配置
NODE_ENV=production
PORT=3001
JWT_SECRET=[您的JWT密钥]

# 又拍云配置
UPYUN_BUCKET=filmtrip-dev
UPYUN_OPERATOR=[您的又拍云操作员]
UPYUN_PASSWORD=[您的又拍云密码]
UPYUN_FORM_API_SECRET=[您的表单API密钥]
UPYUN_CDN_DOMAIN=http://filmtrip-dev.test.upcdn.net
UPYUN_NOTIFY_URL=https://api.filmtrip.imhw.top/api/storage/callback
UPYUN_IMAGE_PROCESSING_ENABLED=true
UPYUN_DIRECT_UPLOAD_ENABLED=true
UPYUN_STYLE_THUMB=thumb
UPYUN_STYLE_SIZE1024=preview
UPYUN_STYLE_SIZE2048=large

# CORS配置
CORS_ALLOWED_ORIGINS=https://filmtrip.imhw.top,https://filmtrip.cn
```

### 前端项目（Vercel）环境变量

```env
# API配置
VITE_API_BASE=https://api.filmtrip.imhw.top/api
VITE_BASE_URL=https://api.filmtrip.imhw.top
VITE_SHORT_LINK_PREFIX=https://filmtrip.imhw.top/s
VITE_UPYUN_DIRECT_UPLOAD=true
```

**⚠️ 注意**：前端环境变量以 `VITE_` 开头，这些变量会在构建时注入到前端代码中。

---

## 🎯 环境隔离建议

### 测试环境 vs 生产环境

**推荐做法**：

1. **测试环境**（`filmtrip.imhw.top`）：
   - 使用 **Preview** 环境变量
   - 可以使用与本地开发相同的 Supabase 数据库
   - 或创建单独的测试数据库

2. **生产环境**（`filmtrip.cn`）：
   - 使用 **Production** 环境变量
   - **必须**使用不同的 Supabase 数据库（或 ECS PostgreSQL）
   - 必须使用不同的 JWT_SECRET

---

## ⚠️ 常见问题

### Q1: 环境变量添加后不生效？

**A**: 
1. ✅ 确认已点击 **Save** 保存
2. ✅ 确认选择了正确的 **Environment**（Production/Preview）
3. ✅ **重新部署项目**（环境变量不会自动应用到已有部署）
4. ✅ 检查部署日志确认环境变量已加载

### Q2: 数据库连接失败？

**A**: 
1. ✅ 检查连接字符串格式是否正确（特别是 `%40` 编码）
2. ✅ 检查 Supabase 项目的数据库是否已启动
3. ✅ 检查 Supabase 防火墙设置（确保允许来自 Vercel 的连接）
4. ✅ 查看 Vercel 部署日志中的错误信息

### Q3: 如何在 Supabase 中查看连接信息？

**A**: 
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目（FilmTrip）
3. 点击左侧菜单 **Settings** → **Database**
4. 在 **Connection string** 部分查看连接信息
5. 选择 **URI** 标签获取直接连接字符串

### Q4: 需要为每个环境创建不同的数据库吗？

**A**: 
- **测试环境**：可以使用与本地开发相同的数据库（简单）
- **生产环境**：**强烈建议**使用不同的数据库（安全）
- 可以在同一个 Supabase 项目中创建多个数据库，或创建不同的 Supabase 项目

---

## 🔐 安全建议

1. **不要提交环境变量到 Git**：
   - ✅ 环境变量存储在 Vercel 项目中
   - ❌ 不要将 `.env` 文件提交到 Git
   - ✅ 使用 `.env.example` 作为模板

2. **使用强密码**：
   - ✅ JWT_SECRET 必须是强随机字符串
   - ✅ 又拍云密码必须保密

3. **定期更换密钥**：
   - ✅ 定期更换 JWT_SECRET
   - ✅ 定期检查又拍云密钥安全

4. **限制数据库访问**：
   - ✅ 在 Supabase 中配置 IP 白名单（如果支持）
   - ✅ 使用连接池限制并发连接数

---

## 📝 验证清单

配置完成后，请确认：

- [ ] ✅ `DATABASE_URL` 已添加到 Vercel 后端项目
- [ ] ✅ 选择了正确的环境（Production/Preview）
- [ ] ✅ 已重新部署后端项目
- [ ] ✅ 部署日志显示数据库连接成功
- [ ] ✅ API 端点测试通过
- [ ] ✅ 其他必要的环境变量已配置
- [ ] ✅ 前端环境变量已配置（如果需要）

---

## 🚀 下一步

1. ✅ 配置完成 Vercel 环境变量
2. ✅ 重新部署后端项目
3. ✅ 测试数据库连接
4. ✅ 验证 API 功能
5. ✅ 测试又拍云上传功能

配置完成后，您的 Vercel 后端项目就可以使用 Supabase PostgreSQL 数据库了！

---

**💡 提示**：如果需要更新环境变量，只需在 Vercel Dashboard 中修改并重新部署即可。


