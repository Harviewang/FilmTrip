# Vercel部署 - 操作清单

## 日期
2025-11-13

## 您需要做的事情

### 步骤1：修复frontend项目配置（5分钟）

#### 1.1 进入Vercel项目
1. 访问 https://vercel.com
2. 点击 `frontend` 项目

#### 1.2 更新项目配置
进入 "Settings" → "Build and Deployment"：

**如果 Root Directory 设置为 `frontend` 报错"找不到目录"**，请尝试以下两种方案：

**方案A（推荐）：Root Directory 设为 `.`（空）**
- ✅ **Root Directory**：留空或设为 `.`（表示Git仓库根目录）
- ✅ **Build Command**：改为 `cd frontend && npm run build`
- ✅ **Output Directory**：改为 `frontend/dist`
- ✅ **Install Command**：改为 `cd frontend && npm install`

**方案B：Root Directory 设为 `frontend`**
- ✅ **Root Directory**：改为 `frontend`
- ✅ **Build Command**：改为 `npm run build`
- ✅ **Output Directory**：改为 `dist`
- ✅ **Install Command**：改为 `npm install`

**⚠️ 如果方案B报错"找不到frontend目录"**，请先检查步骤1.3的Git连接是否正确。

#### 1.3 检查GitHub连接（⚠️ 重要！）
进入 "Settings" → "Git"：
- ✅ 检查是否显示 "Connected to GitHub" 或 "Connect Git Repository"
- ✅ 如果显示 "Connect Git Repository" → 点击连接
- ✅ **必须选择** `Harviewang/FilmTrip` 仓库（不是其他仓库！）
- ✅ 确保 Production Branch 是 `main`
- ✅ 如果连接的不是正确的仓库，请先"Disconnect"然后重新连接

**⚠️ 如果Git连接不正确，Root Directory找不到目录的问题就无解！**

#### 1.4 配置环境变量
进入 "Settings" → "Environment Variables"：
添加以下变量（Environment选择 Production）：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_BASE` | `https://api.filmtrip.cn/api` |
| `VITE_BASE_URL` | `https://api.filmtrip.cn` |
| `VITE_SHORT_LINK_PREFIX` | `https://filmtrip.cn/s` |
| `VITE_UPYUN_DIRECT_UPLOAD` | `true` |

#### 1.5 重新部署
1. 进入 "Deployments" 页面
2. 点击最新部署右侧的 "..." 
3. 选择 "Redeploy"
4. 等待部署完成
5. 测试访问 `dbgou.com` 是否正常

---

### 步骤2：添加dbdog.com域名（5分钟）

#### 2.1 在Vercel添加域名
1. 在frontend项目中，进入 "Settings" → "Domains"
2. 点击 "Add" 或 "Add Domain"
3. 输入：`dbdog.com`
4. 点击 "Add"
5. 再添加：`www.dbdog.com`（可选）

#### 2.2 记录DNS配置信息
Vercel会显示需要配置的DNS记录，通常类似：

**CNAME方式**：
```
类型: CNAME
名称: @
值: cname.vercel-dns.com
```

或**A记录方式**：
```
类型: A
名称: @
值: 76.76.21.21
```

#### 2.3 告诉我DNS记录值
把Vercel显示的DNS记录信息发给我，我会帮您配置。

**需要的信息**：
- DNS记录类型（CNAME还是A记录）
- DNS记录值（如：`cname.vercel-dns.com` 或 `76.76.21.21`）

---

## 我会帮您做的事情

### ✅ 已完成
1. ✅ 创建 `frontend/vercel.json` 配置文件
2. ✅ 更新后端CORS配置（支持dbdog.com和*.vercel.app）
3. ✅ 创建DNS配置脚本 `setup-vercel-domain-dns.js`

### ⏳ 等您提供DNS信息后
1. ⏳ 执行DNS配置（使用脚本自动配置阿里云DNS）
2. ⏳ 验证DNS配置是否成功

---

## 快速检查清单

### 在Vercel控制台检查
- [ ] Root Directory = `frontend`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] GitHub仓库已连接
- [ ] 环境变量已添加（4个变量）
- [ ] 部署成功（无错误）
- [ ] `dbgou.com` 可以正常访问
- [ ] `dbdog.com` 域名已添加

### 测试功能
- [ ] 访问 `https://dbgou.com` 或 `https://dbdog.com`
- [ ] 检查页面是否正常加载
- [ ] 测试API连接（查看浏览器控制台）
- [ ] 测试图片加载

---

## 遇到问题？

### 如果部署失败
1. 查看部署日志（点击部署记录查看）
2. 检查是否有构建错误
3. 确认Root Directory是否正确

### 如果页面打不开
1. 检查部署是否成功
2. 查看部署日志中的错误
3. 确认环境变量是否正确

### 如果API连接失败
1. 检查环境变量 `VITE_API_BASE` 是否正确
2. 检查后端CORS配置（我已经更新，需要重启后端）
3. 查看浏览器控制台的错误信息

---

**完成步骤1和步骤2后，告诉我结果，我会继续帮您配置DNS！**

