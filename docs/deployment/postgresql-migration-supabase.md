# Supabase PostgreSQL迁移指南

## 📋 数据库策略

- **本地开发环境**：使用Supabase PostgreSQL
- **Vercel测试环境**：使用Supabase PostgreSQL
- **生产环境**：根据性能测试决定使用Supabase或ECS PostgreSQL

---

## 🚀 快速开始

### 步骤1：获取Supabase连接信息

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目（或创建新项目）
3. 进入 **Settings** → **Database**
4. 找到 **Connection string** → **Connection pooling**
5. 复制连接字符串

连接字符串格式：
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 步骤2：配置本地环境

编辑 `backend/.env` 文件，添加：

```env
# Supabase PostgreSQL连接（本地开发环境）
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 步骤3：执行迁移

```bash
cd backend

# 1. 测试连接
npm run test:pg

# 2. 备份SQLite数据库
npm run backup-sqlite

# 3. 表结构迁移
npm run migrate:pg:schema

# 4. 数据迁移
npm run migrate:pg:data
```

---

## 🌐 配置Vercel测试环境

### 在Vercel项目中添加环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目（backend项目）
3. 进入 **Settings** → **Environment Variables**
4. 添加环境变量：
   - **Name**: `DATABASE_URL`
   - **Value**: Supabase连接字符串（与本地相同）
   - **Environment**: Production, Preview, Development（全部勾选）

### 重新部署

添加环境变量后，Vercel会自动重新部署，应用将使用Supabase PostgreSQL。

---

## 🏭 生产环境配置

### 方案A：使用Supabase（推荐用于测试）

如果Supabase性能满足需求，继续使用Supabase：

1. 在Vercel生产环境配置相同的 `DATABASE_URL`
2. 监控性能指标
3. 如性能不足，切换到ECS PostgreSQL

### 方案B：使用ECS PostgreSQL

如果Supabase性能不足，切换到ECS PostgreSQL：

1. 在Vercel生产环境配置ECS PostgreSQL连接字符串：
   ```env
   DATABASE_URL=postgresql://user:password@ecs-host:5432/database
   ```

2. 执行生产环境数据迁移：
   ```bash
   # 从Supabase迁移到ECS PostgreSQL
   npm run migrate:pg:data
   ```

---

## ✅ 验证迁移

### 本地验证

```bash
cd backend
npm run test:pg
```

### 验证数据

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

## 📊 性能对比

### Supabase优势
- ✅ 免费额度充足（500MB）
- ✅ 自动备份和恢复
- ✅ 无需管理服务器
- ✅ 全球CDN加速

### ECS PostgreSQL优势
- ✅ 完全控制
- ✅ 不受共享资源影响
- ✅ 可以优化配置
- ✅ 数据完全在本地

### 性能测试建议

1. **测试查询性能**
   - 比较响应时间
   - 比较并发性能
   - 比较复杂查询性能

2. **测试数据量**
   - 小数据量（<100MB）：Supabase通常足够
   - 中等数据量（100MB-500MB）：根据测试结果决定
   - 大数据量（>500MB）：可能需要ECS PostgreSQL

---

## 🔄 切换数据库

### 从Supabase切换到ECS PostgreSQL

1. 备份Supabase数据：
   ```bash
   # 使用pg_dump导出
   pg_dump $SUPABASE_DATABASE_URL > supabase_backup.sql
   ```

2. 配置ECS PostgreSQL：
   ```env
   DATABASE_URL=postgresql://user:password@ecs-host:5432/database
   ```

3. 导入数据：
   ```bash
   psql $ECS_DATABASE_URL < supabase_backup.sql
   ```

### 从ECS PostgreSQL切换回Supabase

1. 备份ECS数据：
   ```bash
   pg_dump $ECS_DATABASE_URL > ecs_backup.sql
   ```

2. 配置Supabase：
   ```env
   DATABASE_URL=$SUPABASE_DATABASE_URL
   ```

3. 导入数据：
   ```bash
   psql $SUPABASE_DATABASE_URL < ecs_backup.sql
   ```

---

## 📝 环境变量配置

### 本地开发（.env）

```env
# 开发环境使用Supabase
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
NODE_ENV=development
```

### Vercel测试环境

在Vercel Dashboard配置：
- **DATABASE_URL**: Supabase连接字符串
- **Environment**: Preview, Development

### Vercel生产环境

根据性能测试结果选择：
- **选项1**（Supabase）：使用相同的Supabase连接字符串
- **选项2**（ECS）：使用ECS PostgreSQL连接字符串

---

## 🆘 常见问题

### 问题1：连接池连接数限制

**症状**：Supabase免费版有连接数限制

**解决**：
- 使用Connection pooling版本（已配置）
- 监控连接数使用情况
- 如超过限制，考虑升级到Pro版或使用ECS PostgreSQL

### 问题2：查询性能慢

**症状**：某些查询响应时间较长

**解决**：
1. 检查索引是否创建
2. 优化查询语句
3. 使用EXPLAIN分析查询计划
4. 如持续慢，考虑切换到ECS PostgreSQL

### 问题3：数据同步问题

**症状**：本地和测试环境数据不一致

**解决**：
- 使用不同的Supabase项目（本地、测试、生产）
- 或使用同一个Supabase项目，但注意数据隔离

---

## 🔗 相关文档

- [PostgreSQL迁移评估报告](./postgresql-migration-assessment.md)
- [快速开始指南](./postgresql-migration-quick-start.md)
- [ECS迁移指南](./postgresql-migration-ecs.md)
- [Supabase文档](https://supabase.com/docs)

---

**创建时间**：2025-11-13  
**最后更新**：2025-11-13



