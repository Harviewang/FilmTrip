# FilmTrip Vercel 部署指南

## 前置准备

### 1. 账号准备
- Vercel 账号：访问 [vercel.com](https://vercel.com) 注册
- GitHub 账号：确保项目已推送到 GitHub
- 数据库：准备 PostgreSQL 数据库（推荐 Supabase 或 Railway）

### 2. 数据库准备
如果还没有数据库，推荐使用 Supabase：
1. 访问 [supabase.com](https://supabase.com) 注册
2. 创建新项目
3. 在 SQL Editor 中执行 `backend/database/` 目录下的 SQL 文件
4. 记录数据库连接信息

## 部署步骤

### 第一步：部署前端

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择 "Import Git Repository"
   - 找到并选择 `FilmTrip` 仓库

3. **配置前端项目**
   - Project Name: `filmtrip-frontend`
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **设置环境变量**
   在 Environment Variables 部分添加：
   ```
   VITE_API_BASE_URL=https://your-backend-domain.vercel.app
   ```
   （先留空，部署后端后再填入）

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成
   - 记录前端域名（如：`filmtrip-frontend.vercel.app`）

### 第二步：部署后端

1. **创建新项目**
   - 在 Vercel Dashboard 点击 "New Project"
   - 再次选择 `FilmTrip` 仓库

2. **配置后端项目**
   - Project Name: `filmtrip-backend`
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Output Directory: 留空
   - Install Command: `npm install`

3. **设置环境变量**
   在 Environment Variables 部分添加以下变量：
   ```
   # 数据库配置
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   
   # JWT 配置
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # CORS 配置
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   
   # 文件上传配置
   UPLOAD_PATH=/tmp/uploads
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成
   - 记录后端域名（如：`filmtrip-backend.vercel.app`）

### 第三步：更新前端环境变量

1. **回到前端项目**
   - 在 Vercel Dashboard 找到前端项目
   - 进入 Settings → Environment Variables

2. **更新 API 地址**
   ```
   VITE_API_BASE_URL=https://filmtrip-backend.vercel.app
   ```

3. **重新部署**
   - 进入 Deployments 页面
   - 点击最新部署右侧的三个点
   - 选择 "Redeploy"

## 域名配置

### 方案一：使用子域名（推荐）

假设你的域名是 `example.com`：

1. **配置前端域名**
   - 在 Vercel 前端项目的 Settings → Domains
   - 添加域名：`www.example.com` 或 `example.com`
   - 按照提示配置 DNS

2. **配置后端域名**
   - 在 Vercel 后端项目的 Settings → Domains
   - 添加域名：`api.example.com`
   - 按照提示配置 DNS

3. **DNS 配置**
   在你的域名服务商（如阿里云、腾讯云）添加以下记录：
   ```
   类型: CNAME
   主机记录: www
   记录值: cname.vercel-dns.com
   
   类型: CNAME
   主机记录: api
   记录值: cname.vercel-dns.com
   
   类型: A
   主机记录: @
   记录值: 76.76.19.61
   ```

4. **更新环境变量**
   - 前端项目环境变量：
     ```
     VITE_API_BASE_URL=https://api.example.com
     ```
   - 后端项目环境变量：
     ```
     FRONTEND_URL=https://www.example.com
     ```

### 方案二：使用路径分离

如果只想用一个域名：

1. **配置主域名到前端**
   - 前端项目添加域名：`example.com`
   - 配置 DNS A 记录指向 Vercel

2. **配置 API 路径**
   - 在前端项目的 `vercel.json` 中添加重写规则：
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://filmtrip-backend.vercel.app/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

3. **更新前端环境变量**
   ```
   VITE_API_BASE_URL=https://example.com
   ```

## 常见问题

### 1. 部署失败
- 检查 `package.json` 中的脚本命令
- 确保所有依赖都在 `dependencies` 中
- 查看 Vercel 部署日志

### 2. 数据库连接失败
- 检查数据库连接字符串
- 确保数据库允许外部连接
- 验证环境变量设置

### 3. CORS 错误
- 检查后端 `FRONTEND_URL` 环境变量
- 确保前端域名正确配置

### 4. 域名解析问题
- DNS 生效需要时间（通常 10-30 分钟）
- 使用 `nslookup` 或在线工具检查 DNS 解析
- 确保 DNS 记录类型和值正确

## 监控和维护

1. **监控部署状态**
   - 在 Vercel Dashboard 查看部署状态
   - 设置部署通知

2. **查看日志**
   - Functions 页面查看 API 日志
   - Analytics 页面查看访问统计

3. **自动部署**
   - 推送到 GitHub 会自动触发部署
   - 可以在 Settings 中配置部署分支

## 安全建议

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 定期更换 JWT 密钥

2. **数据库安全**
   - 使用强密码
   - 限制数据库访问 IP
   - 定期备份数据

3. **域名安全**
   - 启用 HTTPS（Vercel 自动提供）
   - 考虑使用 CDN 加速

---

部署完成后，你的 FilmTrip 应用就可以通过自定义域名访问了！

如有问题，请检查 Vercel 部署日志或联系技术支持。