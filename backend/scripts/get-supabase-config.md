# 获取Supabase连接信息

## 📋 步骤

### 1. 登录Supabase Dashboard
访问：https://app.supabase.com

### 2. 选择项目
在左侧项目列表中，选择您的项目（或创建新项目）

### 3. 获取连接字符串
- 点击左侧菜单 **Settings** → **Database**
- 找到 **Connection string** 部分
- 选择 **Connection pooling** 标签
- 复制连接字符串（格式类似）：
  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  ```

### 4. 或者使用URI方式
- 在 **Connection string** 中选择 **URI** 标签
- 复制URI（格式类似）：
  ```
  postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
  ```

## ⚠️ 注意事项

- **Connection pooling** 版本适合应用使用（推荐）
- **URI** 版本适合直接数据库访问
- 密码只显示一次，请妥善保存
- 连接字符串包含密码，请勿提交到Git

## 📝 配置方式

将连接字符串配置到 `backend/.env` 文件中：

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

或者分项配置：

```env
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.[project-ref]
DB_PASSWORD=[password]
```



