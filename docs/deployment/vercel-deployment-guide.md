# Vercel前端部署指南

## 日期
2025-11-13

## 前置准备

### 1. 安装Vercel CLI（可选，也可使用Web界面）
```bash
npm i -g vercel
```

### 2. 检查前端项目配置
- ✅ `vercel.json` - Vercel配置文件（已创建）
- ✅ `package.json` - 构建脚本配置
- ✅ 环境变量配置（`.env`文件或Vercel控制台）

---

## 部署步骤

### 方法1：通过Vercel CLI部署（推荐）

#### 步骤1：登录Vercel
```bash
cd frontend
vercel login
```

#### 步骤2：初始化项目
```bash
vercel
```
按提示操作：
- Set up and deploy? **Yes**
- Which scope? 选择你的账户
- Link to existing project? **No**（首次部署）
- Project name? **filmtrip-frontend**（或自定义）
- Directory? **./**
- Override settings? **No**

#### 步骤3：配置环境变量
```bash
vercel env add VITE_API_BASE production
# 输入: https://api.filmtrip.cn/api

vercel env add VITE_BASE_URL production
# 输入: https://api.filmtrip.cn

vercel env add VITE_SHORT_LINK_PREFIX production
# 输入: https://filmtrip.cn/s

vercel env add VITE_UPYUN_DIRECT_UPLOAD production
# 输入: true
```

或者通过Vercel控制台配置：
1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加环境变量（见下方列表）

#### 步骤4：部署到生产环境
```bash
vercel --prod
```

---

### 方法2：通过GitHub集成部署（自动化，推荐）

#### 步骤1：连接GitHub仓库
1. 访问 https://vercel.com
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择 `Harviewang/FilmTrip` 仓库
5. 点击 "Import"

#### 步骤2：配置项目设置
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 步骤3：配置环境变量
在项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE` | `https://api.filmtrip.cn/api` | API基础地址 |
| `VITE_BASE_URL` | `https://api.filmtrip.cn` | 后端基础地址 |
| `VITE_SHORT_LINK_PREFIX` | `https://filmtrip.cn/s` | 短链接前缀 |
| `VITE_UPYUN_DIRECT_UPLOAD` | `true` | 启用又拍云直传 |

#### 步骤4：部署
- 点击 "Deploy"
- Vercel会自动构建并部署
- 部署完成后会获得一个URL（如：`filmtrip-frontend.vercel.app`）

---

## 环境变量配置

### 生产环境变量列表

```bash
# API配置
VITE_API_BASE=https://api.filmtrip.cn/api
VITE_BASE_URL=https://api.filmtrip.cn
VITE_SHORT_LINK_PREFIX=https://filmtrip.cn/s

# 又拍云配置
VITE_UPYUN_DIRECT_UPLOAD=true

# 可选：其他配置
VITE_APP_TITLE=FilmTrip
```

### 配置方式

#### 通过Vercel CLI
```bash
vercel env add VITE_API_BASE production
vercel env add VITE_BASE_URL production
vercel env add VITE_SHORT_LINK_PREFIX production
vercel env add VITE_UPYUN_DIRECT_UPLOAD production
```

#### 通过Vercel控制台
1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加变量（选择环境：Production、Preview、Development）
4. 保存后重新部署

---

## 自定义域名配置

### 步骤1：在Vercel添加自定义域名
1. 进入项目设置
2. 点击 "Domains"
3. 输入域名：`filmtrip.cn` 或 `www.filmtrip.cn`
4. 按照提示配置DNS记录

### 步骤2：配置DNS记录
Vercel会提供DNS配置信息，通常是：
```
类型: CNAME
名称: @ 或 www
值: cname.vercel-dns.com
```

或者：
```
类型: A
名称: @
值: 76.76.21.21（Vercel IP地址）
```

### 步骤3：等待DNS生效
- DNS记录通常5-10分钟生效
- Vercel会自动配置SSL证书

---

## 后端CORS配置

### 更新后端CORS设置

需要在ECS后端配置CORS，允许Vercel域名访问：

```javascript
// backend/index.js
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  'https://filmtrip.cn',  // 生产环境前端
  'https://www.filmtrip.cn',  // 生产环境前端（www）
  'https://filmtrip-frontend.vercel.app',  // Vercel部署地址
  'https://*.vercel.app',  // Vercel预览部署（通配符）
  'https://filmtrip.imhw.top'  // 测试环境前端
];
```

或者使用环境变量：
```javascript
const allowedOrigins = [
  ...(process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  'https://*.vercel.app'  // Vercel预览部署
];
```

环境变量配置：
```bash
ALLOWED_ORIGINS=https://filmtrip.cn,https://www.filmtrip.cn,https://filmtrip-frontend.vercel.app
```

---

## 自动部署配置

### GitHub集成自动部署

Vercel与GitHub集成后，每次推送代码都会自动部署：

- **Push到main分支** → 自动部署到生产环境
- **创建PR** → 自动生成预览部署URL

### 部署流程
```
GitHub Push → Vercel检测 → 自动构建 → 自动部署 → 发送通知
```

### 预览部署
每次PR都会生成一个预览URL，例如：
- `filmtrip-frontend-git-feature-branch-username.vercel.app`

---

## 验证部署

### 1. 检查部署状态
- 访问 Vercel Dashboard
- 查看部署日志
- 确认构建成功

### 2. 测试功能
- 访问部署的URL
- 测试API连接
- 测试图片上传
- 测试图片显示

### 3. 检查环境变量
```bash
# 在浏览器控制台检查
console.log(import.meta.env.VITE_API_BASE);
```

---

## 常见问题

### 问题1：API请求失败（CORS错误）
**解决**：
1. 检查后端CORS配置是否包含Vercel域名
2. 检查环境变量`VITE_API_BASE`是否正确
3. 确认后端服务正常运行

### 问题2：图片上传失败
**解决**：
1. 检查`VITE_UPYUN_DIRECT_UPLOAD`是否为`true`
2. 检查后端又拍云配置
3. 查看浏览器控制台错误信息

### 问题3：环境变量未生效
**解决**：
1. 在Vercel控制台重新添加环境变量
2. 重新部署项目
3. 检查变量名是否正确（必须以`VITE_`开头）

### 问题4：构建失败
**解决**：
1. 检查构建日志
2. 确认`package.json`中的构建脚本正确
3. 检查依赖是否完整

---

## 回滚部署

### 在Vercel控制台回滚
1. 进入项目部署列表
2. 找到之前的成功部署
3. 点击 "..." → "Promote to Production"

### 通过CLI回滚
```bash
vercel rollback
```

---

## 监控和分析

### Vercel Analytics（可选）
1. 在项目设置中启用Analytics
2. 查看访问统计
3. 性能监控

### 日志查看
```bash
# 查看实时日志
vercel logs

# 查看特定部署日志
vercel logs [deployment-url]
```

---

## 成本

### Vercel免费版
- ✅ 无限部署
- ✅ 100GB带宽/月
- ✅ 自动HTTPS
- ✅ 预览部署
- ✅ 自定义域名

**限制**：
- 个人项目使用
- 带宽超过100GB后需要升级

### 升级Pro版（可选）
- $20/月
- 无限带宽
- 团队协作
- 更高级功能

---

## 下一步

### 部署完成后
1. ✅ 测试所有功能
2. ✅ 配置自定义域名
3. ✅ 配置后端CORS
4. ✅ 验证又拍云图片加载
5. ✅ 设置监控告警

### 后续优化
1. 配置CDN加速（Vercel已内置全球CDN）
2. 优化构建时间
3. 配置自动部署审批流程（Pro版）

---

**最后更新**：2025-11-13  
**状态**：待部署

