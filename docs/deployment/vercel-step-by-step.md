# Vercel配置 - 分步操作指南

## 日期
2025-11-13

## 📍 重要提示

**配置不在"General"页面！**
**配置在"Build and Deployment"页面！**

---

## 步骤1：进入Build配置页面

### 1.1 在左侧边栏找到
点击：**"Build and Deployment"**

（不是"General"，是"Build and Deployment"）

### 1.2 您会看到这些配置项
- Framework Preset
- Root Directory ← **这里要改**
- Build Command ← **这里要改**
- Output Directory ← **这里要改**
- Install Command ← **这里要改**

---

## 步骤2：修改Build配置

在"Build and Deployment"页面，找到并修改：

### 2.1 Root Directory
- **当前值**：可能是空白、`./` 或其他
- **改为**：`frontend`
- **说明**：告诉Vercel前端代码在哪个目录

### 2.2 Build Command
- **当前值**：可能是错误的或空白
- **改为**：`npm run build`
- **说明**：构建命令

### 2.3 Output Directory
- **当前值**：可能是错误的或空白
- **改为**：`dist`
- **说明**：构建输出目录

### 2.4 Install Command
- **当前值**：可能是错误的或空白
- **改为**：`npm install`
- **说明**：安装依赖命令

### 2.5 保存
- 滚动到页面底部
- 点击 **"Save"** 按钮

---

## 步骤3：配置环境变量

### 3.1 进入环境变量页面
在左侧边栏，点击：**"Environment Variables"**

### 3.2 添加环境变量
点击 **"Add New"** 或 **"Add"** 按钮

**添加第1个变量**：
- Key: `VITE_API_BASE`
- Value: `https://api.filmtrip.cn/api`
- Environment: 选择 **Production**（重要！）
- 点击 "Save"

**添加第2个变量**：
- Key: `VITE_BASE_URL`
- Value: `https://api.filmtrip.cn`
- Environment: 选择 **Production**
- 点击 "Save"

**添加第3个变量**：
- Key: `VITE_SHORT_LINK_PREFIX`
- Value: `https://filmtrip.cn/s`
- Environment: 选择 **Production**
- 点击 "Save"

**添加第4个变量**：
- Key: `VITE_UPYUN_DIRECT_UPLOAD`
- Value: `true`
- Environment: 选择 **Production**
- 点击 "Save"

---

## 步骤4：检查Git连接

### 4.1 进入Git页面
在左侧边栏，点击：**"Git"**

### 4.2 检查连接状态
- 如果显示已连接 `Harviewang/FilmTrip` → ✅ 跳过
- 如果显示 "Connect Git Repository" → 点击连接

---

## 步骤5：重新部署

### 5.1 进入Deployments页面
在顶部导航栏，点击：**"Deployments"**

### 5.2 重新部署
1. 找到最新的部署记录
2. 点击右侧的 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 等待部署完成

---

## 步骤6：添加dbdog.com域名

### 6.1 进入Domains页面
在左侧边栏，点击：**"Domains"**

### 6.2 添加域名
1. 点击 **"Add"** 或 **"Add Domain"** 按钮
2. 输入：`dbdog.com`
3. 点击 "Add"
4. 再添加：`www.dbdog.com`（可选）

### 6.3 记录DNS信息
Vercel会显示需要配置的DNS记录，类似：

```
类型: CNAME
名称: @
值: cname.vercel-dns.com
```

**把DNS记录信息发给我，我会帮您配置！**

---

## 配置检查清单

完成配置后，检查：

- [ ] Root Directory = `frontend`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Install Command = `npm install`
- [ ] 环境变量已添加（4个）
- [ ] GitHub仓库已连接
- [ ] 重新部署成功
- [ ] `dbgou.com` 可以访问
- [ ] `dbdog.com` 域名已添加

---

## 常见问题

### Q: 找不到"Build and Deployment"？
A: 在左侧边栏，向下滚动查找

### Q: 找不到"Save"按钮？
A: 滚动到页面底部

### Q: 环境变量添加后不生效？
A: 确保选择了 **Production** 环境，然后重新部署

### Q: 部署失败？
A: 查看部署日志，检查是否有错误信息

---

**完成这些步骤后，告诉我结果！**

