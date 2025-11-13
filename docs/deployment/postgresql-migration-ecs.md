# ECS PostgreSQL迁移指南

## 📋 前置条件

- [ ] ECS服务器已安装PostgreSQL
- [ ] PostgreSQL服务已启动
- [ ] 已创建数据库和用户
- [ ] 网络连接正常（内网或公网）

---

## 🔧 配置PostgreSQL连接

### 步骤1：编辑 `.env` 文件

编辑 `backend/.env` 文件，添加PostgreSQL连接信息：

#### 方式1：使用DATABASE_URL（推荐）

```env
# ECS PostgreSQL连接（方式1）
DATABASE_URL=postgresql://用户名:密码@ECS主机:5432/数据库名

# 示例（ECS内网）:
DATABASE_URL=postgresql://postgres:mypassword@172.16.0.10:5432/filmtrip

# 示例（ECS公网）:
DATABASE_URL=postgresql://postgres:mypassword@123.456.789.0:5432/filmtrip

# 示例（带SSL）:
DATABASE_URL=postgresql://postgres:mypassword@123.456.789.0:5432/filmtrip?sslmode=require
```

#### 方式2：使用分项配置

```env
# ECS PostgreSQL连接（方式2）
DB_HOST=ECS主机地址
DB_PORT=5432
DB_NAME=数据库名
DB_USER=用户名
DB_PASSWORD=密码

# 示例:
DB_HOST=172.16.0.10
DB_PORT=5432
DB_NAME=filmtrip
DB_USER=postgres
DB_PASSWORD=mypassword
```

---

## 🚀 执行迁移

### 步骤1：备份SQLite数据库

```bash
cd backend
npm run backup-sqlite
```

### 步骤2：测试PostgreSQL连接

```bash
npm run test:pg
```

**预期输出**：
```
🔍 测试PostgreSQL连接...

✅ PostgreSQL连接成功！

✅ 数据库为空，可以开始迁移
```

### 步骤3：执行表结构迁移

```bash
npm run migrate:pg:schema
```

**预期输出**：
```
🚀 开始PostgreSQL表结构迁移...

📊 连接PostgreSQL数据库...
✅ 数据库连接成功

📝 执行表结构迁移...

✅ PostgreSQL表结构迁移完成！

✅ 已创建 9 个表:
   1. cameras
   2. film_rolls
   3. film_stocks
   4. photos
   5. scanners
   6. storage_actions
   7. storage_files
   8. storage_variant_errors
   9. users
```

### 步骤4：执行数据迁移

```bash
npm run migrate:pg:data
```

**预期输出**：
```
🚀 开始PostgreSQL数据迁移...

📊 连接SQLite数据库: /path/to/filmtrip.db
✅ SQLite连接成功，找到 11 个表

📊 连接PostgreSQL数据库...
✅ PostgreSQL连接成功

📦 迁移表: users
✅ 成功: 1 条，跳过: 0 条

📦 迁移表: photos
✅ 成功: 100 条，跳过: 0 条

...

✅ 数据迁移完成！共迁移 500 条记录

🔍 验证迁移结果...

   ✅ users: SQLite=1, PostgreSQL=1
   ✅ photos: SQLite=100, PostgreSQL=100
   ...
```

---

## ✅ 验证迁移

### 验证表结构

```bash
cd backend
node -e "
require('dotenv').config();
const db = require('./models/db-pg');
db.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name\")
  .then(tables => {
    console.log('✅ 已创建的表:');
    tables.forEach(t => console.log('   -', t.table_name));
  })
  .catch(err => console.error('❌ 错误:', err));
"
```

### 验证数据数量

```bash
cd backend
node -e "
require('dotenv').config();
const db = require('./models/db-pg');
Promise.all([
  db.query('SELECT COUNT(*) as count FROM photos'),
  db.query('SELECT COUNT(*) as count FROM film_rolls'),
  db.query('SELECT COUNT(*) as count FROM users')
]).then(results => {
  console.log('✅ 数据验证:');
  console.log('   照片:', results[0][0].count);
  console.log('   胶卷:', results[1][0].count);
  console.log('   用户:', results[2][0].count);
}).catch(err => console.error('❌ 错误:', err));
"
```

---

## 🔧 测试应用

### 切换为PostgreSQL模式

确保 `.env` 文件中已配置PostgreSQL连接信息，然后启动应用：

```bash
cd backend
npm run dev
```

应用会自动检测环境变量，如果配置了 `DATABASE_URL` 或 `DB_HOST`，会使用PostgreSQL。

### 切换回SQLite模式

移除PostgreSQL环境变量即可：

```bash
# 注释掉或删除 .env 中的 PostgreSQL 配置
# DATABASE_URL=...
# 或
# DB_HOST=...
```

---

## 🆘 常见问题

### 问题1：连接超时

**错误**：`Connection timeout` 或 `ECONNREFUSED`

**解决方案**：
1. 检查ECS主机地址是否正确
2. 检查PostgreSQL服务是否启动：`systemctl status postgresql`
3. 检查防火墙/安全组是否开放5432端口
4. 检查PostgreSQL配置文件 `postgresql.conf` 中的 `listen_addresses`
5. 检查 `pg_hba.conf` 中的访问控制规则

### 问题2：认证失败

**错误**：`password authentication failed` 或 `FATAL: password authentication failed`

**解决方案**：
1. 检查用户名和密码是否正确
2. 检查PostgreSQL用户是否存在：`\du` (在psql中)
3. 检查 `pg_hba.conf` 中的认证方式
4. 尝试重置密码：`ALTER USER postgres WITH PASSWORD 'newpassword';`

### 问题3：数据库不存在

**错误**：`database "filmtrip" does not exist`

**解决方案**：
1. 创建数据库：`CREATE DATABASE filmtrip;`
2. 或使用已存在的数据库名称

### 问题4：权限不足

**错误**：`permission denied` 或 `must be owner of database`

**解决方案**：
1. 使用具有足够权限的用户（如 `postgres` 超级用户）
2. 或授予用户权限：`GRANT ALL PRIVILEGES ON DATABASE filmtrip TO username;`

---

## 📝 ECS PostgreSQL配置检查清单

### 服务器端配置

- [ ] PostgreSQL已安装
- [ ] PostgreSQL服务已启动
- [ ] 已创建数据库
- [ ] 已创建用户并设置密码
- [ ] 已配置防火墙/安全组（开放5432端口）
- [ ] `postgresql.conf` 中的 `listen_addresses` 已配置
- [ ] `pg_hba.conf` 中的访问控制已配置

### 客户端配置

- [ ] `.env` 文件已配置连接信息
- [ ] 可以从本机访问ECS主机（内网或公网）
- [ ] 网络连接正常

---

## 🔗 相关文档

- [PostgreSQL迁移评估报告](./postgresql-migration-assessment.md)
- [快速开始指南](./postgresql-migration-quick-start.md)
- [PostgreSQL官方文档](https://www.postgresql.org/docs/)

---

**创建时间**：2025-11-13  
**最后更新**：2025-11-13

