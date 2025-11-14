# Supabase 控制台导航指南

**创建日期**：2025-11-14  
**目的**：帮助快速找到 Supabase 控制台中的常用功能

---

## 🎯 常用功能位置速查

### 1. 重置数据库密码

**当前页面**：API Keys（API密钥管理）  
**目标位置**：Settings → Database → Database Password

**导航步骤**：
1. 在左侧菜单找到 **Settings**（设置）
2. 点击 **Settings**
3. 在Settings子菜单中找到 **Database**（数据库）
4. 点击 **Database**
5. 在Database页面找到 **Database Password**（数据库密码）部分
6. 点击 **Reset database password**（重置数据库密码）按钮

**页面路径**：
```
Dashboard → Settings → Database → Database Password → Reset database password
```

---

### 2. 获取数据库连接字符串

**目标位置**：Settings → Database → Connection string

**导航步骤**：
1. Settings → Database（同上）
2. 在Database页面找到 **Connection string**（连接字符串）部分
3. 选择 **URI** 标签获取直接连接字符串

**连接字符串格式**：
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

---

### 3. API Keys 管理（您当前所在页面）

**页面位置**：Settings → API → Legacy API Keys

**功能说明**：
- **anon/public**：前端使用的公开密钥
  - 用于浏览器端访问
  - 需要启用 Row Level Security (RLS)
  - 如果泄露，相对安全（但有 RLS 保护）
  
- **service_role/secret**：后端使用的密钥
  - 有完整管理员权限
  - 可以绕过 Row Level Security
  - ⚠️ **绝对不要泄露**
  - 如果泄露，立即重新生成

**当前页面操作**：
- 查看API密钥
- 复制API密钥
- 禁用Legacy API Keys（如果不再使用）

---

### 4. 查看数据库访问日志

**目标位置**：Logs → Database

**导航步骤**：
1. 在左侧菜单找到 **Logs**（日志）
2. 点击 **Logs**
3. 选择 **Database**（数据库日志）
4. 查看最近的访问记录

**用途**：
- 检查是否有异常访问
- 确认数据库连接状态
- 排查问题

---

## 📋 完整菜单结构参考

### 左侧菜单（典型结构）

```
Dashboard
├── Home（首页）
├── Table Editor（表编辑器）
├── SQL Editor（SQL编辑器）
├── Authentication（认证）
├── Storage（存储）
├── Edge Functions（边缘函数）
├── Realtime（实时）
├── Logs（日志）
│   ├── API Logs
│   ├── Database Logs ← 查看数据库访问日志
│   ├── Auth Logs
│   └── Postgres Logs
└── Settings（设置）
    ├── General（常规）
    ├── API ← API Keys在这里
    ├── Database ← 数据库密码重置在这里
    ├── Auth（认证设置）
    ├── Storage（存储设置）
    └── Billing（账单）
```

---

## 🎯 您当前的操作路径

### 场景：重置数据库密码

**当前位置**：Settings → API → Legacy API Keys  
**目标位置**：Settings → Database → Database Password

**操作步骤**：
1. 点击左侧菜单的 **Settings**
2. 在Settings子菜单中点击 **Database**（不是API）
3. 在Database页面找到 **Database Password**
4. 点击 **Reset database password**

---

## ⚠️ 重要提示

### API Keys vs Database Password

这是两个不同的概念：

1. **API Keys**（当前页面）：
   - 用于应用程序访问 Supabase API
   - 前端使用 `anon` key
   - 后端使用 `service_role` key
   - 用于认证和授权

2. **Database Password**（目标位置）：
   - 用于直接连接 PostgreSQL 数据库
   - 用于数据库连接字符串
   - 存储在 `DATABASE_URL` 环境变量中
   - 用于 `pg-promise`、`psql` 等工具连接数据库

---

## 🔍 快速定位技巧

### 如果找不到 Database Password 选项

1. **确认在正确的页面**：
   - ✅ Settings → Database
   - ❌ Settings → API（这是API Keys页面）

2. **检查页面标题**：
   - 应该显示 "Database Settings" 或 "Database"
   - 不是 "API Keys"

3. **查看页面内容**：
   - Database页面应该有：
     - Connection string
     - Database Password
     - Connection Pooling
     - Connection Parameters
   - API Keys页面会有：
     - Legacy API Keys
     - API Keys
     - JWT Settings

---

## 📸 页面识别

### Database Password 重置页面特征

在 **Settings → Database** 页面，您应该看到：

```
Database Settings
├── Connection string
│   ├── URI tab
│   ├── JDBC tab
│   └── Connection Pooling tab
├── Database Password
│   ├── Current password: [显示为点或隐藏]
│   └── [Reset database password] 按钮 ← 点击这里
├── Connection Pooling
└── Connection Parameters
```

### API Keys 页面特征（您当前所在）

```
API Keys
├── Legacy API Keys (tab) ← 您在这里
├── API Keys (tab)
├── anon/public key
│   ├── [Copy] 按钮
│   └── 使用说明
├── service_role/secret key
│   ├── [Copy] 按钮
│   └── ⚠️ 安全警告
└── Disable legacy API keys
```

---

## ✅ 验证清单

完成数据库密码重置后，请确认：

- [ ] ✅ 在 Settings → Database 页面找到 Database Password
- [ ] ✅ 点击了 "Reset database password" 按钮
- [ ] ✅ 新密码已保存到安全位置
- [ ] ✅ 已更新 Vercel 环境变量中的 `DATABASE_URL`
- [ ] ✅ 已更新本地 `backend/.env` 文件中的 `DATABASE_URL`
- [ ] ✅ 已重新部署 Vercel 项目
- [ ] ✅ 已测试数据库连接

---

**💡 提示**：如果仍然找不到，请告诉我您当前看到的具体菜单选项，我可以提供更精确的导航指引。

