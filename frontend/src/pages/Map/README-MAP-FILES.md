# 地图文件说明

## 当前使用
- **主组件**: `MapLibre.jsx` - 使用 MapLibre GL JS 实现的地图组件
- **样式**: `Map.css` - 包含 MapLibre 和 Leaflet 样式（兼容旧版本）
- **路由**: `App.jsx` 中 `/map` 路由使用 `MapLibre` 组件

## 备份文件（已废弃，请勿使用）
- `index.jsx` - 旧版 Leaflet 实现（已废弃）
- `index.leaflet.backup.jsx` - Leaflet 备份版本 1（已废弃）
- `index.leaflet.backup2.jsx` - Leaflet 备份版本 2（已废弃）
- `backup-20251026/` - 2025-10-26 的备份目录（已废弃）

## 迁移历史
- 2025-10-27: 从 Leaflet 迁移到 MapLibre GL JS
- 原因: Leaflet 矢量瓦片兼容性问题（`leaflet.vectorgrid` 不支持 MapTiler 矢量格式）
- 备份原因: 保留旧实现以便紧急回退

## 注意
⚠️ **不要使用 `index.jsx` 或任何 Leaflet 备份文件**  
✅ **地图入口统一使用 `MapLibre.jsx`**

## 如需回退
如需紧急回退到 Leaflet：
1. 修改 `frontend/src/App.jsx` 将导入从 `MapLibre` 改为 `Map`
2. 从备份文件恢复 `index.jsx`
3. 重新启动前端服务

否则请使用 MapLibre 实现。

