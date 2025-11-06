// 批量将已有坐标转换为国家/省/市/区/乡镇信息（重新解析所有坐标，更新为中文地址）
// 使用方法（需后端服务已启动，提供 /api/geocode/reverse）：
//   node backend/scripts/resolve-geo-from-coords.js [--force] [--limit=N]
//   
//   参数说明：
//   --force: 强制重新解析所有有坐标的照片（包括已有地址信息的）
//   --limit=N: 限制处理数量（默认不限制）

const http = require('http');
const { query, update } = require('../models/db');

// 检查参数
const args = process.argv.slice(2);
const force = args.includes('--force');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

function postReverse(lat, lon) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ latitude: lat, longitude: lon });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path: '/api/geocode/reverse',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 15000  // 增加到15秒超时
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json && json.success && json.data) return resolve(json.data);
            return resolve(null);
          } catch (e) {
            return reject(new Error(`解析响应失败: ${e.message}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    req.write(payload);
    req.end();
  });
}

// 检查是否是英文地址（简单判断：包含英文字母且不包含中文字符）
function isEnglishAddress(country, province, city) {
  const hasEnglish = /[a-zA-Z]/.test([country, province, city].filter(Boolean).join(' '));
  const hasChinese = /[\u4e00-\u9fa5]/.test([country, province, city].filter(Boolean).join(' '));
  return hasEnglish && !hasChinese;
}

async function main() {
  console.log('🔄 开始批量更新照片地理位置信息...');
  console.log(`参数: force=${force}, limit=${limit || '无限制'}`);
  
  // 构建查询条件
  let sql = `
    SELECT id, latitude, longitude, country, province, city 
    FROM photos 
    WHERE latitude IS NOT NULL 
      AND longitude IS NOT NULL
      AND latitude != 0 
      AND longitude != 0
      AND latitude BETWEEN -90 AND 90
      AND longitude BETWEEN -180 AND 180
  `;
  
  // 如果不是强制模式，只处理空地址或英文地址的照片
  if (!force) {
    sql += ` AND (
      country IS NULL OR country = '' OR 
      province IS NULL OR province = '' OR 
      city IS NULL OR city = ''
    )`;
  }
  
  sql += ` ORDER BY id`;
  
  if (limit) {
    sql += ` LIMIT ${limit}`;
  }
  
  const target = query(sql);
  console.log(`📸 找到 ${target.length} 张照片需要处理\n`);

  if (target.length === 0) {
    console.log('✅ 没有需要处理的照片');
    return;
  }

  let success = 0;
  let skipped = 0;
  let failed = 0;
  
  for (let i = 0; i < target.length; i++) {
    const row = target[i];
    const progress = `[${i + 1}/${target.length}]`;
    
    // 如果不是强制模式，检查是否需要更新（已有中文地址的跳过）
    if (!force && row.country && row.province && row.city) {
      if (!isEnglishAddress(row.country, row.province, row.city)) {
        console.log(`${progress} 跳过 ${row.id}（已有中文地址）`);
        skipped++;
        continue;
      }
    }
    
    try {
      console.log(`${progress} 处理照片 ${row.id} (${row.latitude.toFixed(6)}, ${row.longitude.toFixed(6)})...`);
      
      const r = await postReverse(row.latitude, row.longitude);
      
      if (r && (r.country || r.province || r.city)) {
        const result = update(
          `UPDATE photos 
           SET country = ?, province = ?, city = ?, district = ?, township = ? 
           WHERE id = ?`,
          [
            r.country || null,
            r.province || null,
            r.city || null,
            r.district || null,
            r.township || null,
            row.id
          ]
        );
        
        if (result.changes > 0) {
          console.log(`  ✅ 成功: ${r.country || ''} ${r.province || ''} ${r.city || ''}`);
          success++;
        } else {
          console.log(`  ⚠️  未更新: 可能是数据未变化`);
          skipped++;
        }
      } else {
        console.log(`  ⚠️  无法解析地址`);
        skipped++;
      }
      
      // API限速：每次请求间隔120ms（约8次/秒）
      if (i < target.length - 1) {
        await new Promise((res) => setTimeout(res, 120));
      }
    } catch (e) {
      console.log(`  ❌ 失败: ${e.message}`);
      failed++;
      
      // 错误后稍等再继续
      await new Promise((res) => setTimeout(res, 500));
    }
  }

  console.log(`\n📊 处理完成:`);
  console.log(`  ✅ 成功: ${success} 张`);
  console.log(`  ⏭️  跳过: ${skipped} 张`);
  console.log(`  ❌ 失败: ${failed} 张`);
  console.log(`\n💡 提示: 如需重新处理所有照片（包括已有地址的），请使用 --force 参数`);
}

main().catch(console.error);




