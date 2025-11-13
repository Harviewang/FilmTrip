# 测试环境部署指南

## 📋 测试环境概览

### 当前测试环境配置

- **前端域名**: `https://filmtrip.imhw.top` ✅ (已部署到Vercel)
- **后端域名**: `https://api.filmtrip.imhw.top` ✅ (已部署到Vercel)
- **又拍云Bucket**: `filmtrip-dev` (测试bucket)
- **CDN域名**: `http://filmtrip-dev.test.upcdn.net` (开发环境CDN)

---

## 🎯 测试环境的作用

1. **验证新功能**：在发布到生产环境前，先在测试环境验证
2. **测试又拍云集成**：验证上传、回调、CDN等功能
3. **测试部署流程**：熟悉部署步骤，减少生产环境出错
4. **用户测试**：让测试用户提前体验新功能

---

## 🚀 测试环境部署方案

### 方案A：Vercel部署（推荐，当前使用）

**优势**：
- ✅ 免费额度充足
- ✅ 自动HTTPS
- ✅ 自动部署（GitHub推送触发）
- ✅ 无需管理服务器

**步骤**：

#### 1. 配置Vercel项目

**前端项目 (`frontend`)**：
- Root Directory: `frontend` 或 `.`（如果报错）
- Build Command: `npm run build` 或 `cd frontend && npm run build`
- Output Directory: `dist` 或 `frontend/dist`
- Framework: Vite

**后端项目 (`backend`)**：
- Root Directory: `backend`
- Build Command: 留空（Vercel会自动处理）
- Output Directory: 留空
- Framework: Other

#### 2. 配置环境变量

**前端环境变量**（在Vercel项目设置中）：
```bash
VITE_API_BASE=https://api.filmtrip.imhw.top/api
VITE_BASE_URL=https://api.filmtrip.imhw.top
VITE_SHORT_LINK_PREFIX=https://filmtrip.imhw.top/s
VITE_UPYUN_DIRECT_UPLOAD=true
```

**后端环境变量**：
```bash
# 又拍云测试配置
UPYUN_BUCKET=filmtrip-dev
UPYUN_OPERATOR=your_dev_operator
UPYUN_PASSWORD=your_dev_password
UPYUN_FORM_API_SECRET=your_dev_form_secret

# CDN域名（测试环境用HTTP）
UPYUN_CDN_DOMAIN=http://filmtrip-dev.test.upcdn.net
UPYUN_NOTIFY_URL=https://api.filmtrip.imhw.top/api/storage/callback

# 图片处理
UPYUN_IMAGE_PROCESSING_ENABLED=true
UPYUN_DIRECT_UPLOAD_ENABLED=true

# 样式配置
UPYUN_STYLE_THUMB=thumb
UPYUN_STYLE_SIZE1024=preview
UPYUN_STYLE_SIZE2048=large

# CORS配置
CORS_ALLOWED_ORIGINS=https://filmtrip.imhw.top,https://filmtrip.cn

# 其他配置
NODE_ENV=production
JWT_SECRET=your_test_jwt_secret
# ... 数据库配置等
```

#### 3. 部署到Vercel

**方式1：通过Vercel CLI**
```bash
# 前端部署
cd frontend
vercel --prod

# 后端部署
cd backend
vercel --prod
```

**方式2：通过GitHub自动部署**
1. 推送代码到GitHub `main` 分支
2. Vercel自动触发部署
3. 等待部署完成

#### 4. 配置域名

**在Vercel项目设置中添加自定义域名**：
- 前端项目：添加 `filmtrip.imhw.top`
- 后端项目：添加 `api.filmtrip.imhw.top`

**DNS配置**（在阿里云DNS）：
- `filmtrip.imhw.top` → CNAME → `cname.vercel-dns.com`
- `api.filmtrip.imhw.top` → CNAME → `cname.vercel-dns.com`

---

### 方案B：ECS服务器部署（可选）

如果不想使用Vercel，也可以在ECS上部署测试环境。

**优势**：
- ✅ 完全控制服务器
- ✅ 可以测试ECS部署流程
- ✅ 和生产环境一致

**劣势**：
- ⚠️ 需要管理服务器
- ⚠️ 需要配置HTTPS（Let's Encrypt）
- ⚠️ 需要手动部署

**步骤**：

#### 1. 准备服务器
```bash
# SSH连接到ECS服务器
ssh user@your-ecs-ip

# 检查服务器状态
./check-ecs-status.sh  # 或在服务器上运行
```

#### 2. 克隆代码
```bash
cd /var/www  # 或其他目录
git clone git@github.com:Harviewang/FilmTrip.git
cd FilmTrip
```

#### 3. 配置环境变量
```bash
# 复制环境变量模板
cp backend/env.example backend/.env

# 编辑环境变量（使用测试环境配置）
nano backend/.env
```

#### 4. 安装依赖并构建
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
npm run build
```

#### 5. 使用PM2运行
```bash
# 后端
cd backend
pm2 start index.js --name filmtrip-backend-test

# 前端（使用nginx或serve）
cd frontend
serve -s dist -l 3002
# 或使用nginx配置静态文件服务
```

#### 6. 配置Nginx反向代理
```nginx
# /etc/nginx/sites-available/filmtrip-test
server {
    listen 80;
    server_name filmtrip.imhw.top;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api.filmtrip.imhw.top;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 7. 配置SSL（Let's Encrypt）
```bash
sudo certbot --nginx -d filmtrip.imhw.top -d api.filmtrip.imhw.top
```

---

## 🔧 测试环境配置清单

### ✅ 又拍云配置

- [ ] **Bucket**: 使用 `filmtrip-dev`（测试bucket）
- [ ] **操作员**: 测试环境操作员账号
- [ ] **密码**: 测试环境操作员密码
- [ ] **表单API密钥**: 测试环境表单API密钥
- [ ] **CDN域名**: `http://filmtrip-dev.test.upcdn.net`（测试环境可以用HTTP）
- [ ] **回调URL**: `https://api.filmtrip.imhw.top/api/storage/callback`
- [ ] **样式配置**: 在又拍云控制台配置 `thumb`、`preview`、`large` 样式

### ✅ 域名配置

- [ ] **前端域名**: `filmtrip.imhw.top` DNS已配置
- [ ] **后端域名**: `api.filmtrip.imhw.top` DNS已配置
- [ ] **SSL证书**: 已配置（Vercel自动配置，或ECS使用Let's Encrypt）

### ✅ 环境变量配置

#### 前端（Vercel或构建时）
- [ ] `VITE_API_BASE` = `https://api.filmtrip.imhw.top/api`
- [ ] `VITE_BASE_URL` = `https://api.filmtrip.imhw.top`
- [ ] `VITE_SHORT_LINK_PREFIX` = `https://filmtrip.imhw.top/s`
- [ ] `VITE_UPYUN_DIRECT_UPLOAD` = `true`

#### 后端（Vercel或ECS）
- [ ] `UPYUN_BUCKET` = `filmtrip-dev`
- [ ] `UPYUN_OPERATOR` = 测试环境操作员
- [ ] `UPYUN_PASSWORD` = 测试环境密码
- [ ] `UPYUN_FORM_API_SECRET` = 测试环境表单API密钥
- [ ] `UPYUN_CDN_DOMAIN` = `http://filmtrip-dev.test.upcdn.net`
- [ ] `UPYUN_NOTIFY_URL` = `https://api.filmtrip.imhw.top/api/storage/callback`
- [ ] `UPYUN_IMAGE_PROCESSING_ENABLED` = `true`
- [ ] `UPYUN_DIRECT_UPLOAD_ENABLED` = `true`

### ✅ CORS配置

后端 `backend/index.js` 中需要包含测试环境域名：
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://filmtrip.imhw.top',  // 测试环境前端
  'https://filmtrip.cn',         // 生产环境前端（预留）
];
```

---

## 🧪 测试环境验证清单

部署完成后，执行以下测试：

### ✅ 基础功能测试

- [ ] 访问 `https://filmtrip.imhw.top` 正常打开
- [ ] 访问 `https://api.filmtrip.imhw.top/api/health` 返回正常
- [ ] 登录功能正常
- [ ] 照片列表正常加载

### ✅ 又拍云集成测试

- [ ] **上传测试**：
  - [ ] 单张照片上传成功
  - [ ] 批量照片上传成功
  - [ ] 上传后照片显示在列表中

- [ ] **显示测试**：
  - [ ] 照片缩略图正常显示（使用 `!thumb` 样式）
  - [ ] 照片预览图正常显示（使用 `!preview` 样式）
  - [ ] 照片大图正常显示（使用 `!large` 样式）
  - [ ] CDN URL正确生成

- [ ] **回调测试**：
  - [ ] 上传后收到又拍云回调
  - [ ] 回调后数据库记录更新（`origin_path`、`width`、`height`等）
  - [ ] 检查后端日志，无回调错误

- [ ] **水印测试**：
  - [ ] 预览图显示水印（32px）
  - [ ] 大图显示水印（48px）
  - [ ] 缩略图无水印（正常）

### ✅ 性能测试

- [ ] 页面加载速度正常
- [ ] 图片加载速度正常
- [ ] CDN加速生效

---

## 🔄 测试环境更新流程

### 方式1：GitHub自动部署（Vercel）

1. 本地修改代码
2. 提交并推送到GitHub：
   ```bash
   git add .
   git commit -m "feat: 测试环境更新"
   git push origin main
   ```
3. Vercel自动触发部署
4. 等待部署完成（通常1-2分钟）
5. 访问测试环境验证

### 方式2：手动部署（Vercel CLI）

```bash
# 前端
cd frontend
vercel --prod

# 后端
cd backend
vercel --prod
```

### 方式3：ECS手动部署

```bash
# SSH连接到服务器
ssh user@your-ecs-ip

# 进入项目目录
cd /var/www/FilmTrip

# 拉取最新代码
git pull origin main

# 更新依赖（如果需要）
cd backend && npm install
cd ../frontend && npm install && npm run build

# 重启服务
pm2 restart filmtrip-backend-test
# 前端需要重启nginx或serve
```

---

## 📊 测试环境 vs 生产环境

| 项目 | 测试环境 | 生产环境 |
|------|---------|---------|
| **前端域名** | `filmtrip.imhw.top` | `filmtrip.cn` |
| **后端域名** | `api.filmtrip.imhw.top` | `api.filmtrip.cn` |
| **CDN域名** | `filmtrip-dev.test.upcdn.net` | `img.filmtrip.cn` |
| **又拍云Bucket** | `filmtrip-dev` | `filmtrip-prod` |
| **CDN协议** | HTTP（测试可用） | HTTPS（必须） |
| **数据库** | 测试数据库（可重置） | 生产数据库（重要） |
| **数据** | 测试数据（可删除） | 真实用户数据 |
| **目的** | 功能验证、测试 | 正式服务 |

---

## 💡 最佳实践

### ✅ 推荐做法

1. **先测试，再生产**：所有新功能先在测试环境验证
2. **测试1-2天**：确保没有严重问题再部署生产
3. **完整测试**：覆盖所有核心功能
4. **记录问题**：测试中发现的问题记录下来
5. **环境隔离**：测试和生产环境完全隔离（bucket、数据库等）

### ❌ 不推荐做法

1. **跳过测试**：直接部署到生产环境
2. **测试不充分**：没有完整测试就部署生产
3. **共用资源**：测试和生产共用bucket或数据库
4. **忽略问题**：测试环境发现问题但没解决就部署生产

---

## 🚨 常见问题

### Q: 测试环境上传的图片会在生产环境显示吗？

**A**: 不会。测试环境和生产环境使用不同的bucket（`filmtrip-dev` vs `filmtrip-prod`），完全隔离。

### Q: 测试环境可以用HTTP吗？

**A**: 可以。测试环境CDN可以用HTTP（`http://filmtrip-dev.test.upcdn.net`），但生产环境必须用HTTPS。

### Q: 测试环境部署失败怎么办？

**A**: 
1. 检查Vercel部署日志
2. 检查环境变量配置
3. 检查代码是否有错误
4. 回滚到之前的版本

### Q: 如何清除测试环境数据？

**A**: 
- **又拍云**: 在又拍云控制台删除测试bucket中的文件
- **数据库**: 重置测试数据库或删除测试数据
- **Vercel**: 重新部署会重新初始化

---

## 📝 下一步

1. ✅ 完成测试环境部署
2. ✅ 执行测试验证清单
3. ✅ 测试1-2天，确保无问题
4. ✅ 准备生产环境部署（参考 `production-upyun-checklist.md`）
5. ✅ 低峰期部署到生产环境

---

**⚠️ 重要：测试环境通过后，再部署到生产环境！**

