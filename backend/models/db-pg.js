/**
 * PostgreSQL数据库连接层
 * 提供与SQLite兼容的API，方便迁移
 */

const pgp = require('pg-promise')();

// 连接字符串配置
const getConnectionString = () => {
  // 优先使用DATABASE_URL（Supabase等提供的完整连接字符串）
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // 或者使用分项配置
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const database = process.env.DB_NAME || 'postgres';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

// 创建数据库连接
const connectionString = getConnectionString();
const db = pgp(connectionString);

// 将SQLite的?占位符转换为PostgreSQL的$1, $2格式
const convertSqlPlaceholders = (sql) => {
  let paramIndex = 0;
  return sql.replace(/\?/g, () => {
    paramIndex++;
    return `$${paramIndex}`;
  });
};

// 导出数据库操作方法（兼容现有API）
const query = async (sql, params = []) => {
  try {
    const convertedSql = convertSqlPlaceholders(sql);
    return await db.any(convertedSql, params);
  } catch (error) {
    console.error('[PostgreSQL Query Error]:', error.message);
    console.error('[SQL]:', sql);
    console.error('[Params]:', params);
    throw error;
  }
};

const insert = async (sql, params = []) => {
  try {
    const convertedSql = convertSqlPlaceholders(sql);
    // INSERT语句需要返回插入的记录
    // PostgreSQL中，使用RETURNING *返回插入的记录
    let insertSql = convertedSql;
    if (!insertSql.toUpperCase().includes('RETURNING')) {
      // 如果没有RETURNING子句，尝试添加
      // 注意：对于简单的INSERT，这会返回所有列
      insertSql = insertSql.replace(/;?\s*$/, ' RETURNING *;');
    }
    return await db.one(insertSql, params);
  } catch (error) {
    console.error('[PostgreSQL Insert Error]:', error.message);
    console.error('[SQL]:', sql);
    console.error('[Params]:', params);
    throw error;
  }
};

const update = async (sql, params = []) => {
  try {
    const convertedSql = convertSqlPlaceholders(sql);
    // UPDATE语句返回影响的行数
    const result = await db.result(convertedSql, params);
    return {
      changes: result.rowCount,
      lastInsertRowid: null // PostgreSQL不返回lastInsertRowid
    };
  } catch (error) {
    console.error('[PostgreSQL Update Error]:', error.message);
    console.error('[SQL]:', sql);
    console.error('[Params]:', params);
    throw error;
  }
};

const deleteRecord = async (sql, params = []) => {
  try {
    const convertedSql = convertSqlPlaceholders(sql);
    // DELETE语句返回影响的行数
    const result = await db.result(convertedSql, params);
    return {
      changes: result.rowCount,
      lastInsertRowid: null
    };
  } catch (error) {
    console.error('[PostgreSQL Delete Error]:', error.message);
    console.error('[SQL]:', sql);
    console.error('[Params]:', params);
    throw error;
  }
};

// 数据库初始化（创建表结构）
const initialize = async () => {
  try {
    console.log('📊 开始初始化PostgreSQL数据库...');
    
    // 这里应该调用表结构迁移脚本
    // 暂时先检查连接
    await db.one('SELECT NOW() as now');
    console.log('✅ PostgreSQL数据库连接成功');
    
    console.log('⚠️  请运行迁移脚本创建表结构:');
    console.log('   npm run migrate:pg:schema');
    
  } catch (error) {
    console.error('❌ PostgreSQL数据库初始化失败:', error.message);
    throw error;
  }
};

// 测试连接
const testConnection = async () => {
  try {
    const result = await db.one('SELECT NOW() as now, version() as version');
    console.log('✅ PostgreSQL连接成功');
    console.log('   时间:', result.now);
    console.log('   版本:', result.version.split(',')[0]);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL连接失败:', error.message);
    return false;
  }
};

module.exports = {
  db,
  initialize,
  query,
  insert,
  update,
  delete: deleteRecord,
  testConnection
};

