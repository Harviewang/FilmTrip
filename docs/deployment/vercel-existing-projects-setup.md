# Vercel现有项目重新配置指南

## 日期
2025-11-13

## 现状分析

### 现有Vercel项目
1. **backend项目** - 域名：`api.dbgou.com`
   - 状态：需要重新配置
   - 问题：可能Root Directory或Build Command配置错误

2. **frontend项目** - 域名：`dbgou.com`
   - 状态：需要重新配置
   - 问题：可能Root Directory或Build Command配置错误

### 决策建议
**✅ 建议：基于现有项目重新配置（不删除）**

**理由**：
- ✅ 保留项目历史和部署记录
- ✅ 保留已配置的域名（`dbgou.com`、`api.dbgou.com`）
- ✅ 只需更新配置，无需重新添加域名
- ✅ 避免DNS配置重新生效的等待时间

---

## 重新配置步骤

### 方案A：修复前端项目（推荐）

#### 步骤1：进入前端项目设置
1. 在Vercel Dashboard点击 `frontend` 项目
2. 点击 "Settings" → "General"

#### 步骤2：更新项目配置
**Root Directory**：
- 当前：可能是 `./` 或空白
- **应该改为**：`frontend`

**Build Command**：
- 当前：可能是错误的
- **应该改为**：`npm run build`

**Output Directory**：
- 当前：可能是错误的
- **应该改为**：`dist`

**Install Command**：
- **设置为**：`npm install`

#### 步骤3：配置环境变量
进入 "Settings" → "Environment Variables"，添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_API_BASE` | `https://api.filmtrip.cn/api` | Production |
| `VITE_BASE_URL` | `https://api.filmtrip.cn` | Production |
| `VITE_SHORT_LINK_PREFIX` | `https://filmtrip.cn/s` | Production |
| `VITE_UPYUN_DIRECT_UPLOAD` | `true` | Production |

#### 步骤4：重新部署
1. 进入 "Deployments" 页面
2. 点击 "..." → "Redeploy" 或
3. 推送代码到GitHub触发自动部署

---

### 方案B：重新连接GitHub仓库

如果项目没有连接GitHub，需要重新连接：

#### 步骤1：断开当前连接
1. 进入项目 "Settings" → "Git"
2. 如果有连接的仓库，先断开

#### 步骤2：连接新仓库
1. 点击 "Connect Git Repository"
2. 选择 `Harviewang/FilmTrip` 仓库
3. 配置：
   - **Root Directory**：`frontend`
   - **Production Branch**：`main`
4. 点击 "Save"

#### 步骤3：配置构建设置
在 "Settings" → "General" 中确认：
- **Framework Preset**：Vite
- **Root Directory**：`frontend`
- **Build Command**：`npm run build`
- **Output Directory**：`dist`
- **Install Command**：`npm install`

---

## 配置 `dbdog.com` 域名

### 步骤1：在Vercel添加域名
1. 进入前端项目 "Settings" → "Domains"
2. 添加域名：
   - `dbdog.com`
   - `www.dbdog.com`（可选）

### 步骤2：获取DNS配置
Vercel会显示需要配置的DNS记录，通常是：

**CNAME方式**（推荐）：
```
类型: CNAME
名称: @
值: cname.vercel-dns.com
```

或者**A记录方式**：
```
类型: A
名称: @
值: 76.76.21.21
```

### 步骤3：配置DNS（我帮您执行）
告诉我Vercel显示的DNS记录值，我会立即配置。

---

## 验证配置

### 检查清单
- [ ] Root Directory 设置为 `frontend`
- [ ] Build Command 设置为 `npm run build`
- [ ] Output Directory 设置为 `dist`
- [ ] 环境变量已正确配置
- [ ] GitHub仓库已连接
- [ ] 域名已添加（`dbgou.com`、`dbdog.com`）

### 测试部署
1. 推送代码到GitHub
2. 查看Vercel部署日志
3. 访问部署的URL测试功能

---

## 如果重新配置后仍无法打开

### 可能原因
1. **Root Directory错误** - 确保设置为 `frontend`
2. **Build Command错误** - 确保是 `npm run build`
3. **环境变量缺失** - 检查所有必需变量
4. **GitHub仓库未连接** - 重新连接仓库
5. **构建失败** - 查看部署日志

### 排查步骤
1. 查看部署日志（Vercel Dashboard → Deployments → 点击部署）
2. 检查构建输出
3. 检查环境变量
4. 验证GitHub仓库连接

---

## 快速修复命令（CLI方式）

如果使用CLI，可以重新链接项目：

```bash
cd frontend
vercel link
# 选择现有项目：frontend

# 更新配置
vercel env add VITE_API_BASE production
# 输入: https://api.filmtrip.cn/api

vercel env add VITE_BASE_URL production
# 输入: https://api.filmtrip.cn

vercel env add VITE_SHORT_LINK_PREFIX production
# 输入: https://filmtrip.cn/s

vercel env add VITE_UPYUN_DIRECT_UPLOAD production
# 输入: true

# 重新部署
vercel --prod
```

---

**最后更新**：2025-11-13  
**状态**：待配置

