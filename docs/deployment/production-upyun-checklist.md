# 生产环境又拍云部署检查清单

## ⚠️ 重要：部署生产环境前必须检查这些配置

### 1. 环境变量配置（.env）

#### 必需配置
```bash
# 又拍云基础配置
UPYUN_BUCKET=filmtrip-prod                    # ⚠️ 必须改为生产bucket
UPYUN_OPERATOR=your_prod_operator             # ⚠️ 生产环境操作员
UPYUN_PASSWORD=your_prod_password             # ⚠️ 生产环境密码
UPYUN_FORM_API_SECRET=your_prod_form_secret   # ⚠️ 生产环境表单API密钥

# CDN域名配置
UPYUN_CDN_DOMAIN=https://img.filmtrip.cn      # ⚠️ 必须使用HTTPS + 生产域名
UPYUN_NOTIFY_URL=https://api.filmtrip.cn/api/storage/callback  # ⚠️ 必须是生产域名
UPYUN_RETURN_URL=                                # 可选，如果需要跳转页面

# 图片处理配置
UPYUN_IMAGE_PROCESSING_ENABLED=true              # 启用图片处理
UPYUN_DIRECT_UPLOAD_ENABLED=true                 # 启用直传

# 样式配置
UPYUN_STYLE_THUMB=thumb
UPYUN_STYLE_SIZE1024=preview
UPYUN_STYLE_SIZE2048=large
UPYUN_STYLE_WATERMARK=watermark
```

#### 关键检查点
- ✅ `UPYUN_BUCKET`：必须是生产bucket（不是 `filmtrip-dev`）
- ✅ `UPYUN_CDN_DOMAIN`：必须使用HTTPS（不是HTTP）
- ✅ `UPYUN_NOTIFY_URL`：必须是生产域名（又拍云回调能访问到的公网地址）
- ✅ `UPYUN_OPERATOR`、`UPYUN_PASSWORD`、`UPYUN_FORM_API_SECRET`：必须是生产环境的密钥

### 2. 又拍云控制台配置

#### Bucket配置
- [ ] 确认使用的是**生产bucket**（不是dev/test bucket）
- [ ] 确认bucket权限正确设置
- [ ] 确认表单上传API已启用
- [ ] 确认文件密钥已配置（用于FORM API）

#### CDN域名配置
- [ ] 绑定**生产域名**（如 `img.filmtrip.cn`）
- [ ] 配置HTTPS证书（SSL）
- [ ] 配置CORS（如果需要跨域访问）
- [ ] 确认CDN缓存策略

#### 样式配置
- [ ] **thumb样式**（600px）：无水印，输出格式JPG，质量85-90
- [ ] **preview样式**（1024px）：水印32px，输出格式JPG，质量85-90
- [ ] **large样式**（2048px）：水印48px，输出格式JPG，质量90-95，渐进式加载开启

### 3. 前端配置检查

#### API配置（frontend/src/config/api.js）
```javascript
const API_CONFIG = {
  BASE_URL: 'https://api.filmtrip.cn',           // ⚠️ 生产API地址
  API_BASE: 'https://api.filmtrip.cn/api',
  SHORT_LINK_PREFIX: 'https://filmtrip.cn/s',    // ⚠️ 生产短链前缀
};
```

#### 环境变量（.env.production）
```bash
VITE_API_BASE_URL=https://api.filmtrip.cn        # ⚠️ 生产API地址
VITE_SHORT_LINK_PREFIX=https://filmtrip.cn/s     # ⚠️ 生产短链前缀
VITE_UPYUN_DIRECT_UPLOAD=true                    # 启用直传
```

### 4. 后端配置检查

#### CORS配置（backend/index.js）
```javascript
const allowedOrigins = [
  'https://filmtrip.cn',              // ⚠️ 生产前端域名
  'https://www.filmtrip.cn',          // ⚠️ 如果有www域名
  // 开发环境域名不应出现在生产环境
];
```

#### 短链前缀配置
- `backend/storage/namingService.js`：确认使用 `https://filmtrip.cn/s`
- `frontend/src/utils/shortLink.js`：确认使用 `https://filmtrip.cn/s`

### 5. 又拍云回调URL检查

#### 回调URL配置
```
UPYUN_NOTIFY_URL=https://api.filmtrip.cn/api/storage/callback
```

#### 关键检查
- [ ] 回调URL必须是**公网可访问**的HTTPS地址
- [ ] 回调URL必须是**生产环境**的API地址
- [ ] 确认回调接口 `/api/storage/callback` 已部署并可访问
- [ ] 确认服务器防火墙允许又拍云服务器访问

#### 测试回调
1. 上传一张测试照片
2. 检查又拍云控制台的回调日志
3. 检查后端日志，确认收到回调
4. 检查数据库，确认照片记录已更新

### 6. 域名和SSL检查

#### 前端域名
- [ ] `filmtrip.cn` 或 `www.filmtrip.cn` 已配置
- [ ] HTTPS证书已配置并有效
- [ ] DNS解析正确

#### API域名
- [ ] `api.filmtrip.cn` 已配置
- [ ] HTTPS证书已配置并有效
- [ ] DNS解析正确

#### CDN域名
- [ ] `img.filmtrip.cn` 已配置（或使用又拍云默认CDN域名）
- [ ] HTTPS证书已配置并有效
- [ ] DNS解析正确

### 7. 签名URL配置

#### 受保护照片签名URL
- [ ] 签名URL有效期设置为 10 分钟（当前配置）
- [ ] 确认生产环境的 `UPYUN_PASSWORD` 正确（用于签名）
- [ ] 测试受保护照片是否能正常显示（签名URL是否生成正确）

### 8. 缓存和性能

#### CDN缓存
- [ ] 配置CDN缓存策略（图片缓存时间）
- [ ] 配置缓存刷新规则（如何清除缓存）
- [ ] 测试缓存是否正常工作

#### 图片处理缓存
- [ ] 又拍云会自动缓存处理后的图片（`!thumb`、`!preview`、`!large`）
- [ ] 修改样式配置后，需要清除CDN缓存才能看到新效果

### 9. 测试清单

#### 上传测试
- [ ] 单张照片上传测试
- [ ] 批量照片上传测试
- [ ] 上传后照片是否显示在列表中
- [ ] 上传后照片URL是否正确生成

#### 显示测试
- [ ] 列表页照片是否正常显示（使用 `!thumb` 样式）
- [ ] 预览页照片是否正常显示（使用 `!preview` 或 `!large` 样式）
- [ ] 瀑布流照片是否正常显示
- [ ] 受保护照片是否使用签名URL

#### 水印测试
- [ ] 预览图水印是否显示（32px）
- [ ] 大图水印是否显示（48px）
- [ ] 缩略图无水印（正常）

#### 回调测试
- [ ] 上传后是否收到又拍云回调
- [ ] 回调后照片记录是否更新（`origin_path`、`width`、`height`等）
- [ ] 回调日志是否正常记录

### 10. 常见问题排查

#### 图片404错误
- [ ] 检查 `origin_path` 是否正确
- [ ] 检查 `origin_bucket` 是否匹配
- [ ] 检查样式名称是否正确（`thumb`、`preview`、`large`）
- [ ] 检查CDN域名是否正确
- [ ] 检查bucket权限设置

#### 图片加载慢
- [ ] 检查CDN是否启用
- [ ] 检查CDN域名是否正确配置
- [ ] 检查网络连接

#### 回调未收到
- [ ] 检查 `UPYUN_NOTIFY_URL` 是否正确（必须是公网HTTPS地址）
- [ ] 检查服务器防火墙是否允许又拍云访问
- [ ] 检查后端日志是否有错误
- [ ] 检查又拍云控制台的回调日志

#### 签名URL过期
- [ ] 检查 `UPYUN_PASSWORD` 是否正确
- [ ] 检查前端是否处理了URL过期错误
- [ ] 测试长时间停留页面后图片是否还能显示

### 11. 回滚方案

#### 如果部署后图片打不开
1. **立即回滚环境变量**：恢复为之前的配置
2. **检查又拍云控制台**：确认bucket和样式配置正确
3. **检查CDN域名**：确认DNS解析和SSL证书
4. **检查后端日志**：查看错误信息
5. **测试回调**：确认回调URL是否可访问

#### 临时方案
- 如果又拍云出现问题，可以临时禁用直传（`UPYUN_DIRECT_UPLOAD_ENABLED=false`）
- 系统会自动回退到本地存储（如果有本地文件）

### 12. 监控和日志

#### 后端日志监控
- [ ] 监控 `/api/storage/policy` 的调用情况
- [ ] 监控 `/api/storage/callback` 的接收情况
- [ ] 监控图片URL生成的错误
- [ ] 监控签名URL生成错误

#### 前端日志监控
- [ ] 监控图片加载失败的情况
- [ ] 监控签名URL过期的情况
- [ ] 监控上传失败的情况

---

## 📋 快速检查命令

部署前运行这些命令检查配置：

```bash
# 检查后端环境变量
cd backend
node -e "require('dotenv').config(); console.log('Bucket:', process.env.UPYUN_BUCKET); console.log('CDN:', process.env.UPYUN_CDN_DOMAIN); console.log('Notify:', process.env.UPYUN_NOTIFY_URL);"

# 检查又拍云配置
node -e "require('dotenv').config(); const us = require('./storage/upyunService'); console.log('Configured:', us.isConfigured()); console.log('Config:', JSON.stringify(us.getConfig(), null, 2));"
```

---

**⚠️ 最重要：部署前必须确认**
1. ✅ 所有域名都使用HTTPS（不是HTTP）
2. ✅ 所有域名都指向生产环境（不是localhost或dev环境）
3. ✅ 又拍云回调URL必须是公网可访问的HTTPS地址
4. ✅ 又拍云bucket、操作员、密钥都是生产环境的

