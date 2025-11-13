#!/bin/bash
# SQLite数据库备份脚本
# 用于PostgreSQL迁移前的数据备份

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$SCRIPT_DIR/.."
DATA_DIR="$BACKEND_DIR/data"
BACKUP_DIR="$DATA_DIR/backups"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 数据库文件路径
DB_FILE="$DATA_DIR/filmtrip.db"

# 检查数据库文件是否存在
if [ ! -f "$DB_FILE" ]; then
  echo "❌ 错误: 数据库文件不存在: $DB_FILE"
  exit 1
fi

# 生成备份文件名（带时间戳）
BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/filmtrip.db.backup-$BACKUP_DATE"

echo "📦 开始备份SQLite数据库..."
echo "   源文件: $DB_FILE"
echo "   备份文件: $BACKUP_FILE"

# 执行备份（SQLite备份方法）
# 方法1: 使用VACUUM INTO（SQLite 3.27+）
if sqlite3 "$DB_FILE" "VACUUM INTO '$BACKUP_FILE';" 2>/dev/null; then
  echo "✅ 备份成功（使用VACUUM INTO）"
else
  # 方法2: 使用cp（如果VACUUM失败）
  echo "⚠️  VACUUM INTO失败，使用cp复制..."
  cp "$DB_FILE" "$BACKUP_FILE"
  if [ $? -eq 0 ]; then
    echo "✅ 备份成功（使用cp）"
  else
    echo "❌ 备份失败"
    exit 1
  fi
fi

# 显示备份文件信息
BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo ""
echo "📊 备份信息:"
echo "   文件: $BACKUP_FILE"
echo "   大小: $BACKUP_SIZE"
echo "   时间: $BACKUP_DATE"
echo ""

# 验证备份文件
if sqlite3 "$BACKUP_FILE" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" > /dev/null 2>&1; then
  TABLE_COUNT=$(sqlite3 "$BACKUP_FILE" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
  echo "✅ 备份验证成功"
  echo "   表数量: $TABLE_COUNT"
  echo ""
  echo "💾 备份完成！"
else
  echo "❌ 备份验证失败"
  exit 1
fi

# 列出所有备份
echo ""
echo "📋 所有备份文件:"
ls -lh "$BACKUP_DIR"/filmtrip.db.backup-* 2>/dev/null | tail -5

echo ""
echo "💡 提示: 备份文件保存在 $BACKUP_DIR"
echo "   建议保留最近3-5个备份"

