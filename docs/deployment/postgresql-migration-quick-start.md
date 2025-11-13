# PostgreSQL迁移快速开始指南

## 📋 前置条件

- [ ] Node.js 已安装
- [ ] SQLite数据库已备份
- [ ] Supabase项目已创建
- [ ] PostgreSQL连接信息已获取

---

## 🚀 快速开始（5步）

### 步骤1：安装依赖

```bash
cd backend
npm install
```

### 步骤2：备份SQLite数据库

```bash
npm run backup-sqlite
```

备份文件保存在：`backend/data/backups/filmtrip.db.backup-YYYYMMDD-HHMMSS`

### 步骤3：配置PostgreSQL连接

编辑 `backend/.env` 文件：

```env
# 方式1: 使用DATABASE_URL（推荐，Supabase提供）
DATABASE_URL=postgresql://postgres:[password]@[host].supabase.co:5432/postgres

# 方式2: 使用分项配置
DB_HOST=[host].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[password]
```

⚠️ **重要**：请将 `[password]` 和 `[host]` 替换为实际的Supabase连接信息。

### 步骤4：执行表结构迁移

```bash
npm run migrate:pg:schema
```

这将在PostgreSQL中创建所有表结构。

### 步骤5：执行数据迁移

```bash
npm run migrate:pg:data
```

这将把SQLite中的所有数据迁移到PostgreSQL。

---

## ✅ 验证迁移

### 验证表结构

```bash
cd backend
node -e "
require('dotenv').config();
const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL);
db.any(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name\")
  .then(tables => {
    console.log('✅ 已创建的表:');
    tables.forEach(t => console.log('   -', t.table_name));
  })
  .finally(() => pgp.end());
"
```

### 验证数据

```bash
cd backend
node -e "
require('dotenv').config();
const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL);
db.one('SELECT COUNT(*) as count FROM photos')
  .then(result => console.log('✅ 照片数量:', result.count))
  .finally(() => pgp.end());
"
```

---

## 🔧 测试应用

### 临时使用PostgreSQL（测试）

```bash
cd backend
# 设置环境变量
export DATABASE_URL=postgresql://postgres:[password]@[host].supabase.co:5432/postgres
# 启动服务器
npm run dev
```

### 切换回SQLite

```bash
cd backend
# 移除PostgreSQL环境变量
unset DATABASE_URL
unset DB_HOST
# 启动服务器
npm run dev
```

---

## 📝 迁移清单

### 迁移前

- [ ] 备份SQLite数据库
- [ ] 创建Supabase项目
- [ ] 获取PostgreSQL连接信息
- [ ] 配置 `.env` 文件

### 迁移中

- [ ] 执行表结构迁移
- [ ] 执行数据迁移
- [ ] 验证表数量
- [ ] 验证数据数量

### 迁移后

- [ ] 测试应用功能
- [ ] 验证查询性能
- [ ] 检查错误日志
- [ ] 更新部署配置

---

## 🆘 常见问题

### 问题1：连接失败

**错误**：`connection refused` 或 `authentication failed`

**解决**：
1. 检查 `DATABASE_URL` 或 `DB_*` 环境变量是否正确
2. 确认Supabase项目已启动
3. 检查防火墙/网络连接

### 问题2：表已存在

**错误**：`relation "users" already exists`

**解决**：
- 这是正常的，脚本会跳过已存在的表
- 如果表结构需要更新，请手动执行 `ALTER TABLE` 语句

### 问题3：数据不匹配

**错误**：验证时发现数量不匹配

**解决**：
1. 检查是否有唯一约束冲突
2. 查看迁移日志中的错误信息
3. 手动修复数据后重新运行迁移

---

## 📚 相关文档

- [PostgreSQL迁移评估报告](./postgresql-migration-assessment.md)
- [Supabase文档](https://supabase.com/docs)
- [pg-promise文档](https://github.com/vitaly-t/pg-promise)

---

**创建时间**：2025-11-13  
**最后更新**：2025-11-13

