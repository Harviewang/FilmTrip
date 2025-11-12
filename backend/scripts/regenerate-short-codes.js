#!/usr/bin/env node

const { db } = require('../models/db');
const { generateShortCode, SHORT_CODE_LENGTH } = require('../storage/namingService');

const selectStmt = db.prepare(`
  SELECT id FROM photos
  WHERE short_code IS NULL OR LENGTH(short_code) != ?
`);

const checkExists = db.prepare('SELECT 1 FROM photos WHERE short_code = ? LIMIT 1');
const updateStmt = db.prepare('UPDATE photos SET short_code = ? WHERE id = ?');

(async () => {
  const targets = selectStmt.all(SHORT_CODE_LENGTH);
  if (!targets.length) {
    console.log('无需更新，所有短链均符合长度要求');
    process.exit(0);
  }

  let updated = 0;
  for (const row of targets) {
    const shortCode = await generateShortCode({
      exists: (code) => !!checkExists.get(code)
    });
    updateStmt.run(shortCode, row.id);
    updated += 1;
  }

  console.log(`已重新生成 ${updated} 条短链，长度统一为 ${SHORT_CODE_LENGTH}`);
  process.exit(0);
})().catch(err => {
  console.error('重新生成短链失败:', err);
  process.exit(1);
});
