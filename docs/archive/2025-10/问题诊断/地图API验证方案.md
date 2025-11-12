# 地图API验证方案 - CMT-20251028-002

## 验证目标
测试高德、阿里云、腾讯三家地图API对国内外坐标的反向地理编码能力

## 需要注册的账号

### 1. 高德开放平台
- 网址：https://lbs.amap.com/
- 注册后需要创建Key，选择"Web服务"类型
- 个人开发者免费额度：每天30万次调用

### 2. 阿里云地图服务
- 网址：https://www.alibabacloud.com/
- 地图服务在"产品与服务"中
- 需要实名认证
- 有免费额度

### 3. 腾讯位置服务
- 网址：https://lbs.qq.com/
- 注册后创建Key
- 选择"WebService API"类型
- 个人开发者有一定免费额度

## 需要的密钥格式
```
高德Key：xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
阿里云Key：LTAIxxxxxxxxxxxxxxxxxxxxxxxx
阿里云Secret：xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
腾讯Key：xxxxxxxxxxxxx
```

## 测试坐标样例

### 国内测试点
```javascript
// 深圳市南山区
{ lat: 22.5431, lng: 113.9344 }

// 北京市海淀区
{ lat: 39.9042, lng: 116.4074 }

// 上海市黄浦区
{ lat: 31.2304, lng: 121.4737 }
```

### 国外测试点
```javascript
// 纽约曼哈顿
{ lat: 40.7128, lng: -74.0060 }

// 东京
{ lat: 35.6762, lng: 139.6503 }

// 伦敦
{ lat: 51.5074, lng: -0.1278 }

// 巴黎
{ lat: 48.8566, lng: 2.3522 }
```

## 验证维度

### 1. 数据完整性
- 是否能返回5级字段（country/province/city/district/township）
- 每级是否有值还是空

### 2. 中文支持
- 国外城市是否有中文翻译
- 字段命名是否规范

### 3. 稳定性
- 响应速度
- 错误率
- 配额限制

### 4. 国外覆盖范围
- 能解析哪些国家
- 哪些国家解析失败

## 等待提供密钥

注册完成后，请提供以下信息：
```
高德Key: ___________
阿里云Key: ___________
阿里云Secret: ___________
腾讯Key: ___________
```

收到密钥后开始测试！

