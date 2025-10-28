# MapTiler地址解析最佳实践

## 背景

FilmTrip项目需要将全球坐标转换为5级地址结构（country/province/city/district/township），并要求国外地址翻译为中文。

## 方案选型

### 为什么选择MapTiler

**备选方案：**
1. 高德API ✅ 国内精确 ❌ 不支持国外
2. 腾讯API ✅ 国内可用 ❌ 不支持国外
3. MapTiler API ✅ 全球覆盖 ✅ 统一接口

**最终方案：统一使用MapTiler API**

- **全球覆盖**：支持国内外所有地点
- **统一接口**：无需判断国内/国外
- **返回code**：支持翻译映射（country_code）

## 核心实现

### 1. MapTiler返回的数据结构

```javascript
// API返回的context数组（倒序：从详细到宏观）
context: [
  { id: "country.214", text: "中国", country_code: "cn", designation: "country" },
  { id: "subregion.457", text: "广东省", country_code: "cn", designation: "state" },
  { id: "county.3556", text: "深圳市", country_code: "cn", designation: "city" },
  { id: "joint_municipality.10486", text: "南山区", country_code: "cn" },
  { id: "municipality.158530", text: "粤海街道", country_code: "cn", designation: "suburb" }
]
```

### 2. 层级映射逻辑

#### 中国多层结构（省/市/区/街道）
- `subregion` → province（省）
- `county` → city（市）
- `joint_municipality` → district（区）
- `municipality.suburb` → township（街道）

#### 中国直辖市结构（市/区/街道）
- `subregion` → province（市）
- `joint_municipality` → city（区）
- `municipality.suburb` → township（街道）

#### 国外结构（州/市/区）
- `region.state` → province（州/省）
- `joint_municipality` → city（市/区）
- `municipality.suburb` → district（区/街道）

### 3. 实现代码

```javascript
// 统一解析MapTiler返回的context
function parseMapTilerContext(context) {
  const tempData = {};
  
  context.forEach(item => {
    const text = item.text || '';
    const id = item.id || '';
    const designation = item.place_designation || '';
    
    // 按type存储
    if (id.includes('country.') || designation === 'country') {
      tempData.country = text;
    } else if (id.includes('region.') && designation === 'state') {
      tempData.province = text;
    } else if (id.includes('subregion.')) {
      if (!tempData.province) {
        tempData.province = text;
      }
    } else if (id.includes('county.') && designation === 'city' && !tempData.city) {
      tempData.city = text;
    } else if (id.includes('joint_municipality.')) {
      tempData.jointMunicipality = text;
    } else if (id.includes('municipality.') && designation === 'suburb') {
      tempData.township = text;
    }
  });
  
  // 判断层级结构
  let city, district;
  if (tempData.city && tempData.jointMunicipality) {
    // 深圳：county=深圳市, joint_municipality=南山区
    city = tempData.city;
    district = tempData.jointMunicipality;
  } else if (tempData.jointMunicipality && !tempData.city) {
    // 北京：subregion=北京市(province), joint_municipality=东城区(city)
    city = tempData.jointMunicipality;
  } else {
    city = tempData.city || '';
    district = tempData.jointMunicipality || '';
  }
  
  return { 
    country: tempData.country || '', 
    province: tempData.province || '', 
    city, 
    district, 
    township: tempData.township || '' 
  };
}
```

## 翻译实现

### 使用country_code进行翻译

MapTiler返回的`country_code`可用于自动翻译：

```javascript
// 获取country_code
let countryCode = '';
context.forEach(item => {
  if (item.country_code) {
    countryCode = item.country_code;
  }
});

// 翻译国外地址
if (countryCode && countryCode.toLowerCase() !== 'cn') {
  const countryTranslated = getCountryTranslation(countryCode.toLowerCase());
  if (countryTranslated) {
    country = countryTranslated;  // United States → 美国
  }
  
  if (province) {
    province = translateAddress(countryCode, province, 'province');
    // New York → 纽约州
  }
}
```

### 翻译映射表

维护国家/州/地区的翻译映射（见`geocode-translations.js`）：

- **30+国家**：us→美国, jp→日本, fr→法国等
- **美国50个州**：New York→纽约州, California→加利福尼亚州等
- **英国4个地区**：England→英格兰, Scotland→苏格兰等
- **日本都道府县**：東京都→东京都等
- **澳大利亚8个州**：New South Wales→新南威尔士州等

## 经验总结

### ✅ 成功经验

1. **统一接口优于混合方案**：避免国内/国外判断逻辑
2. **MapTiler的context数组信息丰富**：包含id、designation、country_code
3. **基于country_code的翻译**：简洁高效
4. **层级判断逻辑**：通过同时存在的字段判断结构

### ⚠️ 注意事项

1. **context顺序**：从详细到宏观（倒序）
2. **中国层级特殊**：需要区分多层结构（省/市/区）和直辖市结构（市/区）
3. **字段可能缺失**：district在国外地点经常为空
4. **designation字段不可靠**：很多情况下为空，需要结合id判断

### 🎯 关键代码位置

- **解析逻辑**：`backend/routes/geocode.js` → `parseMapTilerContext()`
- **翻译映射**：`backend/routes/geocode-translations.js`
- **API调用**：`backend/routes/geocode.js` → POST `/api/geocode/reverse`

## 测试用例

### 国内地址

**深圳（多层结构）**
```json
{
  "country": "中国",
  "province": "广东省",
  "city": "深圳市",
  "district": "南山区",
  "township": "粤海街道"
}
```

**北京（直辖市）**
```json
{
  "country": "中国",
  "province": "北京市",
  "city": "东城区",
  "township": "东华门街道"
}
```

### 国外地址（带翻译）

**纽约**
```json
{
  "country": "美国",          // 翻译
  "province": "纽约州",       // 翻译
  "city": "Manhattan",        // 保持原样
  "district": ""
}
```

**伦敦**
```json
{
  "country": "英国",          // 翻译
  "province": "英格兰",       // 翻译
  "city": "London",
  "district": ""
}
```

**东京**
```json
{
  "country": "日本",
  "province": "东京都",      // 翻译
  "city": "",
  "district": "杉並区",
  "township": "和泉二丁目"
}
```

## 扩展建议

1. **增加更多国家翻译**：按需补充地理区域
2. **城市级翻译**：可添加主要城市的翻译（如Paris→巴黎）
3. **District层级翻译**：可针对国外区/行政区的常见术语翻译
4. **缓存优化**：对相同坐标的解析结果可缓存

## 参考

- **MapTiler文档**：https://www.maptiler.com/api-documentation/
- **项目文件**：
  - `backend/routes/geocode.js`
  - `backend/routes/geocode-translations.js`
  - `test-maptiler-global.js`

