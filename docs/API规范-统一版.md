# API规范-统一版

**创建日期**：2025-10-24  
**版本**：v1.0.0  
**适用范围**：FilmTrip项目所有API接口

## 📋 规范概述

本文档定义了FilmTrip项目所有API接口的统一返回格式规范，旨在解决接口格式不一致、`data.data`反模式等问题。

## 🎯 核心原则

1. **避免 `data.data` 反模式**：禁止使用嵌套的data字段
2. **语义明确**：字段名具有明确的业务含义
3. **格式统一**：所有API使用相同的返回结构
4. **向后兼容**：保持现有功能不受影响

## 📊 标准返回格式

### 基础格式
```javascript
{
  success: boolean,        // 请求是否成功
  message?: string,        // 可选的错误信息或成功提示
  data?: any,             // 业务数据（可选）
  pagination?: {          // 分页信息（可选）
    page: number,         // 当前页码
    limit: number,        // 每页数量
    total: number,        // 总数量
    pages: number         // 总页数
  }
}
```

### 成功响应示例

**1. 列表数据（带分页）**
```javascript
// GET /api/filmStocks
{
  "success": true,
  "filmStocks": [
    {
      "id": "uuid",
      "brand": "Kodak",
      "series": "Portra",
      "iso": 400,
      "format": "135",
      "type": "color"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

**2. 单个数据**
```javascript
// GET /api/filmStocks/:id
{
  "success": true,
  "filmStock": {
    "id": "uuid",
    "brand": "Kodak",
    "series": "Portra",
    "iso": 400,
    "format": "135",
    "type": "color"
  }
}
```

**3. 操作结果**
```javascript
// POST /api/filmStocks
{
  "success": true,
  "message": "胶卷品类创建成功",
  "filmStock": {
    "id": "uuid",
    "brand": "Kodak",
    "series": "Portra"
  }
}
```

### 错误响应示例

**1. 业务错误**
```javascript
{
  "success": false,
  "message": "胶卷品类已存在",
  "code": "DUPLICATE_STOCK"
}
```

**2. 验证错误**
```javascript
{
  "success": false,
  "message": "参数验证失败",
  "errors": [
    {
      "field": "brand",
      "message": "品牌不能为空"
    }
  ]
}
```

## 🔧 字段命名规范

### 数据字段命名
- **列表数据**：使用复数形式，如 `filmStocks`、`photos`、`cameras`
- **单个数据**：使用单数形式，如 `filmStock`、`photo`、`camera`
- **分页信息**：统一使用 `pagination`
- **错误信息**：统一使用 `message`

### 避免的反模式
❌ **禁止使用**：
```javascript
{
  "success": true,
  "data": {
    "data": [...],           // 嵌套data字段
    "pagination": {...}
  }
}
```

✅ **推荐使用**：
```javascript
{
  "success": true,
  "filmStocks": [...],       // 直接使用业务字段名
  "pagination": {...}
}
```

## 📝 接口分类规范

### 1. 列表接口
- **路径**：`GET /api/{resource}`
- **返回**：`{resource}s` + `pagination`
- **示例**：`GET /api/filmStocks` → `filmStocks` + `pagination`

### 2. 详情接口
- **路径**：`GET /api/{resource}/:id`
- **返回**：`{resource}`
- **示例**：`GET /api/filmStocks/:id` → `filmStock`

### 3. 创建接口
- **路径**：`POST /api/{resource}`
- **返回**：`{resource}` + `message`
- **示例**：`POST /api/filmStocks` → `filmStock` + `message`

### 4. 更新接口
- **路径**：`PUT /api/{resource}/:id`
- **返回**：`{resource}` + `message`
- **示例**：`PUT /api/filmStocks/:id` → `filmStock` + `message`

### 5. 删除接口
- **路径**：`DELETE /api/{resource}/:id`
- **返回**：`message`
- **示例**：`DELETE /api/filmStocks/:id` → `message`

## 🛠️ 实施指南

### 后端修改步骤
1. 修改控制器返回格式
2. 确保所有接口遵循统一格式
3. 添加错误处理
4. 更新API文档

### 前端修改步骤
1. 更新API调用代码
2. 统一数据处理逻辑
3. 添加错误处理
4. 更新TypeScript类型定义

### 测试验证
1. 单元测试：验证返回格式
2. 集成测试：验证前后端交互
3. 手动测试：验证所有功能正常

## 📚 相关文档

- [后端API实现指南](./backend-api-guide.md)
- [前端API调用指南](./frontend-api-guide.md)
- [错误处理规范](./error-handling-guide.md)

## 🔄 版本历史

- **v1.0.0** (2025-10-24)：初始版本，解决`data.data`反模式问题

---

**重要提醒**：本规范为强制性规范，所有新开发的API必须遵循此格式，现有API需要逐步迁移到新格式。
