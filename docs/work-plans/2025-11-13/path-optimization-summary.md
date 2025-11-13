# 图片路径优化总结 - 减少信息泄露

## 日期
2025-11-13

## 优化目标
减少图片URL中泄露的信息，提高安全性。

## 优化前的问题

### 原路径格式
```
dev/WEB/a0/c7/86/03eff7e4-4075-4b33-a115-2e70e4433ea7.jpg
```

### 泄露的信息
1. **环境信息**：`dev`（开发环境）或 `prod`（生产环境）
2. **类型信息**：`WEB`（网页格式）或其他存储类型
3. **UUID**：完整的UUID泄露了内部标识符
4. **目录结构**：3级目录结构暴露了内部组织方式

### 潜在风险
- 攻击者可以通过路径推测系统架构
- 可能通过路径枚举访问其他文件
- UUID泄露可能导致隐私问题

## 优化后的方案

### 新路径格式（方案1：使用shortCode）
```
a7/b3c8f.jpg
```

### 新路径格式（方案2：使用hash）
```
a7/b3c8f9e2d1a4b5c6d7e8f9a0b1c2d3e4.jpg
```

### 优点
1. ✅ **隐藏环境信息**：不再暴露dev/prod
2. ✅ **隐藏类型信息**：不再暴露WEB/RAW等类型
3. ✅ **隐藏UUID**：使用shortCode或hash替代
4. ✅ **简化目录结构**：只保留2级目录（避免单目录文件过多）
5. ✅ **保留可读性**：使用shortCode时，文件名仍然简短易读

## 实现细节

### 1. 路径生成逻辑（`backend/storage/namingService.js`）

```javascript
const generateObjectPath = ({ variant = 'WEB', extension = '', shortCode = null } = {}) => {
  // 如果提供了shortCode，使用shortCode作为文件名
  if (shortCode) {
    const prefix = shortCode.slice(0, 2); // 前2个字符作为目录前缀
    const objectPath = `${prefix}/${shortCode}${ext}`;
    return { shortCode, objectPath, ... };
  }
  
  // 否则使用UUID生成hash路径
  const uuid = uuidv4();
  const hash = crypto.createHash('sha256').update(uuid).digest('hex');
  const prefix = hash.slice(0, 2); // 前2个字符作为目录前缀
  const fileName = hash.slice(0, 32); // 前32个字符作为文件名
  const objectPath = `${prefix}/${fileName}${ext}`;
  return { uuid, objectPath, ... };
};
```

### 2. 上传流程（`backend/controllers/storageController.js`）

```javascript
// 先创建照片占位符，获取shortCode
photoRecord = await createPhotoPlaceholder({ ... });

// 使用shortCode生成路径（减少信息泄露）
saveKey = buildSaveKey({ 
  variant: normalizedVariant, 
  extension, 
  shortCode: photoRecord.short_code 
});

// 更新照片记录的origin_path
update(`UPDATE photos SET origin_bucket = ?, origin_path = ? WHERE id = ?`, 
  [bucket, saveKey, photoRecord.id]);
```

## 对比示例

### 优化前
```
https://img.filmtrip.cn/dev/WEB/a0/c7/86/03eff7e4-4075-4b33-a115-2e70e4433ea7.jpg!thumb
```
**泄露信息**：环境（dev）、类型（WEB）、UUID（03eff7e4-...）、目录结构

### 优化后（使用shortCode）
```
https://img.filmtrip.cn/a7/b3c8f.jpg!thumb
```
**泄露信息**：无（shortCode是随机生成的，无法推断任何信息）

### 优化后（使用hash）
```
https://img.filmtrip.cn/a7/b3c8f9e2d1a4b5c6d7e8f9a0b1c2d3e4.jpg!thumb
```
**泄露信息**：无（hash是单向的，无法推断原始信息）

## 安全性提升

### 1. 路径枚举攻击
- **优化前**：攻击者可以尝试枚举 `dev/WEB/...`、`prod/WEB/...` 等路径
- **优化后**：攻击者无法推断路径规律，只能随机猜测

### 2. 信息泄露
- **优化前**：UUID、环境、类型等信息暴露在URL中
- **优化后**：URL中只包含无意义的标识符

### 3. 隐私保护
- **优化前**：UUID可能泄露内部数据库ID
- **优化后**：shortCode是独立的标识符，无法直接映射到数据库ID

## 向后兼容

### 保留旧版路径生成（`generateObjectPathLegacy`）
为了向后兼容，保留了旧版路径生成函数：
```javascript
const generateObjectPathLegacy = ({ variant = 'WEB', extension = '' } = {}) => {
  // 旧版路径格式: {env}/{variant}/{segments}/{uuid}.{ext}
};
```

### 迁移策略
- 新上传的照片使用新路径格式
- 已有照片保持旧路径格式不变
- 系统同时支持两种路径格式

## 相关文件

### 修改的文件
- `backend/storage/namingService.js` - 路径生成逻辑
- `backend/controllers/storageController.js` - 上传流程

### 新增的文件
- `setup-aliyun-cdn-dns.js` - 阿里云DNS配置脚本

## 后续工作

1. ✅ 路径生成逻辑已优化
2. ✅ 上传流程已更新
3. ⏳ 测试新路径格式的上传和显示
4. ⏳ 配置阿里云DNS（img.filmtrip.cn）
5. ⏳ 在生产环境验证新路径格式

## 总结

通过优化图片路径生成逻辑，我们：
- ✅ 减少了URL中的信息泄露
- ✅ 提高了系统安全性
- ✅ 保持了路径的可读性（使用shortCode时）
- ✅ 保持了向后兼容性

**新上传的照片**将自动使用新的简化路径格式，**已有照片**保持原有路径不变。

