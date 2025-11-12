#!/usr/bin/env node
const { db } = require('../models/db');

const TYPE_MAPPINGS = {
  'color-negative': ['彩色负片', '彩负', 'color-negative', 'color negative', 'colour negative', 'CN', 'cn'],
  'color-positive': ['彩色正片', '彩正', '反转片', 'slide', 'color slide', 'color-positive', 'color positive', 'colour positive', 'SL', 'sl'],
  'black-white-negative': ['黑白负片', '黑白', '黑白胶片', '黑白底片', 'black-and-white-negative', 'black white negative', 'BW', 'bw'],
  'black-white-positive': ['黑白正片', '黑白反转', 'black-and-white-positive', 'black white positive', 'BP', 'bp']
};

let totalChanges = 0;
for (const [code, aliases] of Object.entries(TYPE_MAPPINGS)) {
  const stmt = db.prepare(
    `UPDATE film_stocks SET type = ? WHERE LOWER(type) IN (${aliases.map(() => '?').join(', ')})`
  );
  const changes = stmt.run(code, ...aliases.map((alias) => alias.toLowerCase())).changes;
  if (changes > 0) {
    console.log(`✅ 已更新 ${changes} 条记录为 ${code}`);
    totalChanges += changes;
  }
}

console.log(`\n🎯 类型字段规范化完成，共更新 ${totalChanges} 条记录。`);
process.exit(0);
