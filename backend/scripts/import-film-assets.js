#!/usr/bin/env node

/**
 * 批量导入胶卷素材：
 * 1. 将 tmp/Film_photo 下整理好的包装图/卷体图拷贝到 backend/uploads/filmStocks
 * 2. 同步写入/更新 film_stocks 表的 package_image / cartridge_image 字段
 *
 * 运行：node backend/scripts/import-film-assets.js
 */

const fs = require('fs');
const path = require('path');
const { db } = require('../models/db');

const SOURCE_DIR = path.join(__dirname, '../../tmp/Film_photo');
const TARGET_DIR = path.join(__dirname, '../uploads/filmStocks');
const DOCS_TARGET_DIR = path.join(__dirname, '../../docs/knowledge-base/assets/film-stocks');
const DEFAULT_FORMAT = '135mm';

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`❌ 素材目录不存在：${SOURCE_DIR}`);
  process.exit(1);
}
fs.mkdirSync(TARGET_DIR, { recursive: true });
fs.mkdirSync(DOCS_TARGET_DIR, { recursive: true });

const slugify = (value) => value
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const acronym = (value, len = 3) => value
  .replace(/[^a-z0-9]/gi, '')
  .slice(0, len)
  .toUpperCase()
  || 'XXX';

const films = [
  {
    name: 'Alien Film CN400',
    brand: 'Alien Film',
    series: 'CN',
    iso: 400,
    type: 'color-negative',
    packageFile: 'Alien Film CN 400.png',
    rollFile: 'Alien Film CN 400_Roll.png'
  },
  {
    name: 'Alien Film 5294',
    brand: 'Alien Film',
    series: '5294',
    iso: 100,
    type: 'color-positive',
    packageFile: 'Alien Film 5294.png',
    rollFile: 'Alien Film 5294_Roll.png'
  },
  {
    name: 'Alien Film Pan 100',
    brand: 'Alien Film',
    series: 'Pan',
    iso: 100,
    type: 'black-white-negative',
    packageFile: 'Alien Pan 100.png',
    rollFile: 'Alien Pan 100_roll.png'
  },
  {
    name: 'Alien Film Pan 400',
    brand: 'Alien Film',
    series: 'Pan',
    iso: 400,
    type: 'black-white-negative',
    packageFile: 'Alien Pan 400.png',
    rollFile: 'Alien Pan 400_Roll.png'
  },
  {
    name: 'Yue Film Crystal 100D',
    brand: 'Yue Film',
    series: 'Crystal',
    iso: 100,
    type: 'color-positive',
    packageFile: 'Yue Film Crystal 100D.png',
    rollFile: 'YueFilm 100D_Roll.png'
  },
  {
    name: 'Yue Film Fpan 100',
    brand: 'Yue Film',
    series: 'FPan',
    iso: 100,
    type: 'black-white-negative',
    packageFile: null,
    rollFile: 'Yue Film Fpan 100_Roll.png.png'
  },
  {
    name: 'Yue Film Fpan 400',
    brand: 'Yue Film',
    series: 'FPan',
    iso: 400,
    type: 'black-white-negative',
    packageFile: 'Yue Film FPan 400.png',
    rollFile: 'Yue Film Fpan 400_Roll.png'
  },
  {
    name: 'Fujifilm C100',
    brand: 'Fujifilm',
    series: 'Color',
    iso: 100,
    type: 'color-negative',
    packageFile: 'Fujifilm Color 100.png',
    rollFile: 'Fujifilm Color 100_roll.png'
  },
  {
    name: 'Fujifilm C200',
    brand: 'Fujifilm',
    series: 'Color',
    iso: 200,
    type: 'color-negative',
    packageFile: 'Fujifilm C200.png',
    rollFile: 'Fujifilm C200_Roll.png'
  },
  {
    name: 'Fujifilm Provia 100F',
    brand: 'Fujifilm',
    series: 'Provia',
    iso: 100,
    type: 'color-positive',
    packageFile: 'Fujifilm Provia 100F.png',
    rollFile: null
  },
  {
    name: 'Fujifilm Superia Premium 400',
    brand: 'Fujifilm',
    series: 'Superia Premium',
    iso: 400,
    type: 'color-negative',
    packageFile: 'Fujifilm Superia Premium 400.png',
    rollFile: 'Fujifilm Superia Premium 400_Roll.png'
  },
  {
    name: 'Fujifilm Superia X-Tra 400',
    brand: 'Fujifilm',
    series: 'Superia X-Tra',
    iso: 400,
    type: 'color-negative',
    packageFile: 'Fujifilm Superia X-Tra 400.png',
    rollFile: 'Fujifilm Superia X-Tra 400_Roll.png'
  },
  {
    name: 'Harman Phoenix 200',
    brand: 'Harman',
    series: 'Phoenix',
    iso: 200,
    type: 'color-negative',
    packageFile: 'Harman Phoenix 200.png',
    rollFile: 'Harman Phoeni 200_roll.png'
  },
  {
    name: 'Ilford Pan 100',
    brand: 'Ilford',
    series: 'Pan',
    iso: 100,
    type: 'black-white-negative',
    packageFile: 'Ilford Pan 100.png',
    rollFile: 'Ilford Pan 100_Roll.png'
  },
  {
    name: 'Ilford Pan 400',
    brand: 'Ilford',
    series: 'Pan',
    iso: 400,
    type: 'black-white-negative',
    packageFile: 'Ilford Pan 400.png',
    rollFile: 'Ilford Pan 400_Roll.png'
  },
  {
    name: 'Kodak E100',
    brand: 'Kodak',
    series: 'Ektachrome',
    iso: 100,
    type: 'color-positive',
    packageFile: 'Kodak E100.png',
    rollFile: 'Kodak E100_Roll.png'
  },
  {
    name: 'Kodak Gold 200',
    brand: 'Kodak',
    series: 'Gold',
    iso: 200,
    type: 'color-negative',
    packageFile: 'Kodak Gold 200.png',
    rollFile: 'Kodak Gold 200_Roll.png'
  },
  {
    name: 'Kodak ProImage 100',
    brand: 'Kodak',
    series: 'ProImage',
    iso: 100,
    type: 'color-negative',
    packageFile: 'Kodak ProImage 100.png',
    rollFile: 'Kodak ProImage 100_Roll.png'
  },
  {
    name: 'Kodak UltraMax 400',
    brand: 'Kodak',
    series: 'UltraMax',
    iso: 400,
    type: 'color-negative',
    packageFile: 'Kodak UltraMax 400.png',
    rollFile: 'Kodak UltralMax 400_Roll.png'
  },
  {
    name: 'Lucky C200',
    brand: 'Lucky',
    series: 'Color',
    iso: 200,
    type: 'color-negative',
    packageFile: 'Lucky Color 200.png',
    rollFile: 'Lucky Color 200_Roll.png'
  },
  {
    name: 'Lucky New SHD 100',
    brand: 'Lucky',
    series: 'New SHD',
    iso: 100,
    type: 'black-white-negative',
    packageFile: 'Lucky New SHD 100.png',
    rollFile: 'Lucky New SHD 100_Roll.png'
  },
  {
    name: 'THD 5294',
    brand: 'THD',
    series: '5294',
    iso: 100,
    type: 'color-positive',
    packageFile: 'THD 5294.png',
    rollFile: 'THD 5294_Roll.png'
  },
  {
    name: 'Lomography Color 100',
    brand: 'Lomography',
    series: 'Color',
    iso: 100,
    type: 'color-negative',
    packageFile: null,
    rollFile: 'Lomography Color 100_Roll.png'
  },
  {
    name: 'Lomography Color 400',
    brand: 'Lomography',
    series: 'Color',
    iso: 400,
    type: 'color-negative',
    packageFile: null,
    rollFile: null
  },
  {
    name: 'YesStar Color 200',
    brand: 'YesStar',
    series: 'Color',
    iso: 200,
    type: 'color-negative',
    packageFile: 'YesStar Color 200.png',
    rollFile: null
  },
  {
    name: 'YesStar Color 400',
    brand: 'YesStar',
    series: 'Color',
    iso: 400,
    type: 'color-negative',
    packageFile: 'YesStar Color 400.png',
    rollFile: 'YesStar Color 400_Roll.png'
  }
];

const upsertStmt = db.prepare(`
  INSERT INTO film_stocks (
    id, stock_serial_number, brand, series, iso, format, type, description,
    package_image, cartridge_image, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET
    stock_serial_number = excluded.stock_serial_number,
    brand = excluded.brand,
    series = excluded.series,
    iso = excluded.iso,
    format = excluded.format,
    type = excluded.type,
    description = excluded.description,
    package_image = excluded.package_image,
    cartridge_image = excluded.cartridge_image,
    updated_at = CURRENT_TIMESTAMP
`);

const copyAsset = (fileName, slug, suffix) => {
  if (!fileName) return null;
  const sourcePath = path.join(SOURCE_DIR, fileName);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️  找不到素材文件：${fileName}`);
    return null;
  }
  const ext = path.extname(fileName).toLowerCase() || '.png';
  const targetName = `${slug}-${suffix}${ext}`;
  const targetPath = path.join(TARGET_DIR, targetName);
  const docsTargetPath = path.join(DOCS_TARGET_DIR, targetName);
  fs.copyFileSync(sourcePath, targetPath);
  try {
    fs.copyFileSync(sourcePath, docsTargetPath);
  } catch (err) {
    console.warn(`⚠️  写入知识库素材失败：${docsTargetPath}`, err.message);
  }
  return `/uploads/filmStocks/${targetName}`;
};

let success = 0;
for (const film of films) {
  const slug = slugify(film.name);
  const id = `film-${slug}`;
  const stockSerial = slug.replace(/-/g, '_').toUpperCase();

  const packageImage = copyAsset(film.packageFile, slug, 'package');
  const cartridgeImage = copyAsset(film.rollFile, slug, 'roll');

  upsertStmt.run(
    id,
    stockSerial,
    film.brand,
    film.series,
    film.iso,
    film.format || DEFAULT_FORMAT,
    film.type,
    film.description || `${film.brand} ${film.series} ${film.iso}`,
    packageImage,
    cartridgeImage
  );

  console.log(`✅ 已更新胶卷：${film.name}`);
  success += 1;
}

console.log(`\n🎉 完成导入，共更新 ${success} 条胶卷类型记录。`);
process.exit(0);
