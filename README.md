# FilmTrip

最小可运行骨架（阶段 0）：

- backend：Express 服务，提供 `/healthz` 健康检查与统一响应结构
- docs：图片命名与备份策略文档
- scripts：数据库/快照备份脚本占位（Linux/Bash 与 Windows/PowerShell）
- .env.example：环境变量模板

## 本地启动（后端）

1. 进入 backend 安装依赖
   - Windows PowerShell:
     - `cd backend`
     - `npm install`
     - 复制 `.env.example` 为 `.env` 并根据需要填写
     - `npm start`

2. 健康检查
   - 打开 `http://localhost:8080/healthz`

## 环境变量（见根目录 .env.example）

关键：`PORT`、`X_ADMIN_TOKEN`、`SIGNING_SECRET`、`DATABASE_URL`、`STORAGE_*`、`CDN_BASE_URL`、`MAP_PROVIDER`。

## 文档

- `docs/STORAGE_NAMING.md`：内容可寻址的图片命名与访问策略
- `docs/BACKUP.md`：数据库与元数据快照备份/恢复流程

## 下一步（阶段 1-2）

- 添加数据库迁移与实体表结构
- 打通上传与多尺寸生成、EXIF/LQIP 管道


