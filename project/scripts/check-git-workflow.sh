#!/bin/bash

# Git 配置检查脚本
# 用于检查Git配置和工作流程问题

echo "🔍 Git 配置和工作流程检查"
echo "================================"

# 检查当前目录
echo "📁 当前目录: $(pwd)"
echo "📁 Git根目录: $(git rev-parse --show-toplevel 2>/dev/null || echo 'Not a git repository')"
echo ""

# 检查Git状态
echo "📊 Git状态:"
git status --porcelain
echo ""

# 检查分支信息
echo "🌿 分支信息:"
echo "当前分支: $(git branch --show-current)"
echo "所有分支:"
git branch -a
echo ""

# 检查远程仓库
echo "🌐 远程仓库:"
git remote -v
echo ""

# 检查最近提交
echo "📝 最近5个提交:"
git log --oneline -5
echo ""

# 检查未跟踪文件
echo "📄 未跟踪文件:"
git ls-files --others --exclude-standard
echo ""

# 检查Git配置
echo "⚙️  Git配置:"
echo "用户名: $(git config user.name)"
echo "邮箱: $(git config user.email)"
echo "默认分支: $(git config init.defaultBranch)"
echo "推送策略: $(git config push.default)"
echo ""

# 检查工作流程问题
echo "⚠️  潜在问题检查:"
echo ""

# 检查是否有未提交的修改
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 有未提交的修改"
    echo "   建议: git add . && git commit -m 'your message'"
else
    echo "✅ 工作目录干净"
fi

# 检查是否有未推送的提交
if [ -n "$(git log origin/$(git branch --show-current)..HEAD 2>/dev/null)" ]; then
    echo "❌ 有未推送的提交"
    echo "   建议: git push origin $(git branch --show-current)"
else
    echo "✅ 所有提交已推送"
fi

# 检查是否有未拉取的更新
if [ -n "$(git log HEAD..origin/$(git branch --show-current) 2>/dev/null)" ]; then
    echo "❌ 有未拉取的更新"
    echo "   建议: git pull origin $(git branch --show-current)"
else
    echo "✅ 本地分支是最新的"
fi

# 检查是否有合并冲突
if [ -f ".git/MERGE_HEAD" ]; then
    echo "❌ 存在合并冲突"
    echo "   建议: 解决冲突后 git add . && git commit"
else
    echo "✅ 没有合并冲突"
fi

# 检查是否有rebase进行中
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
    echo "❌ Rebase进行中"
    echo "   建议: git rebase --continue 或 git rebase --abort"
else
    echo "✅ 没有进行中的rebase"
fi

echo ""
echo "🎯 建议的工作流程:"
echo "1. 定期检查: git status"
echo "2. 提交前检查: git diff --cached"
echo "3. 推送前同步: git pull && git push"
echo "4. 使用功能分支: git checkout -b feature/name"
echo "5. 合并时使用: git merge --no-ff feature/name"
echo ""

echo "📚 更多信息请查看: docs/git-workflow-improvements.md"
