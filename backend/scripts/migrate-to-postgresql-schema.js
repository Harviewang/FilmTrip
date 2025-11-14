#!/usr/bin/env node
/**
 * PostgreSQL表结构迁移脚本
 * 从SQLite迁移到PostgreSQL
 * 
 * 使用方法:
 *   node scripts/migrate-to-postgresql-schema.js
 * 
 * 环境变量:
 *   DATABASE_URL - PostgreSQL连接字符串
 *   或
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pgp = require('pg-promise')();

// 获取连接字符串
const getConnectionString = () => {
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

// 执行迁移
async function migrateSchema() {
  try {
    console.log('🚀 开始PostgreSQL表结构迁移...\n');
    
    // 检查连接字符串
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error('未配置数据库连接。请设置 DATABASE_URL 或 DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD');
    }
    
    console.log('📊 连接PostgreSQL数据库...');
    const db = pgp(connectionString);
    
    // 测试连接
    await db.one('SELECT NOW() as now');
    console.log('✅ 数据库连接成功\n');
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, '../database/migrate-to-postgresql-schema.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL文件不存在: ${sqlFile}`);
    }
    
    console.log(`📄 读取SQL文件: ${sqlFile}`);
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // 移除BEGIN/COMMIT事务控制（pg-promise会自动处理）
    const cleanSql = sql
      .replace(/^\s*BEGIN\s*;/gim, '')
      .replace(/^\s*COMMIT\s*;/gim, '')
      .replace(/\\echo.*/gim, '');
    
    console.log('📝 执行表结构迁移...\n');
    
    // 按语句分割执行（不使用事务，避免错误影响后续语句）
    let statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // 分离CREATE TABLE、CREATE INDEX和ALTER TABLE语句
    const createTables = [];
    const createIndexes = [];
    const alterTables = [];
    
    for (const statement of statements) {
      const upper = statement.toUpperCase().trim();
      if (upper.startsWith('CREATE TABLE')) {
        createTables.push(statement);
      } else if (upper.startsWith('CREATE INDEX') || upper.startsWith('CREATE UNIQUE INDEX')) {
        createIndexes.push(statement);
      } else if (upper.startsWith('ALTER TABLE')) {
        alterTables.push(statement);
      } else if (upper.length > 0) {
        // 其他语句（如注释等）忽略
      }
    }
    
    // 先执行所有CREATE TABLE（不使用事务）
    console.log('📋 创建表结构...');
    let tableCount = 0;
    for (const statement of createTables) {
      try {
        await db.none(statement);
        tableCount++;
        const tableName = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1] || 'table';
        console.log(`   ✅ ${tableName}`);
      } catch (error) {
        if (error.message.includes('already exists') || 
            error.code === '42P07' || // 表已存在
            error.code === '42710') { // 对象已存在
          const tableName = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1] || 'table';
          console.log(`   ⚠️  ${tableName} 已存在，跳过`);
        } else {
          console.error(`   ❌ 创建表失败: ${error.message}`);
          throw error;
        }
      }
    }
    console.log(`\n✅ 已创建/跳过 ${tableCount} 个表\n`);
    
    // 再执行所有CREATE INDEX（不使用事务）
    console.log('📋 创建索引...');
    let indexCount = 0;
    for (const statement of createIndexes) {
      try {
        await db.none(statement);
        indexCount++;
      } catch (error) {
        if (error.message.includes('already exists') || 
            error.code === '42P07' || // 索引已存在
            error.code === '42710') { // 对象已存在
          // 忽略已存在的索引
        } else if (error.code === '42P01') { // 关系不存在（表不存在）
          console.log(`   ⚠️  跳过索引（表不存在）: ${statement.substring(0, 60)}...`);
        } else {
          // 其他错误只记录，不中断
          console.log(`   ⚠️  索引创建失败（继续）: ${error.message.substring(0, 60)}...`);
        }
      }
    }
    console.log(`\n✅ 已创建/跳过 ${indexCount} 个索引\n`);
    
    // 最后执行ALTER TABLE（不使用事务）
    if (alterTables.length > 0) {
      console.log('📋 添加约束...');
      for (const statement of alterTables) {
        try {
          await db.none(statement);
        } catch (error) {
          if (error.message.includes('already exists') || 
              error.code === '42P07' || 
              error.code === '42710' ||
              error.message.includes('does not exist') ||
              error.code === '42P16') { // 约束已存在
            // 忽略已存在的约束
          } else {
            // 其他错误只记录，不中断
            console.log(`   ⚠️  约束添加失败（继续）: ${error.message.substring(0, 60)}...`);
          }
        }
      }
      console.log('');
    }
    
    console.log('\n✅ PostgreSQL表结构迁移完成！\n');
    
    // 验证表是否创建成功
    console.log('🔍 验证表结构...\n');
    const tables = await db.any(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`✅ 已创建 ${tables.length} 个表:\n`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });
    
    console.log('\n📊 迁移完成！\n');
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('\n错误详情:', error);
    process.exit(1);
  } finally {
    pgp.end();
  }
}

// 运行迁移
migrateSchema();

