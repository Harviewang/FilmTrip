-- 2025-11-12 Backfill film_rolls.name values
-- 将 name 为空或空白的记录回填为 roll_number，确保满足 NOT NULL 约束

BEGIN TRANSACTION;

UPDATE film_rolls
SET name = COALESCE(NULLIF(TRIM(name), ''), roll_number)
WHERE name IS NULL
   OR TRIM(name) = '';

COMMIT;

-- 校验语句（可选执行）：
-- SELECT COUNT(*) FROM film_rolls WHERE name IS NULL OR TRIM(name) = '';
-- 执行前建议先备份数据库：.backup ./backups/filmtrip-before-name-backfill.db
