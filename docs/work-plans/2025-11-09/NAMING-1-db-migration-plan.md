# NAMING-1 数据库迁移草案（2025-11-09）

> **目标**：为命名与存储规范落地铺平道路，补齐 `photos` 表的文件版本/短链/去重字段，并一次性清洗历史加密状态数据。

## 1. 现状梳理

- `backend/models/db.js` 仅创建 `photos` 表的基础字段，不包含哈希、短链、版本、逻辑删除等列。
- 保护相关字段（`is_protected`、`effective_protection`）存在 `INTEGER`/`BOOLEAN` 定义与实际写入 `'0'`/`'1'` 字符串的历史情况。
- 未建立任何与文件命名/存储路径相关的索引或表。

## 2. 目标字段与索引

| 字段 | 类型 | 说明 | 备注 |
|------|------|------|------|
| `file_hash` | `CHAR(64)` | 存储 SHA256（若保留 MD5，可新增 `md5_hash`） | 建唯一索引 `(file_hash, storage_variant)` |
| `storage_variant` | `TEXT`（约束使用触发器保证值在 `RAW/WEB/THUMB/SHARE`） | 记录文件版本 | 若需扩展枚举，同步更新触发器逻辑 |
| `short_code` | `CHAR(5)` | 5 位 Base62 短链值 | 建唯一索引；如未来需扩展长度，需同步更新规范 |
| `origin_bucket` | `TEXT` | 记录对象存储的桶（本地环境默认 `local-dev`） | 便于多环境切换 |
| `origin_path` | `TEXT` | 对象存储路径（`{env}/{variant}/{prefix}/{uuid}.{ext}`） | 提供直接访问路径 |
| `deleted_at` | `DATETIME NULL` | 逻辑删除时间 | 未删除则为 `NULL` |
| `created_at` / `updated_at` | 已存在 | 维持 |

可选扩展（阶段二再评估）：`md5_hash`、`file_ext`、`mime_type` 等。

## 3. 迁移步骤

1. **添加缺失列**
   - 利用 `ALTER TABLE photos ADD COLUMN ...` 顺序添加目标字段；
   - `storage_variant` 的合法值通过触发器维护（示例：`CREATE TRIGGER ensure_storage_variant CHECK (NEW.storage_variant IN (...))`）。
2. **清洗历史布尔字段**
   - 统一将 `is_protected`、`effective_protection`、`is_encrypted`、`is_private` 等布尔字段的 `'0'`/`0` 归并为 `0`，`'1'`/`1` 归并为 `1`；
   - 更新后仍保留 `INTEGER` 类型，前端读取时显式转布尔。
3. **初始化默认值**
   - 对历史记录补填 `storage_variant = 'WEB'`、`origin_bucket = 'local-dev'`；
   - `origin_path` 临时按照 `local-dev/web/{prefix}/{uuid}.{ext}` 规则回填，其中 `{prefix}` 取自 UUID 前三段（`ff/80/c9`）；扩展名从 `filename` 切分获取，若缺失则默认 `.jpg` 并记录到迁移日志。
4. **索引与唯一约束**
   - 创建唯一索引 `idx_photos_hash_variant`；
   - 创建唯一索引 `idx_photos_short_code`；
   - 若历史数据存在冲突：
     - `file_hash` 重复 → 先保留最早记录，其余记录生成新的 UUID/短链后再写入，或者记录异常待人工确认；
     - `short_code` 冲突 → 迁移脚本重新生成短码（最多重试 3 次），仍冲突则写入异常表供人工处理。
5. **迁移日志**
   - 输出 SQL 执行记录与结果统计（受影响行数、异常列表）。

## 4. 回滚策略

- 每步迁移前备份 `filmtrip.db`；若执行失败直接恢复备份。
- 新增列通过 `ALTER TABLE` 实现，回滚需重建表；如需撤销，恢复备份是首选。
- 数据清洗操作需记录前后快照，必要时可借助 SQL 脚本反向更新。

## 5. 下一步接入点

- `backend/controllers/photoController.js` 在处理上传时写入新字段。
- 未来 UpYun 回调/直传后，填充 `origin_bucket`/`origin_path` 为真实值。
- `short_code` 生成逻辑将在 `storage/namingService.js` 中实现，后续对历史数据补齐短码时复用同一工具。

---

> **审查节点**：本草案完成后，请 @architect/@reviewer 确认字段命名与约束是否满足规范，确认无误后进入脚本实现阶段。*** End Patch

