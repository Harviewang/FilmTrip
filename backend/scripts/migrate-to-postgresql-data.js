#!/usr/bin/env node
/**
 * PostgreSQL数据迁移脚本
 * 从SQLite迁移数据到PostgreSQL
 * 
 * 使用方法:
 *   node scripts/migrate-to-postgresql-data.js
 * 
 * 环境变量:
 *   DATABASE_URL - PostgreSQL连接字符串
 *   SQLITE_DB_PATH - SQLite数据库路径（可选，默认: data/filmtrip.db）
 */

require('dotenv').config();
const betterSqlite3 = require('better-sqlite3');
const pgp = require('pg-promise')();
const path = require('path');

// 获取PostgreSQL连接字符串
const getPgConnectionString = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const database = process.env.DB_NAME || 'postgres';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

// 获取SQLite数据库路径
const getSqlitePath = () => {
  const sqlitePath = process.env.SQLITE_DB_PATH || 
    path.join(__dirname, '../data/filmtrip.db');
  return sqlitePath;
};

// 将SQLite的?占位符转换为PostgreSQL的$1, $2格式
const convertSqlPlaceholders = (sql) => {
  let paramIndex = 0;
  return sql.replace(/\?/g, () => {
    paramIndex++;
    return `$${paramIndex}`;
  });
};

// 迁移数据
async function migrateData() {
  const sqliteDb = null;
  const pgDb = null;
  
  try {
    console.log('🚀 开始PostgreSQL数据迁移...\n');
    
    // 连接SQLite数据库
    const sqlitePath = getSqlitePath();
    console.log(`📊 连接SQLite数据库: ${sqlitePath}`);
    
    if (!require('fs').existsSync(sqlitePath)) {
      throw new Error(`SQLite数据库文件不存在: ${sqlitePath}`);
    }
    
    const sqliteDb = betterSqlite3(sqlitePath);
    
    // 测试SQLite连接
    const sqliteTables = sqliteDb.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `).all();
    
    console.log(`✅ SQLite连接成功，找到 ${sqliteTables.length} 个表\n`);
    
    // 连接PostgreSQL数据库
    const pgConnectionString = getPgConnectionString();
    if (!pgConnectionString) {
      throw new Error('未配置PostgreSQL连接。请设置 DATABASE_URL 或 DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD');
    }
    
    console.log('📊 连接PostgreSQL数据库...');
    const pgDb = pgp(pgConnectionString);
    
    // 测试PostgreSQL连接
    await pgDb.one('SELECT NOW() as now');
    console.log('✅ PostgreSQL连接成功\n');
    
    // 迁移顺序（考虑外键依赖）
    const migrationOrder = [
      'users',
      'film_stocks',
      'cameras',
      'scanners',
      'film_rolls',
      'photos',
      'storage_actions',
      'storage_files',
      'storage_variant_errors'
    ];
    
    let totalMigrated = 0;
    
    // 不使用事务，每个表单独迁移（避免一个表失败影响其他表）
    for (const tableName of migrationOrder) {
      try {
          // 检查表是否存在
          const tableExists = sqliteTables.some(t => t.name === tableName);
          if (!tableExists) {
            console.log(`⚠️  表 ${tableName} 不存在于SQLite，跳过`);
            continue;
          }
          
          // 获取SQLite表的所有数据
          console.log(`\n📦 迁移表: ${tableName}`);
          const rows = sqliteDb.prepare(`SELECT * FROM ${tableName}`).all();
          
          if (rows.length === 0) {
            console.log(`   跳过: 表为空`);
            continue;
          }
          
          // 获取表结构（列名）
          const columns = Object.keys(rows[0]);
          const columnNames = columns.join(', ');
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          
          // 识别BOOLEAN列（PostgreSQL中的BOOLEAN类型）
          // SQLite中这些列是INTEGER（0或1），需要转换为PostgreSQL的BOOLEAN（true/false）
          const booleanColumns = new Set([
            'is_encrypted', 'is_private'
          ]);
          
          // 识别INTEGER列（需要处理空字符串和null）
          const integerColumns = new Set([
            'iso', 'photo_number', 'rating', 'width', 'height', 
            'orientation', 'rotation', 'is_protected', 'protection_level'
          ]);
          
          // 构建INSERT语句（使用ON CONFLICT DO NOTHING避免重复插入）
          const insertSql = `
            INSERT INTO ${tableName} (${columnNames})
            VALUES (${placeholders})
            ON CONFLICT (id) DO NOTHING
          `;
          
          let insertedCount = 0;
          let skippedCount = 0;
          
          // 批量插入数据
          for (const row of rows) {
            // 转换值：处理BOOLEAN和INTEGER类型转换
            const values = columns.map(col => {
              const value = row[col];
              
              // 如果是BOOLEAN列且值是数字，转换为布尔值
              if (booleanColumns.has(col) && (value === 0 || value === 1)) {
                return value === 1;
              }
              
              // 如果是INTEGER列，处理空字符串和null
              if (integerColumns.has(col)) {
                if (value === null || value === undefined || value === '') {
                  return null;
                }
                const numValue = parseInt(value);
                return isNaN(numValue) ? null : numValue;
              }
              
              return value;
            });
            
            try {
              const result = await pgDb.none(insertSql, values);
              insertedCount++;
            } catch (error) {
              // ON CONFLICT DO NOTHING会返回0行，这不算错误
              if (error.code === '23505') { // 唯一约束冲突
                skippedCount++;
              } else {
                throw error;
              }
            }
          }
          
          console.log(`   ✅ 成功: ${insertedCount} 条，跳过: ${skippedCount} 条`);
          totalMigrated += insertedCount;
          
        } catch (error) {
          console.error(`\n❌ 迁移表 ${tableName} 失败:`, error.message);
          // 继续迁移其他表
          continue;
        }
      }
    
    console.log(`\n✅ 数据迁移完成！共迁移 ${totalMigrated} 条记录\n`);
    
    // 验证迁移结果
    console.log('🔍 验证迁移结果...\n');
    
    for (const tableName of migrationOrder) {
      try {
        const sqliteCount = sqliteDb.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get()?.count || 0;
        const pgCount = await pgDb.one(`SELECT COUNT(*) as count FROM ${tableName}`);
        
        const match = sqliteCount === parseInt(pgCount.count);
        const status = match ? '✅' : '⚠️';
        console.log(`   ${status} ${tableName}: SQLite=${sqliteCount}, PostgreSQL=${pgCount.count}`);
        
        if (!match) {
          console.log(`      ⚠️  数量不匹配！`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${tableName}: 验证失败 - ${error.message}`);
      }
    }
    
    console.log('\n📊 迁移完成！\n');
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('\n错误详情:', error);
    process.exit(1);
  } finally {
    if (sqliteDb) {
      sqliteDb.close();
    }
    pgp.end();
  }
}

// 运行迁移
migrateData();

