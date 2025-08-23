# 备份与恢复策略

## 目录/前缀
- 数据库 dump：`backups/pgdump/YYYYMMDD/filmtrip-YYYYMMDD-HHMM.dump`
- JSON 快照：`backups/snapshots/YYYYMMDD-HHMM/{cameras.json, filmstocks.json, rolls.json, photos.json, tags.json, roll_tags.json, photo_tags.json}`
- 每卷快照：`backups/snapshots/YYYYMMDD-HHMM/rolls/{rollId}.json`

## 数据库
- 生产 PostgreSQL：`pg_dump` 定时执行并上传到对象存储或 GitHub 私有仓库（建议加密）
- 开发 SQLite：复制 `.db` 文件到 `backups/sqlite/`

## 元数据快照
- 每日导出全量 JSON；用于“无 DB 时”重建表与关系
- 导入器负责校验 `Photo.storageKey` 是否存在；缺失派生图则重生成

## 恢复路径
- 路径 A：`pg_restore` 最近一次 dump → 应用迁移 → 服务起立
- 路径 B：导入 JSON 快照 → 重建表/关系 → 校验与修复派生图 → 服务起立

## 推送到 GitHub（可选）
- 建议使用私有仓库；dump 加密（age/gpg）再推送

## 定时任务（示例）
- `cron.daily/pg_dump_and_upload`
- `cron.daily/export_snapshots_and_push_github`


