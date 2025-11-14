#!/usr/bin/env node
/**
 * PostgreSQL表结构迁移脚本（简化版）
 * 直接执行SQL文件中的语句
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
    
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error('未配置数据库连接');
    }
    
    console.log('📊 连接PostgreSQL数据库...');
    const db = pgp(connectionString);
    
    await db.one('SELECT NOW() as now');
    console.log('✅ 数据库连接成功\n');
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, '../database/migrate-to-postgresql-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log(`📄 读取SQL文件: ${sqlFile}\n`);
    
    // 移除注释和事务控制
    let cleanSql = sql
      .replace(/^\s*BEGIN\s*;/gim, '')
      .replace(/^\s*COMMIT\s*;/gim, '')
      .replace(/\\echo.*/gim, '')
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('--') && !trimmed.startsWith('===') && trimmed.length > 0;
      })
      .map(line => {
        // 移除行内注释
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex).trim();
        }
        return line.trim();
      })
      .filter(line => line.length > 0)
      .join('\n');
    
    // 按分号分割，但考虑多行语句
    const statements = [];
    let currentStatement = '';
    let inParens = 0;
    
    for (let i = 0; i < cleanSql.length; i++) {
      const char = cleanSql[i];
      const nextChar = cleanSql[i + 1];
      
      if (char === '(') {
        inParens++;
        currentStatement += char;
      } else if (char === ')') {
        inParens--;
        currentStatement += char;
      } else if (char === ';' && inParens === 0) {
        currentStatement += char;
        const trimmed = currentStatement.trim();
        if (trimmed.length > 5 && !trimmed.match(/^[\s-]*$/)) {
          statements.push(trimmed);
        }
        currentStatement = '';
      } else {
        currentStatement += char;
      }
    }
    
    // 添加最后一个语句（如果没有分号结尾）
    if (currentStatement.trim().length > 5) {
      statements.push(currentStatement.trim() + ';');
    }
    
    console.log(`📊 解析出 ${statements.length} 个SQL语句\n`);
    
    // 分离不同类型的语句
    const createTables = [];
    const createIndexes = [];
    const alterTables = [];
    
    for (const stmt of statements) {
      const upper = stmt.toUpperCase().replace(/\s+/g, ' ').trim();
      if (upper.match(/^CREATE\s+TABLE/)) {
        createTables.push(stmt);
      } else if (upper.match(/^CREATE\s+(?:UNIQUE\s+)?INDEX/)) {
        createIndexes.push(stmt);
      } else if (upper.match(/^ALTER\s+TABLE/)) {
        alterTables.push(stmt);
      }
    }
    
    console.log(`📋 分类: ${createTables.length} 个表, ${createIndexes.length} 个索引, ${alterTables.length} 个约束\n`);
    
    // 执行CREATE TABLE
    console.log('📋 创建表结构...');
    for (const stmt of createTables) {
      try {
        await db.none(stmt);
        const match = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
        const tableName = match ? match[1] : 'table';
        console.log(`   ✅ ${tableName}`);
      } catch (error) {
        if (error.code === '42P07' || error.code === '42710') {
          const match = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          const tableName = match ? match[1] : 'table';
          console.log(`   ⚠️  ${tableName} 已存在`);
        } else {
          console.error(`   ❌ 错误: ${error.message.substring(0, 80)}`);
          throw error;
        }
      }
    }
    console.log('');
    
    // 执行CREATE INDEX
    console.log('📋 创建索引...');
    let indexCount = 0;
    for (const stmt of createIndexes) {
      try {
        await db.none(stmt);
        indexCount++;
      } catch (error) {
        if (error.code === '42P07' || error.code === '42710') {
          // 已存在，忽略
        } else if (error.code === '42P01') {
          console.log(`   ⚠️  跳过（表不存在）`);
        } else {
          console.log(`   ⚠️  跳过: ${error.message.substring(0, 60)}...`);
        }
      }
    }
    console.log(`   ✅ 已创建/跳过 ${indexCount} 个索引\n`);
    
    // 执行ALTER TABLE
    if (alterTables.length > 0) {
      console.log('📋 添加约束...');
      for (const stmt of alterTables) {
        try {
          await db.none(stmt);
        } catch (error) {
          // 忽略约束已存在的错误
          if (error.code !== '42P07' && error.code !== '42710' && error.code !== '42P16') {
            console.log(`   ⚠️  跳过: ${error.message.substring(0, 60)}...`);
          }
        }
      }
      console.log('');
    }
    
    // 验证
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
    
    console.log('\n✅ PostgreSQL表结构迁移完成！\n');
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('\n错误详情:', error);
    process.exit(1);
  } finally {
    pgp.end();
  }
}

migrateSchema();



