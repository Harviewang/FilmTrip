# MapTiler API 全球地址测试报告

## 测试目的
验证MapTiler API能否将全球坐标映射到4级结构（country/province/city/district）

## 测试结果汇总

### ✅ 能正常映射的地点（7个）

| 地点 | Country | Province | City | District | 问题 |
|------|---------|----------|------|----------|------|
| **深圳** | 中国 | 广东省 | 南山区 | ❌ 缺少 | 应该city=深圳市，district=南山区 |
| **北京** | 中国 | 北京市 | 东城区 | ❌ 缺少 | 应该city=北京市，district=东城区 |
| **纽约** | United States | New York | City of New York | ❌ 缺少 | 缺少Manhattan |
| **东京** | 日本 | ❌ 缺少 | 杉並区 | ❌ 缺少 | 缺少province（都），city层级混乱 |
| **伦敦** | United Kingdom | England | City of Westminster | ❌ 缺少 | city层级偏小 |
| **巴黎** | France | Île-de-France | Paris | ❌ 缺少 | 缺少arrondissement |
| **里约** | Brasil | Rio de Janeiro | Rio de Janeiro | ❌ 缺少 | 正常 |

### ⚠️ 部分缺失（2个）

| 地点 | Country | Province | City | District | 问题 |
|------|---------|----------|------|----------|------|
| **开普敦** | South Africa | Western Cape | ❌ 缺少 | ❌ 缺少 | 缺少city，只有municipality |
| **悉尼** | Australia | New South Wales | Sydney | ❌ 缺少 | 缺少district |

### ❌ 严重缺失（1个）

| 地点 | Country | Province | City | District | 问题 |
|------|---------|----------|------|----------|------|
| **新德里** | ❌ 缺少 | ❌ 缺少 | New Delhi | ❌ 缺少 | country字段解析失败 |

## 核心问题分析

### 1. **层级混乱**
- MapTiler的context数组没有统一的层级标准
- 不同国家的行政层级映射不一致
- designation字段不可靠（很多为空）

### 2. **中国特殊处理**
- 深圳：`joint_municipality`（南山区）被当作city，实际city应该是深圳市
- 北京：`joint_municipality`（东城区）被当作city，实际city应该是北京市
- 需要特殊处理中国的3级行政结构

### 3. **缺少District字段**
- 10个地点中，**0个**能正确获取district
- MapTiler主要返回：country, state/province, city, suburb/neighbourhood

### 4. **原始数据结构**

典型的MapTiler返回结构：
```json
{
  "country": "中国",
  "province": "广东省", 
  "city": "南山区",      // ❌ 实际应该是"深圳市"
  "district": "",        // ❌ 应该是"南山区"，但MapTiler没有单独提供
}
```

## 结论

### ✅ MapTiler可以用于：
1. **全球基础定位**：country、province、city基本可用
2. **国外地点**：美国、欧洲等地形结构相对标准
3. **作为高德的备选**：国外坐标时使用

### ❌ MapTiler不适合：
1. **精确的4级映射**：district字段几乎无法获取
2. **中国本土地点**：层级混乱，不如高德准确
3. **需要township字段**：MapTiler不提供街道级别信息

## 建议方案

### 方案A：简化4级结构
```
Country/Province/City + Formatted Address
```
- 放弃district字段
- 使用formatted_address作为详细地址
- 适用于全球通用

### 方案B：分层处理
```
国内：高德API（5级完整）
国外：MapTiler API（3级基础 + formatted_address）
```

## 测试代码
详见 `test-maptiler-global.js`

