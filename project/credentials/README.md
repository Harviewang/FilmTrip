# FilmTrip 项目密钥管理

> ⚠️ **重要安全提示**: 此目录包含项目的所有敏感密钥信息，请务必妥善保管！

## 📁 文件说明

```
project/credentials/
├── README.md           # 本文档
├── secrets.conf        # 主密钥配置文件（包含所有服务的密钥）
├── load-secrets.sh     # 密钥加载脚本（将密钥加载到环境变量）
└── .gitignore          # Git忽略配置（确保不会被提交）
```

## 🔐 包含的服务密钥

### 云服务商
- **阿里云**: DNS、ECS、OSS、域名管理
- **Vercel**: 前后端部署
- **又拍云**: CDN加速、对象存储
- **Cloudflare**: CDN、DNS、安全防护
- **腾讯云**: COS存储、CDN
- **七牛云**: 对象存储、CDN

### 第三方服务
- **GitHub**: CI/CD、自动部署
- **邮件服务**: SMTP、SendGrid
- **短信服务**: 阿里云短信
- **支付**: 微信支付、支付宝
- **地图API**: 高德、Mapbox、Google Maps
- **第三方登录**: 微信、GitHub
- **监控**: Sentry、阿里云日志服务

### 应用密钥
- JWT密钥
- 数据库连接
- Session密钥
- 加密密钥

## 📝 使用方法

### 1. 加载密钥到环境变量

```bash
# 在项目根目录执行
source project/credentials/load-secrets.sh

# 或者
. project/credentials/load-secrets.sh
```

### 2. 在脚本中使用

```bash
# 示例: 使用阿里云DNS配置
ALIYUN_ACCESS_KEY_ID=$ALIYUN_ACCESS_KEY_ID \
ALIYUN_ACCESS_KEY_SECRET=$ALIYUN_ACCESS_KEY_SECRET \
node setup-aliyun-dns.js
```

### 3. Node.js中读取

```javascript
// 方式1: 使用dotenv
require('dotenv').config({ path: 'project/credentials/secrets.conf' });

// 方式2: 直接读取环境变量
const config = {
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET
};
```

## 🛡️ 安全规范

### ✅ 必须遵守

1. **永远不要提交到Git**
   - 已添加到`.gitignore`
   - 使用前检查`git status`

2. **定期轮换密钥**
   - 建议每3-6个月更换一次
   - 发生泄露立即更换

3. **最小权限原则**
   - 使用RAM子账号
   - 只授予必要的权限
   - 不同环境使用不同密钥

4. **启用多因素认证(MFA)**
   - 云服务账号启用MFA
   - API密钥设置IP白名单

5. **监控API使用**
   - 定期检查API调用日志
   - 设置异常告警

### ❌ 禁止操作

1. 不要通过聊天工具发送密钥
2. 不要截图包含密钥的内容
3. 不要在公共网络环境下使用
4. 不要保存在云笔记或在线文档
5. 不要在代码中硬编码密钥

## 📋 密钥获取指南

### 阿里云
1. 登录 https://ram.console.aliyun.com/users
2. 创建RAM用户
3. 授予必要权限: `AliyunDNSFullAccess`, `AliyunECSReadOnlyAccess`
4. 创建AccessKey

### Vercel
1. 登录 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 设置权限和过期时间
4. 复制Token保存

### Cloudflare
1. 登录 https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token"
3. 选择模板或自定义权限
4. 保存Token

### 又拍云
1. 登录 https://console.upyun.com/
2. 账户管理 → 操作员管理
3. 创建操作员并设置权限
4. 保存账号密码

## 🔧 维护记录

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-10-24 | 创建 | 初始化密钥管理系统，添加阿里云密钥 |
| | | |

## 🆘 密钥泄露应急处理

如果密钥不慎泄露，请立即执行以下步骤：

1. **立即停用密钥**
   - 登录对应服务商控制台
   - 删除或禁用泄露的密钥

2. **创建新密钥**
   - 生成新的密钥对
   - 更新`secrets.conf`文件
   - 重新部署相关服务

3. **检查影响**
   - 查看API调用日志
   - 检查是否有异常操作
   - 评估损失

4. **通知相关人员**
   - 通知团队成员
   - 必要时报告管理层

5. **事后总结**
   - 分析泄露原因
   - 改进安全措施
   - 更新操作规范

## 📞 联系方式

- 负责人: Harview
- 紧急联系: 通过项目渠道联系

---

**最后更新**: 2025-10-24  
**维护人员**: Harview  
**文档版本**: v1.0

