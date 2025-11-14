# FilmTrip 环境配置方案

## 📊 环境概览

当前 FilmTrip 项目有 **3个主要环境**：

| 环境 | 用途 | 前端地址 | 后端地址 | 数据库 | 又拍云Bucket | 部署平台 |
|------|------|---------|---------|--------|-------------|---------|
| **本地开发** | 开发调试 | `localhost:3000/3002` | `localhost:3001` | Supabase PostgreSQL | `filmtrip-dev` | 本地 |
| **测试环境** | 功能验证 | `filmtrip.imhw.top` | `api.filmtrip.imhw.top` | Supabase PostgreSQL | `filmtrip-dev` | Vercel |
| **生产环境** | 正式服务 | `filmtrip.cn` | `api.filmtrip.cn` | ECS PostgreSQL 或 Supabase | `filmtrip-prod` | ECS |

---

## 🏗️ 环境详细配置

### 1️⃣ 本地开发环境（Local Development）

**用途**：日常开发、调试、本地测试

**配置**：

#### 前端
- **端口**：3000（开发服务器）或 3002（管理后台）
- **地址**：`http://localhost:3000` 或 `http://localhost:3002`
- **API地址**：`http://localhost:3001`
- **环境变量**：`.env.local` 或 `vite.config.js`

#### 后端
- **端口**：3001
- **地址**：`http://localhost:3001`
- **数据库**：Supabase PostgreSQL
- **连接字符串**：
  ```env
  # ⚠️ 安全提示：请将 [PASSWORD] 和 [PROJECT-ID] 替换为实际值
  # 密码应存储在环境变量中，不要提交到Git仓库
  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
  ```
- **环境变量文件**：`backend/.env`

#### 又拍云
- **Bucket**：`filmtrip-dev`
- **CDN域名**：`http://filmtrip-dev.test.upcdn.net`（HTTP，开发环境可用）
- **回调URL**：`http://localhost:3001/api/storage/callback`（开发环境可能收不到回调）

#### 启动方式
```bash
# 后端
cd backend
npm start

# 前端
cd frontend
npm run dev
```

---

### 2️⃣ 测试环境（Test/Staging Environment）

**用途**：功能验证、集成测试、发布前验证

**配置**：

#### 前端
- **域名**：`https://filmtrip.imhw.top`
- **备选域名**：`https://dbdog.com`（Vercel）
- **API地址**：`https://api.filmtrip.imhw.top`
- **部署平台**：Vercel
- **环境变量**（在Vercel项目设置中）：
  ```env
  VITE_API_BASE=https://api.filmtrip.imhw.top/api
  VITE_BASE_URL=https://api.filmtrip.imhw.top
  VITE_SHORT_LINK_PREFIX=https://filmtrip.imhw.top/s
  VITE_UPYUN_DIRECT_UPLOAD=true
  ```

#### 后端
- **域名**：`https://api.filmtrip.imhw.top`
- **部署平台**：Vercel（Serverless Functions）
- **数据库**：Supabase PostgreSQL（可以使用与本地相同的数据库，或创建单独的测试数据库）
- **环境变量**（在Vercel项目设置中）：
  ```env
  # 数据库配置
  DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
  
  # 又拍云配置
  UPYUN_BUCKET=filmtrip-dev
  UPYUN_CDN_DOMAIN=http://filmtrip-dev.test.upcdn.net
  UPYUN_NOTIFY_URL=https://api.filmtrip.imhw.top/api/storage/callback
  UPYUN_IMAGE_PROCESSING_ENABLED=true
  UPYUN_DIRECT_UPLOAD_ENABLED=true
  
  # CORS配置
  NODE_ENV=production
  JWT_SECRET=[test_jwt_secret]
  ```

#### 又拍云
- **Bucket**：`filmtrip-dev`（与本地开发共用）
- **CDN域名**：`http://filmtrip-dev.test.upcdn.net`（HTTP，测试环境可用）
- **回调URL**：`https://api.filmtrip.imhw.top/api/storage/callback`

#### 部署方式
- **自动部署**：GitHub推送触发Vercel自动部署
- **手动部署**：使用Vercel CLI
  ```bash
  cd frontend && vercel --prod
  cd backend && vercel --prod
  ```

---

### 3️⃣ 生产环境（Production Environment）

**用途**：正式服务、真实用户数据

**配置**：

#### 前端
- **域名**：`https://filmtrip.cn`
- **备选域名**：`https://www.filmtrip.cn`
- **API地址**：`https://api.filmtrip.cn`
- **部署平台**：ECS 或 Vercel（待定）

#### 后端
- **域名**：`https://api.filmtrip.cn`
- **部署平台**：ECS（当前）
- **数据库**：**待决定**
  - **选项A**：ECS PostgreSQL（现有）
  - **选项B**：Supabase PostgreSQL（推荐，便于管理）
- **环境变量**（在ECS服务器上）：
  ```env
  # 数据库配置（选项A：ECS PostgreSQL）
  DB_HOST=[ecs_postgres_host]
  DB_PORT=5432
  DB_NAME=filmtrip_prod
  DB_USER=[ecs_postgres_user]
  DB_PASSWORD=[ecs_postgres_password]
  
  # 或选项B：Supabase PostgreSQL
  DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
  
  # 又拍云配置
  UPYUN_BUCKET=filmtrip-prod  # ⚠️ 需要创建生产bucket
  UPYUN_CDN_DOMAIN=https://img.filmtrip.cn  # ⚠️ 需要配置DNS
  UPYUN_NOTIFY_URL=https://api.filmtrip.cn/api/storage/callback
  UPYUN_IMAGE_PROCESSING_ENABLED=true
  UPYUN_DIRECT_UPLOAD_ENABLED=true
  
  # CORS配置
  NODE_ENV=production
  JWT_SECRET=[production_jwt_secret]  # ⚠️ 必须是强密码
  ```

#### 又拍云
- **Bucket**：`filmtrip-prod`（**需要创建**）
- **CDN域名**：`https://img.filmtrip.cn`（**需要配置DNS和SSL**）
- **回调URL**：`https://api.filmtrip.cn/api/storage/callback`
- **协议**：**必须使用HTTPS**

#### 部署方式
- **ECS部署**：使用PM2或Docker
- **Vercel部署**：如果选择Vercel（需要配置自定义域名）

---

## 🎯 环境选择建议

### 数据库选择

#### 本地开发环境
- ✅ **使用**：Supabase PostgreSQL（当前已配置）
- **原因**：免费、易用、便于团队协作

#### 测试环境
- ✅ **使用**：Supabase PostgreSQL
  - **选项1**：与本地开发共用（简单，但可能互相影响）
  - **选项2**：创建单独的测试数据库（推荐，完全隔离）
- **原因**：免费额度充足，便于测试

#### 生产环境
- ⚠️ **待决定**：
  - **选项A**：ECS PostgreSQL（现有）
    - ✅ 已在使用
    - ✅ 完全控制
    - ❌ 需要维护
    - ❌ 需要备份策略
  - **选项B**：Supabase PostgreSQL（推荐）
    - ✅ 自动备份
    - ✅ 易于管理
    - ✅ 性能稳定
    - ⚠️ 需要评估速度（建议测试）

**建议**：
1. 先在测试环境验证Supabase性能
2. 如果速度满意，生产环境也使用Supabase
3. 如果速度不满意，继续使用ECS PostgreSQL

---

## 📋 环境变量配置清单

### 本地开发环境（`backend/.env`）

```env
# 应用配置
PORT=3001
NODE_ENV=development
JWT_SECRET=[dev_jwt_secret]

# 数据库配置（Supabase）
# ⚠️ 安全提示：请将 [PASSWORD] 和 [PROJECT-ID] 替换为实际值
# 密码应存储在环境变量中，不要提交到Git仓库
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# 又拍云配置
UPYUN_BUCKET=filmtrip-dev
UPYUN_CDN_DOMAIN=http://filmtrip-dev.test.upcdn.net
UPYUN_NOTIFY_URL=http://localhost:3001/api/storage/callback
UPYUN_IMAGE_PROCESSING_ENABLED=true
UPYUN_DIRECT_UPLOAD_ENABLED=true
```

### 测试环境（Vercel环境变量）

**前端项目**：
```env
VITE_API_BASE=https://api.filmtrip.imhw.top/api
VITE_BASE_URL=https://api.filmtrip.imhw.top
VITE_SHORT_LINK_PREFIX=https://filmtrip.imhw.top/s
VITE_UPYUN_DIRECT_UPLOAD=true
```

**后端项目**：
```env
DATABASE_URL=[supabase_connection_string]
UPYUN_BUCKET=filmtrip-dev
UPYUN_CDN_DOMAIN=http://filmtrip-dev.test.upcdn.net
UPYUN_NOTIFY_URL=https://api.filmtrip.imhw.top/api/storage/callback
UPYUN_IMAGE_PROCESSING_ENABLED=true
UPYUN_DIRECT_UPLOAD_ENABLED=true
NODE_ENV=production
JWT_SECRET=[test_jwt_secret]
```

### 生产环境（ECS或Vercel环境变量）

**前端项目**：
```env
VITE_API_BASE=https://api.filmtrip.cn/api
VITE_BASE_URL=https://api.filmtrip.cn
VITE_SHORT_LINK_PREFIX=https://filmtrip.cn/s
VITE_UPYUN_DIRECT_UPLOAD=true
```

**后端项目**：
```env
# 数据库（选项A：ECS PostgreSQL）
DB_HOST=[ecs_postgres_host]
DB_PORT=5432
DB_NAME=filmtrip_prod
DB_USER=[ecs_postgres_user]
DB_PASSWORD=[ecs_postgres_password]

# 或选项B：Supabase PostgreSQL
# DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# 又拍云配置
UPYUN_BUCKET=filmtrip-prod
UPYUN_CDN_DOMAIN=https://img.filmtrip.cn
UPYUN_NOTIFY_URL=https://api.filmtrip.cn/api/storage/callback
UPYUN_IMAGE_PROCESSING_ENABLED=true
UPYUN_DIRECT_UPLOAD_ENABLED=true

# 应用配置
NODE_ENV=production
JWT_SECRET=[production_jwt_secret]  # ⚠️ 必须是强密码
```

---

## 🔄 环境迁移流程

### 从开发到测试
1. ✅ 代码推送GitHub
2. ✅ Vercel自动部署（或手动部署）
3. ✅ 验证功能
4. ✅ 测试1-2天

### 从测试到生产
1. ✅ 备份生产数据库
2. ✅ 在测试环境完整测试
3. ✅ 确认无误后部署生产
4. ✅ 监控生产环境
5. ✅ 回滚准备（如有问题）

---

## ⚠️ 重要提醒

1. **数据库隔离**：
   - 本地开发可以使用共享数据库
   - **测试和生产必须使用不同数据库**
   - 避免测试数据影响生产

2. **又拍云隔离**：
   - 本地和测试可以共用 `filmtrip-dev`
   - **生产必须使用 `filmtrip-prod`**
   - 避免测试数据出现在生产环境

3. **环境变量安全**：
   - ❌ **不要**将生产环境变量提交到Git
   - ✅ **使用**环境变量管理工具（Vercel、ECS环境变量）
   - ✅ **定期**更换生产环境密钥

4. **域名配置**：
   - 测试环境：`filmtrip.imhw.top`（已配置）
   - 生产环境：`filmtrip.cn`（已配置）
   - 确保DNS和SSL证书正确配置

---

## 📝 下一步行动

### 立即可做
- [x] ✅ 本地开发环境已切换到PostgreSQL（Supabase）
- [x] ✅ 测试环境数据库已配置（Supabase）
- [ ] ⚠️ **测试环境Vercel项目需要配置PostgreSQL环境变量**
- [ ] ⚠️ **生产环境数据库选择**（ECS PostgreSQL 或 Supabase）

### 待决定事项
1. **生产环境数据库**：
   - 选项A：ECS PostgreSQL（现有）
   - 选项B：Supabase PostgreSQL（推荐）

2. **测试环境数据库**：
   - 选项1：与本地开发共用Supabase（简单）
   - 选项2：创建单独的测试Supabase项目（推荐）

3. **生产环境又拍云配置**：
   - 创建 `filmtrip-prod` bucket
   - 配置 `img.filmtrip.cn` DNS和SSL
   - 配置生产环境回调URL

---

**💡 建议**：先在测试环境完整验证PostgreSQL和Supabase的性能，再决定生产环境是否使用Supabase。


