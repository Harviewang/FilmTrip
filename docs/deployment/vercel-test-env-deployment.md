# Vercel测试环境部署指南

## 📋 快速开始

### 当前测试环境配置
- **前端**: `https://filmtrip.imhw.top` (Vercel)
- **后端**: `https://api.filmtrip.imhw.top` (Vercel)
- **部署方式**: Vercel CLI 或 GitHub自动部署

---

## 🚀 方式1：使用快速部署脚本（推荐）

### 步骤

```bash
# 1. 确保在项目根目录
cd /path/to/FilmTrip

# 2. 运行部署脚本
./deploy-test-env.sh

# 脚本会：
# - 检查Git状态
# - 检查Vercel CLI
# - 部署后端和前端
# - 验证部署结果
```

---

## 🚀 方式2：手动部署

### 前提条件

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **确保代码已推送**
   ```bash
   git add .
   git commit -m "准备部署到测试环境"
   git push origin main
   ```

### 部署后端

```bash
cd backend
vercel --prod
cd ..
```

**后端环境变量配置**（在Vercel项目设置中）：
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

### 部署前端

```bash
cd frontend
vercel --prod
cd ..
```

**前端环境变量配置**（在Vercel项目设置中）：
```bash
VITE_API_BASE=https://api.filmtrip.imhw.top/api
VITE_BASE_URL=https://api.filmtrip.imhw.top
VITE_SHORT_LINK_PREFIX=https://filmtrip.imhw.top/s
VITE_UPYUN_DIRECT_UPLOAD=true
```

---

## 🚀 方式3：GitHub自动部署（推荐）

### 配置步骤

1. **连接GitHub仓库**
   - 访问 https://vercel.com/dashboard
   - 在项目设置中连接GitHub仓库
   - 选择 `Harviewang/FilmTrip`

2. **配置项目设置**

   **前端项目 (`frontend`)**:
   - Root Directory: `frontend` 或 `.`（如果报错）
   - Build Command: `npm run build` 或 `cd frontend && npm run build`
   - Output Directory: `dist` 或 `frontend/dist`
   - Framework: Vite

   **后端项目 (`backend`)**:
   - Root Directory: `backend`
   - Build Command: 留空（Vercel自动处理）
   - Output Directory: 留空
   - Framework: Other

3. **配置环境变量**（参考上面的环境变量配置）

4. **自动部署**
   - 推送代码到 `main` 分支
   - Vercel自动触发部署
   - 等待部署完成（通常1-2分钟）

---

## ✅ 部署后验证

### 快速验证

```bash
# 验证后端
curl https://api.filmtrip.imhw.top/api/health

# 验证前端
curl https://filmtrip.imhw.top
```

### 完整验证清单

- [ ] 访问 `https://filmtrip.imhw.top` 正常打开
- [ ] 访问 `https://api.filmtrip.imhw.top/api/health` 返回正常
- [ ] 登录功能正常
- [ ] 照片列表正常加载
- [ ] 上传照片测试（测试又拍云集成）
- [ ] 照片显示正常（测试CDN）
- [ ] 水印正常显示（测试图片处理）

---

## 🔧 常见问题

### Q: 部署失败，提示"Root Directory不存在"

**A**: 
1. 检查Vercel项目设置中的Root Directory
2. 尝试将Root Directory改为 `.`（空）
3. 同时修改Build Command为 `cd frontend && npm run build`

### Q: 环境变量未生效

**A**: 
1. 在Vercel项目设置中检查环境变量
2. 确保选择了正确的环境（Production/Preview/Development）
3. 重新部署项目

### Q: 自定义域名无法访问

**A**: 
1. 检查DNS配置是否正确
2. 在Vercel项目设置中检查域名配置
3. 等待DNS生效（通常5-10分钟）

### Q: 又拍云上传失败

**A**: 
1. 检查后端环境变量（UPYUN_BUCKET、UPYUN_OPERATOR等）
2. 检查又拍云控制台配置
3. 查看Vercel部署日志中的错误信息

---

## 📝 环境变量完整清单

### 后端环境变量（必需）

```bash
# 又拍云配置
UPYUN_BUCKET=filmtrip-dev
UPYUN_OPERATOR=your_dev_operator
UPYUN_PASSWORD=your_dev_password
UPYUN_FORM_API_SECRET=your_dev_form_secret
UPYUN_CDN_DOMAIN=http://filmtrip-dev.test.upcdn.net
UPYUN_NOTIFY_URL=https://api.filmtrip.imhw.top/api/storage/callback

# 功能开关
UPYUN_IMAGE_PROCESSING_ENABLED=true
UPYUN_DIRECT_UPLOAD_ENABLED=true

# 样式配置
UPYUN_STYLE_THUMB=thumb
UPYUN_STYLE_SIZE1024=preview
UPYUN_STYLE_SIZE2048=large

# CORS
CORS_ALLOWED_ORIGINS=https://filmtrip.imhw.top,https://filmtrip.cn

# 应用配置
NODE_ENV=production
JWT_SECRET=your_test_jwt_secret

# 数据库配置（根据实际情况填写）
# DB_HOST=...
# DB_PORT=...
# DB_NAME=...
# DB_USER=...
# DB_PASSWORD=...
```

### 前端环境变量（必需）

```bash
VITE_API_BASE=https://api.filmtrip.imhw.top/api
VITE_BASE_URL=https://api.filmtrip.imhw.top
VITE_SHORT_LINK_PREFIX=https://filmtrip.imhw.top/s
VITE_UPYUN_DIRECT_UPLOAD=true
```

---

## 🔄 更新部署

### 代码更新后重新部署

```bash
# 提交代码
git add .
git commit -m "更新功能"
git push origin main

# Vercel会自动部署（如果已连接GitHub）
# 或手动部署：
./deploy-test-env.sh
```

### 环境变量更新后重新部署

1. 在Vercel项目设置中更新环境变量
2. 进入Deployments页面
3. 点击最新部署右侧的"..." → "Redeploy"

---

## 📚 相关文档

- `docs/deployment/test-environment-setup.md` - 测试环境完整指南
- `docs/deployment/production-upyun-checklist.md` - 生产环境又拍云部署清单
- `deploy-test-env.sh` - 快速部署脚本

---

**⚠️ 重要：部署前确保环境变量已正确配置！**

