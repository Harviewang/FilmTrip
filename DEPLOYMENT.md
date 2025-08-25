# FilmTrip Vercel 部署指南

## 准备工作

### 1. 数据库准备
推荐使用以下云数据库服务之一：
- **Neon** (推荐): https://neon.tech
- **Supabase**: https://supabase.com
- **PlanetScale**: https://planetscale.com

### 2. 账号准备
- Vercel 账号: https://vercel.com
- GitHub 账号 (用于代码托管)

## 部署步骤

### 第一步：推送代码到 GitHub

```bash
# 初始化 Git 仓库 (如果还没有)
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库并推送
git remote add origin https://github.com/your-username/filmtrip.git
git push -u origin main
```

### 第二步：部署后端 API

1. 登录 Vercel Dashboard
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 设置项目配置：
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: 留空
   - **Install Command**: `npm install`

5. 配置环境变量：
   ```
   NODE_ENV=production
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=filmtrip
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   JWT_SECRET=your-super-secret-jwt-key
   UPLOAD_PATH=/tmp/uploads
   ```

6. 点击 "Deploy"
7. 记录后端域名，例如：`https://filmtrip-backend.vercel.app`

### 第三步：部署前端

1. 在 Vercel 中创建新项目
2. 导入同一个 GitHub 仓库
3. 设置项目配置：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. 配置环境变量：
   ```
   VITE_API_BASE_URL=https://filmtrip-backend.vercel.app
   ```

5. 点击 "Deploy"
6. 记录前端域名，例如：`https://filmtrip.vercel.app`

### 第四步：配置 CORS

更新后端环境变量，添加前端域名：
```
CORS_ORIGIN=https://filmtrip.vercel.app
```

## 自定义域名配置

### 在 Vercel 中配置域名

1. 进入前端项目的 Vercel Dashboard
2. 点击 "Settings" → "Domains"
3. 添加你的自定义域名，例如：`filmtrip.com`
4. Vercel 会提供 DNS 配置信息

### DNS 解析配置

#### 方法一：使用 A 记录 (推荐)
在你的域名注册商处添加以下 DNS 记录：

```
类型: A
名称: @
值: 76.76.19.61

类型: A
名称: www
值: 76.76.19.61
```

#### 方法二：使用 CNAME 记录
```
类型: CNAME
名称: @
值: cname.vercel-dns.com

类型: CNAME
名称: www
值: cname.vercel-dns.com
```

### 后端 API 域名配置

如果需要自定义 API 域名（如 `api.filmtrip.com`）：

1. 在后端项目的 Vercel Dashboard 中添加域名
2. 配置 DNS：
   ```
   类型: CNAME
   名称: api
   值: cname.vercel-dns.com
   ```

3. 更新前端环境变量：
   ```
   VITE_API_BASE_URL=https://api.filmtrip.com
   ```

## 常见问题

### 1. 数据库连接失败
- 检查数据库服务是否正常运行
- 确认环境变量配置正确
- 检查数据库防火墙设置，允许 Vercel IP 访问

### 2. 前端无法访问 API
- 检查 CORS 配置
- 确认 API 域名配置正确
- 检查网络请求是否使用 HTTPS

### 3. 文件上传问题
- Vercel 无服务器函数有 50MB 限制
- 考虑使用云存储服务（如 AWS S3, Cloudinary）

### 4. DNS 解析时间
- DNS 更改可能需要 24-48 小时生效
- 可以使用 `nslookup` 或在线工具检查解析状态

## 监控和维护

1. **日志查看**: 在 Vercel Dashboard 的 "Functions" 标签页查看运行日志
2. **性能监控**: 使用 Vercel Analytics 监控网站性能
3. **自动部署**: 推送到 GitHub 主分支会自动触发重新部署

## 安全建议

1. 定期更新依赖包
2. 使用强密码作为 JWT_SECRET
3. 配置适当的 CORS 策略
4. 定期备份数据库
5. 监控异常访问日志

---

部署完成后，你的 FilmTrip 应用就可以通过自定义域名访问了！