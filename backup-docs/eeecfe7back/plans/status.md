# 项目执行状态板（自动更新入口）

更新时间：2025-10-30

## 任务进度

- [x] 文档目录重构与迁移（guides/、knowledge-base/ → docs/experience/；ai-workflow → docs/human-workflow/）
- [x] 迁移日志与占位说明（specifications、work-plans 提示页；migration-log.md）
- [ ] 全局文档链接与索引更新（断链占位、索引补齐）
- [ ] 代码与状态统一（/film 路由、状态机/接口/管理后台 UI 对齐）
- [ ] 地图一致性修复补完（MapLibre/Leaflet 缩放15、小圆点、权限过滤一致）
- [ ] 冒烟测试（本地启动、/film、/map、/gallery、/admin、四个动作接口）

## 最近变更（关键位置）

- 路由/导航：
  - frontend/src/App.jsx （/film 路由、/film/stocks/:id）
  - frontend/src/components/UserLayout.jsx （导航指向 /film）
  - frontend/src/pages/NotFound.jsx （导航指向 /film）
- 时间轴与品类：
  - frontend/src/pages/FilmRolls/components/FilmRollGrid/index.jsx （仅 archived，按 archived_date 分组排序）
  - frontend/src/pages/Film/StockDetail.jsx （品类详情骨架）
- 地图（Leaflet 旧页兜底）：
  - frontend/src/pages/Map/index.jsx （maxZoom=15、小圆点、权限过滤）
- 后端与数据库：
  - backend/routes/filmRolls.js （状态机接口 open/finish/wash-finish/archive 骨架、排序与状态调整）
  - backend/database/fix_film_structure.sql （状态集合与 wash_* 系列表/事件表草案）
- 文档迁移：
  - docs/requirements/modules/{film.md,gallery.md,map.md,admin.md}
  - docs/plans/{README.md,milestones.md,daily/2025-10-29/README.md,daily/2025-10-30/README.md}
  - docs/experience/{best-practices,process-guides,research}
  - docs/human-workflow/{README.md,agent-roles.md,quality-checklist.md,workflow-guide.md,tracking-system.md,templates/*}
  - docs/migration-log.md （持续追加）

## 快速检查入口

- 文档入口：docs/README.md
- 状态板文件：docs/plans/status.md（本页）
- 迁移记录：docs/migration-log.md
- 页面与接口（本地）：
  - 前端：http://localhost:3002
  - 后端：http://localhost:3001
  - /film、/film/stocks/:id、/map、/gallery、/admin
  - POST /api/filmRolls/:id/{open|finish|wash-finish|archive}

## 说明

- 本页在每轮批量操作后更新，作为“只读总览”。
- 详细文件变化请看 Git 变更或 docs/migration-log.md。
