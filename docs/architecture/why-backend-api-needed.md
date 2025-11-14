# 为什么需要后端API？为什么前端不能直接访问Supabase？

**创建日期**：2025-11-14  
**问题**：后端已经连接到Supabase，为什么前端还要通过Vercel后端API访问？

---

## 🔍 架构说明

### 当前架构（标准三层架构）

```
┌─────────────┐
│   前端      │  React应用（部署在Vercel）
│  (React)    │  用户界面、交互逻辑
└──────┬──────┘
       │ HTTP请求
       │ /api/photos, /api/filmStocks等
       ↓
┌─────────────┐
│   后端API   │  Node.js/Express（部署在Vercel Serverless Functions）
│  (Vercel)   │  业务逻辑、权限控制、数据验证
└──────┬──────┘
       │ SQL查询
       │ 使用DATABASE_URL连接
       ↓
┌─────────────┐
│  Supabase   │  PostgreSQL数据库
│  Database   │  数据存储
└─────────────┘
```

---

## ❓ 为什么前端不能直接访问Supabase？

### 原因1：安全风险 ⚠️

**问题**：
- Supabase数据库需要连接凭证（用户名、密码）
- 如果前端直接访问，这些凭证必须暴露在浏览器中
- 任何人都可以在浏览器开发者工具中看到这些凭证
- 攻击者可以直接访问数据库，删除或修改数据

**示例**：
```javascript
// ❌ 错误做法：前端直接访问数据库
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xxx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // ⚠️ 这个密钥会暴露在浏览器中！
)

// 任何人都可以在浏览器控制台看到这个密钥
// 然后直接访问数据库，删除所有数据！
```

**正确做法**：
```javascript
// ✅ 正确做法：前端通过后端API访问
fetch('https://api.filmtrip.imhw.top/api/photos')
  // 后端API使用环境变量中的DATABASE_URL（不会暴露给前端）
```

---

### 原因2：业务逻辑处理 🧠

**问题**：
- 数据处理、验证、格式化等逻辑应该在后端
- 前端只负责展示，不应该包含业务逻辑

**示例**：
```javascript
// ❌ 错误做法：前端处理业务逻辑
const photos = await supabase.from('photos').select('*')
// 前端需要处理：
// - 数据验证
// - 权限检查
// - 数据格式化
// - 业务规则
```

```javascript
// ✅ 正确做法：后端处理业务逻辑
const response = await fetch('/api/photos')
// 后端已经处理了：
// - 数据验证
// - 权限检查
// - 数据格式化
// - 业务规则
```

---

### 原因3：权限控制 🔐

**问题**：
- 不同用户应该看到不同的数据
- 前端直接访问数据库无法实现细粒度的权限控制

**示例**：
```javascript
// ❌ 错误做法：前端无法控制权限
const photos = await supabase.from('photos').select('*')
// 所有用户都能看到所有照片，包括私密照片！
```

```javascript
// ✅ 正确做法：后端控制权限
// 后端检查JWT token，只返回用户有权限查看的照片
const response = await fetch('/api/photos', {
  headers: { 'Authorization': `Bearer ${token}` }
})
// 后端根据用户身份返回不同的数据
```

---

### 原因4：性能优化 ⚡

**问题**：
- 前端直接访问数据库需要建立多个连接
- 后端可以连接池化，提高性能

**示例**：
```javascript
// ❌ 错误做法：每个用户都建立数据库连接
// 1000个用户 = 1000个数据库连接
// 数据库连接数有限，会导致性能问题
```

```javascript
// ✅ 正确做法：后端使用连接池
// 后端可以复用数据库连接
// 1000个用户 = 少量数据库连接（通过连接池）
```

---

## 📋 数据流程示例

### 用户查看照片列表

1. **前端发起请求**：
   ```javascript
   // 前端代码
   fetch('https://api.filmtrip.imhw.top/api/photos?page=1&limit=20', {
     headers: {
       'Authorization': `Bearer ${token}` // JWT token
     }
   })
   ```

2. **后端API接收请求**：
   ```javascript
   // 后端代码（backend/routes/photos.js）
   router.get('/', authenticateToken, async (req, res) => {
     // 1. 验证JWT token
     const user = req.user; // 从token中获取用户信息
     
     // 2. 检查权限
     if (!user) {
       return res.status(401).json({ error: '未授权' });
     }
     
     // 3. 构建SQL查询（根据用户权限）
     const query = user.isAdmin 
       ? 'SELECT * FROM photos WHERE deleted_at IS NULL'
       : 'SELECT * FROM photos WHERE deleted_at IS NULL AND is_private = false';
     
     // 4. 连接Supabase数据库
     const photos = await db.query(query);
     
     // 5. 处理数据（格式化、过滤等）
     const formattedPhotos = photos.map(photo => ({
       id: photo.id,
       title: photo.title,
       // ... 格式化数据
     }));
     
     // 6. 返回数据
     res.json({ success: true, photos: formattedPhotos });
   });
   ```

3. **Supabase数据库执行查询**：
   ```sql
   SELECT * FROM photos 
   WHERE deleted_at IS NULL 
   AND is_private = false
   LIMIT 20 OFFSET 0;
   ```

4. **返回数据给前端**：
   ```json
   {
     "success": true,
     "photos": [
       { "id": "1", "title": "照片1", ... },
       { "id": "2", "title": "照片2", ... }
     ]
   }
   ```

---

## 🔐 安全对比

### 前端直接访问Supabase（❌ 不安全）

```
前端
  ↓ 暴露数据库凭证
Supabase
  ↓ 任何人都可以访问
数据库被攻击
```

**风险**：
- ✅ 数据库凭证暴露在浏览器中
- ✅ 任何人都可以访问数据库
- ✅ 无法控制权限
- ✅ 无法验证用户身份
- ✅ 数据可能被删除或修改

### 前端通过后端API访问（✅ 安全）

```
前端
  ↓ 只发送JWT token（不包含数据库凭证）
后端API
  ↓ 使用环境变量中的DATABASE_URL（不暴露给前端）
Supabase
  ↓ 只有后端可以访问
数据库安全
```

**优势**：
- ✅ 数据库凭证只存在于后端环境变量中
- ✅ 只有后端可以访问数据库
- ✅ 可以控制权限（基于JWT token）
- ✅ 可以验证用户身份
- ✅ 数据安全

---

## 💡 总结

### 为什么需要后端API？

1. **安全**：保护数据库凭证，防止暴露
2. **权限**：控制用户访问权限
3. **逻辑**：处理业务逻辑和数据验证
4. **性能**：使用连接池，提高性能
5. **维护**：集中管理，易于维护

### 架构选择

**当前架构（推荐）**：
```
前端 → 后端API → Supabase数据库
```

**不推荐**：
```
前端 → Supabase数据库（直接访问）
```

---

## 📚 相关文档

- [系统架构图](../architecture/system-architecture.md)
- [后端API连接检查](../deployment/backend-api-connection-check.md)
- [环境策略](../deployment/environment-strategy.md)

---

**💡 提示**：当前架构是正确的。前端通过后端API访问数据，后端API连接Supabase数据库。这是标准的三层架构，符合安全最佳实践。

---

**最后更新**：2025-11-14  
**状态**：架构说明文档

