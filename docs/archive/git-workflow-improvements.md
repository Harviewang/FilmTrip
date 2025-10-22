# Git 工作流程改进指南

## 问题分析

### 回滚后代码丢失的原因

1. **提交分离问题**：
   - 后端修改在提交 `8a34ffd` 中
   - 前端修改在提交 `543c629` 中
   - 回滚到 `8a34ffd` 时，前端代码被回滚到更早状态

2. **分支合并问题**：
   - 前端代码在 `feature/masonry-and-preview` 分支中
   - 合并时可能没有正确处理所有相关文件

3. **工作流程不一致**：
   - 前端和后端修改没有在同一个提交中
   - 导致回滚时出现不一致的状态

## 改进建议

### 1. 统一提交策略

```bash
# 推荐：相关功能的前后端修改放在同一个提交中
git add backend/ frontend/
git commit -m "feat: 实现图片预览和瀑布流功能

- 后端：优化图片处理，生成多尺寸图片
- 前端：实现瀑布流布局，图片旋转功能
- 修复：图片方向问题，预览模式优化"
```

### 2. 功能分支管理

```bash
# 创建功能分支
git checkout -b feature/image-optimization

# 在功能分支中完成所有相关修改
# 包括前端、后端、文档等

# 合并到主分支
git checkout main
git merge feature/image-optimization --no-ff
```

### 3. 提交前检查

```bash
# 检查所有相关文件是否都已提交
git status

# 检查提交内容
git diff --cached

# 检查提交历史
git log --oneline -5
```

### 4. 回滚策略

```bash
# 回滚到特定功能完成的状态
git log --oneline --grep="feat: 图片预览"

# 使用cherry-pick恢复特定提交
git cherry-pick <commit-hash>

# 或者创建修复提交而不是回滚
git revert <commit-hash>
```

## 最佳实践

### 1. 提交粒度
- **原子性**：每个提交应该是一个完整的功能单元
- **一致性**：相关的前后端修改应该在同一提交中
- **可回滚**：每个提交都应该是可独立回滚的

### 2. 分支策略
- **功能分支**：每个新功能使用独立分支
- **合并策略**：使用 `--no-ff` 保留分支历史
- **清理分支**：功能完成后及时删除分支

### 3. 提交信息
- **格式**：`type(scope): description`
- **类型**：feat, fix, docs, style, refactor, test, chore
- **描述**：清晰说明修改内容和原因

### 4. 代码同步
- **定期同步**：每天至少同步一次远程仓库
- **冲突处理**：及时解决合并冲突
- **备份策略**：重要修改前创建备份分支

## 工具推荐

### 1. Git Hooks
```bash
# 安装 pre-commit hook
npm install --save-dev husky lint-staged

# 配置 package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  }
}
```

### 2. Git 别名
```bash
# 添加常用别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

### 3. 可视化工具
- **GitKraken**：图形化Git客户端
- **SourceTree**：免费的Git GUI工具
- **VS Code Git**：集成在编辑器中的Git功能

## 应急处理

### 1. 代码丢失恢复
```bash
# 查看所有提交历史
git reflog

# 恢复到特定状态
git reset --hard <commit-hash>

# 或者创建新分支保存当前状态
git checkout -b recovery-branch
```

### 2. 合并冲突处理
```bash
# 查看冲突文件
git status

# 手动解决冲突后
git add <resolved-files>
git commit
```

### 3. 远程同步问题
```bash
# 强制推送（谨慎使用）
git push --force-with-lease origin main

# 或者重新设置远程分支
git push origin main --force
```

## 总结

通过改进Git工作流程，可以避免回滚后代码丢失的问题：

1. **统一提交**：相关功能的前后端修改放在同一提交中
2. **功能分支**：使用独立分支管理功能开发
3. **定期同步**：及时同步远程仓库
4. **备份策略**：重要修改前创建备份
5. **工具支持**：使用Git hooks和可视化工具

这样可以确保代码的一致性和可追溯性，避免类似问题的再次发生。

