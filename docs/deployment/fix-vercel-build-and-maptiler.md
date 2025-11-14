# 修复Vercel部署和MapTiler配置

**创建日期**：2025-11-14  
**问题**：
1. 后端部署失败：缺少build脚本
2. 地图显示OSM而不是MapTiler

---

## 🔧 问题1：后端部署错误

### 错误信息
```
npm error Missing script: "build"
Error: Command "npm run build" exited with 1
```

### 原因
`backend/package.json` 中没有 `build` 脚本，但Vercel尝试执行build命令。

### 修复方案

**方案1：添加build脚本（推荐）**

在 `backend/package.json` 中添加：
```json
{
  "scripts": {
    "build": "echo 'No build step required for Vercel Serverless Functions'"
  }
}
```

**方案2：在Vercel Dashboard中移除Build Command**

1. 访问 Vercel Dashboard
2. 后端项目 → Settings → Build and Deployment
3. 清空 "Build Command" 字段
4. 保存

---

## 🔧 问题2：地图显示OSM而不是MapTiler

### 原因
前端代码检查 `VITE_MAPTILER_KEY` 环境变量：
- 如果环境变量未配置或无效，会降级到OSM
- Vercel前端项目可能没有配置 `VITE_MAPTILER_KEY`

### 修复方案

#### 步骤1：获取MapTiler API Key

1. **访问MapTiler**
   - https://cloud.maptiler.com/
   - 登录您的账号

2. **获取API Key**
   - 进入 API Keys 页面
   - 复制您的API Key

#### 步骤2：配置前端环境变量

1. **访问Vercel Dashboard**
   - https://vercel.com/dashboard
   - 找到前端项目

2. **进入环境变量设置**
   - Settings → Environment Variables

3. **添加MapTiler API Key**
   ```
   名称: VITE_MAPTILER_KEY
   值: [您的MapTiler API Key]
   环境: Production（必需）、Preview（可选）、Development（可选）
   ```

4. **保存并重新部署**
   - 点击 "Save"
   - Deployments → Redeploy
   - 等待部署完成

#### 步骤3：验证配置

1. **访问地图页面**
   - https://filmtrip.imhw.top/map

2. **打开浏览器开发者工具**
   - F12 → Console标签

3. **检查日志**
   - 应该看到MapTiler相关的日志
   - 不应该看到 "Using OSM fallback" 的警告

4. **检查地图样式**
   - 地图应该显示MapTiler的样式（不是OSM的样式）

---

## 📋 快速修复清单

### 后端修复（必需）

- [ ] ✅ 在 `backend/package.json` 中添加 `build` 脚本
- [ ] ✅ 提交并推送代码
- [ ] ✅ 等待Vercel自动部署
- [ ] ✅ 验证后端部署成功（不再出现build错误）

### 前端修复（必需）

- [ ] ✅ 获取MapTiler API Key
- [ ] ✅ 在Vercel前端项目中添加 `VITE_MAPTILER_KEY` 环境变量
- [ ] ✅ 保存并重新部署前端
- [ ] ✅ 访问地图页面验证使用MapTiler样式

---

## 🔍 代码检查

### 后端代码检查

确认 `backend/package.json` 中有：
```json
{
  "scripts": {
    "build": "echo 'No build step required for Vercel Serverless Functions'"
  }
}
```

### 前端代码检查

前端代码会检查环境变量：
```javascript
const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;

if (!maptilerKey || quotaMonitor.shouldUseOSM()) {
  // 降级到OSM
  return useOSM();
}

// 使用MapTiler
return useMapTiler(maptilerKey);
```

---

## 💡 MapTiler API Key获取方法

### 如果您已有MapTiler账号

1. **登录MapTiler**
   - https://cloud.maptiler.com/
   - 使用您的账号登录

2. **获取API Key**
   - Dashboard → API Keys
   - 复制您的API Key

### 如果没有MapTiler账号

1. **注册账号**
   - https://cloud.maptiler.com/
   - 免费套餐有每月10万次请求的额度

2. **创建API Key**
   - Dashboard → API Keys
   - 创建新密钥

---

## 🚨 注意事项

### MapTiler配额限制

- **免费套餐**：每月10万次请求
- **超出限制**：会自动降级到OSM
- **监控使用**：前端代码会自动监控使用量

### OSM作为备选

- 如果MapTiler不可用，会自动降级到OSM
- OSM是免费的，但样式不如MapTiler美观

---

## 📚 相关文档

- [Vercel环境变量配置](./vercel-env-variables-config.md)
- [Vercel测试检查清单](./vercel-test-checklist.md)
- [后端API连接检查](./backend-api-connection-check.md)

---

**💡 提示**：修复这两个问题后，后端应该能正常部署，地图也应该显示MapTiler样式。

---

**最后更新**：2025-11-14  
**状态**：待修复

