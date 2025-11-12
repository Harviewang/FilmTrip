# 2025-11-09 NAMING-1 草案批注

- **storage_variant 约束**：SQLite 无法直接 `ALTER TABLE ... ADD COLUMN ... CHECK`，迁移时需使用触发器保证取值范围（RAW/WEB/THUMB/SHARE）。
- **short_code 长度**：保持文档中的 5 位 Base62 设计，避免与规范冲突。
- **origin_path 回填**：通过旧 `filename` 推导扩展名，再组合 `{uuid}` 前缀目录构成 `local-dev/web/...`；如缺失扩展名，默认 `.jpg` 并在迁移日志记录。
- **布尔字段清洗**：`is_protected`、`effective_protection`、`is_encrypted`、`is_private` 等全部归一化为整数 0/1。
- **唯一索引冲突处理**：迁移脚本遇冲突时尝试自动生成新短码（重试 ≤3 次），仍冲突则写入异常表等待人工处理。

