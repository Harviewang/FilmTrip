# 2025-10-19 工作日记
> 本文件记录当日工作细节，补充 summary.md 的关键信息。

## 工作目标
- 统一启动脚本入口（根级 `start.sh` 转发至 `project/start.sh`）
- 检查并优化预览旋转与尺寸计算，避免反复加载与抖动
- 清理演示/临时文件，审计目录结构
- 恢复并整理 `daily-logs/` 日志体系

## 详细工作记录

### 1. 启动脚本统一（Windsurf）
- 根级 `start.sh` 改为轻量包装器
- 所有参数转发到 `project/start.sh`
- 保持向后兼容性

### 2. 预览性能优化（Windsurf）
- 在 `PhotoPreview.jsx` 中使用稳定时间戳 `stableVRef.current` 替代 `Date.now()`
- 避免每次渲染都触发图片重新加载
- 将扣除顶部/底部UI占位后的可用视口传给 `getFittedSizeAfterRotate()`
- 提升标准/沉浸模式下的尺寸稳定性

### 3. 文件清理与审计（Windsurf）
- 删除演示文件：`.playwright-mcp/gallery-page-working.png`、`check-photo-sizes.html`
- 审计目录结构，确保文件组织合理

### 4. 日志体系恢复（Windsurf）
- 新增 `daily-logs/索引.md`
- 恢复 `daily-logs/2025-10-16.md`、`daily-logs/2025-10-17.md`
- 新增本日志 `daily-logs/2025-10-19.md`

## 代码改动要点
- `start.sh`（根级转发）
- `frontend/src/components/PhotoPreview.jsx`（稳定缓存与可用视口尺寸）
- `daily-logs/索引.md`、`daily-logs/2025-10-16.md`、`daily-logs/2025-10-17.md`、`daily-logs/2025-10-19.md`
- 删除演示文件：`.playwright-mcp/gallery-page-working.png`、`check-photo-sizes.html`

## 问题与说明
- 瀑布流进一步稳态优化（真实比例、resize监听与节流）可择机小步改进，目前观感已满意

## 明日计划
- 地图功能优化：配置MapTiler API key，修复缩放跳跃问题
- 照片显示问题修复：解决显示为"加密"的问题
- 数据准备：为测试图片批量添加地理位置数据
