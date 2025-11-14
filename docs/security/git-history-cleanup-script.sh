#!/bin/bash
# Git历史清理脚本
# 用于清理Git历史中包含敏感信息的提交
# 
# ⚠️ 警告：此脚本会修改Git历史，执行前请：
# 1. 完整备份仓库
# 2. 通知所有协作者
# 3. 确认所有更改已推送或备份

set -e

echo "🔍 Git历史清理脚本"
echo "=================="
echo ""
echo "⚠️  警告：此操作会修改Git历史，请确保："
echo "   1. 已完整备份仓库"
echo "   2. 已通知所有协作者"
echo "   3. 已保存所有本地更改"
echo ""
read -p "是否继续？(yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ 操作已取消"
    exit 1
fi

# 敏感信息列表（需要清理的内容）
SENSITIVE_PATTERNS=(
    "Guluhub@2025"
    "Guluhub%402025"
    "xpcriheeehusrqyycdfx"
)

# 需要清理的文件列表
SENSITIVE_FILES=(
    "docs/deployment/vercel-supabase-config.md"
    "docs/deployment/environment-strategy.md"
    "backend/scripts/get-supabase-connection.md"
)

echo ""
echo "📋 清理计划："
echo "   敏感信息模式：${SENSITIVE_PATTERNS[@]}"
echo "   敏感文件：${SENSITIVE_FILES[@]}"
echo ""
read -p "确认清理计划？(yes/no): " confirm_plan

if [ "$confirm_plan" != "yes" ]; then
    echo "❌ 操作已取消"
    exit 1
fi

# 备份当前分支
BACKUP_BRANCH="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
echo ""
echo "📦 创建备份分支: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"

# 方案1：使用git filter-branch清理文件历史
echo ""
echo "🧹 开始清理Git历史..."
echo "   方式：使用git filter-branch清理文件内容"

# 创建临时清理脚本
CLEANUP_SCRIPT=$(mktemp)
cat > "$CLEANUP_SCRIPT" << 'EOF'
#!/bin/bash
# 清理文件中的敏感信息

FILE="$1"

if [ ! -f "$FILE" ]; then
    exit 0
fi

# 使用sed替换敏感信息
sed -i.bak \
    -e 's/Guluhub@2025/[PASSWORD]/g' \
    -e 's/Guluhub%402025/[PASSWORD]/g' \
    -e 's/xpcriheeehusrqyycdfx/[PROJECT-ID]/g' \
    "$FILE"

rm -f "${FILE}.bak"
EOF

chmod +x "$CLEANUP_SCRIPT"

# 使用git filter-branch清理每个文件
for file in "${SENSITIVE_FILES[@]}"; do
    if git log --all --full-history -- "$file" | grep -q .; then
        echo "   清理文件: $file"
        git filter-branch --force --index-filter \
            "git checkout-index -f -a && $CLEANUP_SCRIPT '$file' || true" \
            --prune-empty --tag-name-filter cat -- --all
    fi
done

# 清理引用
echo ""
echo "🧹 清理Git引用..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Git历史清理完成！"
echo ""
echo "📋 后续步骤："
echo "   1. 验证清理结果："
echo "      git log --all --full-history --grep='Guluhub'"
echo ""
echo "   2. 强制推送到远程仓库："
echo "      git push origin --force --all"
echo "      git push origin --force --tags"
echo ""
echo "   3. 通知所有协作者："
echo "      - 需要重新克隆仓库，或"
echo "      - 执行: git fetch origin && git reset --hard origin/main"
echo ""
echo "   4. 备份分支位置：$BACKUP_BRANCH"
echo "      如需恢复：git checkout $BACKUP_BRANCH"
echo ""

# 清理临时文件
rm -f "$CLEANUP_SCRIPT"

echo "⚠️  注意：请手动执行推送和通知协作者"
echo "   脚本已完成本地清理，但未自动推送"


