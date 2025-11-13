# 又拍云 FORM API 密钥更新

## 日期
2025-11-13

## 问题描述

用户提供了又拍云控制台中的"文件密钥"（File Key）：
- 密钥值: `KsdvRi49VRNj7W9NcHQj9BYDAPw=`
- 状态: 已开启（绿色 ON 开关）
- 这是 FORM API 签名密钥，用于生成上传策略

## 又拍云控制台截图说明

根据用户提供的又拍云控制台截图：

1. **文件密钥页面**：
   - 标题: "文件密钥" (File Key)
   - 状态: "已开启" (Enabled) - 蓝色标签
   - 开关: 绿色 ON 开关（控制文件密钥功能）

2. **密钥信息**：
   - 密钥值: `KsdvRi49VRNj7W9NcHQj9BYDAPw=`（被掩码显示）
   - 操作按钮: "隐藏"、"更换密钥"、"复制密钥"

3. **警告信息**（红色）：
   - "更换、关闭密钥后,已使用原密钥计算签名的 FORM API 必须更新密钥,否则无法上传。请确保您的应用不受影响后再操作。"
   - 这说明：文件密钥就是 FORM API 密钥，关闭或更换后会影响上传功能

4. **使用说明**（黑色）：
   - "私有读权限的文件访问时,需要在 URL 后面添加间隔标识符和文件密钥。"
   - 这说明文件密钥也用于私有文件访问

## 配置更新

### 1. 更新环境变量
**文件**: `backend/.env`

**修改前**:
```env
UPYUN_FORM_API_SECRET=402e4c36b7c75b85586f5fa12b27bc89
```

**修改后**:
```env
UPYUN_FORM_API_SECRET=KsdvRi49VRNj7W9NcHQj9BYDAPw=
```

### 2. 重启后端服务
- 更新 `.env` 文件后，需要重启后端服务
- 新配置会在服务启动时加载

### 3. 验证配置
- 检查 `upyunService.isFormApiConfigured()` 返回 `true`
- 检查 `upyunService.getConfig().formApiSecret` 是否正确

## FORM API 密钥说明

### 1. 密钥作用
- 用于生成 FORM API 上传策略的签名
- 用于验证又拍云回调请求的签名
- 用于生成私有文件访问的签名 URL

### 2. 密钥格式
- 又拍云 FORM API 密钥通常是 base64 编码的字符串
- 例如: `KsdvRi49VRNj7W9NcHQj9BYDAPw=`

### 3. 密钥安全
- 密钥应该保密，不要提交到代码仓库
- 密钥应该存储在 `.env` 文件中，并添加到 `.gitignore`
- 如果密钥泄露，应该立即更换

## 签名生成

### 1. 上传策略签名
```javascript
const policy = {
  bucket: 'filmtrip-dev',
  'save-key': '/path/to/file.jpg',
  expiration: 1234567890
};

const policyEncoded = Buffer.from(JSON.stringify(policy)).toString('base64');
const signature = crypto
  .createHash('md5')
  .update(`${policyEncoded}&${formApiSecret}`)
  .digest('hex');
```

### 2. 回调签名验证
```javascript
const signString = `${code}&${message}&${url}&${time}&${formApiSecret}`;
const sign = crypto.createHash('md5').update(signString).digest('hex');
```

## 相关文档

### 又拍云 FORM API 文档
- [又拍云 FORM API 文档](https://help.upyun.com/knowledge-base/form_api/)
- 文档中提到了签名认证，但没有明确说明如何启用 FORM API
- 根据控制台截图，FORM API 的启用是通过"文件密钥"开关控制的

### 又拍云控制台
- 登录又拍云控制台
- 进入 bucket 设置
- 找到"文件密钥"页面
- 查看或更换 FORM API 密钥

## 测试验证

### 1. 配置验证
- ✅ 检查 `UPYUN_FORM_API_SECRET` 环境变量
- ✅ 检查 `upyunService.isFormApiConfigured()` 返回 `true`
- ✅ 检查策略生成功能正常

### 2. 上传测试
- ✅ 测试单张照片上传
- ✅ 测试批量照片上传
- ✅ 验证不再出现 403 错误
- ✅ 验证回调成功，照片记录更新

### 3. 列表显示
- ✅ 验证占位符记录被过滤
- ✅ 验证只有上传成功的照片显示在列表中
- ✅ 验证照片 URL 正确生成

## 相关文件

- `backend/.env` - 环境变量配置
- `backend/storage/upyunService.js` - 又拍云服务
- `backend/controllers/storageController.js` - 存储控制器
- `backend/controllers/photoController.js` - 照片控制器

## 参考

- [又拍云 FORM API 文档](https://help.upyun.com/knowledge-base/form_api/)
- [占位符照片问题修复](./placeholder-photo-fix.md)
- [照片列表过滤修复](./photo-list-filter-fix.md)

