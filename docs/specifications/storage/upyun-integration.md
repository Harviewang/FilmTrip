# 又拍云存储与 CDN 接入规范 v1.0

> 版本：v1.0（2025-11-12）  
> 适用范围：FilmTrip 前后端、运维、测试、审计团队  
> 状态：待实施（密钥由用户提供，按本文规范落地）

---

## 1. 背景与目标
- 将原始/处理后的照片统一迁移到 **又拍云云存储（UPYUN Storage）**。
- 通过 **又拍云 CDN** 发布图片，降低自建服务器压力并提升访问速度。
- 确保受保护图片仍受权限控制，所有访问与操作可追溯。

---

## 2. 角色与责任
| 角色 | 责任摘要 | 输出/验收 |
| --- | --- | --- |
| @planner | 规划资源、域名、命名规范，协调密钥管理 | 项目计划、命名表、密钥交接记录 |
| @backend | 实现上传/删除/签名、回调、刷新接口 | 可用的 API、数据库字段、日志落地 |
| @frontend | 直传表单、图片展示、管理端刷新能力 | 上传 UI、预览页面、刷新按钮 |
| @devops | 创建存储 + CDN、配置缓存/安全策略、监控告警 | 平台配置截图、监控基线 |
| @tester | 功能、性能、安全验证 | 测试报告、问题单 |
| @reviewer | 交叉审计代码与配置，确认风险点关闭 | 审计报告、整改确认 |
| @documenter | 更新规范、操作手册、FAQ | 本文与配套指南 |

---

## 3. 架构概览
```
用户上传/浏览
      │
      ▼
前端（直传表单 + CDN URL 渲染）
      │                ▲
      │                │ 缓存刷新、签名 URL
      ▼                │
FilmTrip Backend ──────┘
  • 签发上传策略 (policy + signature)
  • 记录文件信息（路径、MD5、访问域名）
  • 受保护资源：生成临时签名下载 URL
  • 又拍云 CDN 缓存刷新
      │
      ▼
又拍云云存储（私有空间）
      │
      ▼
又拍云 CDN 节点（img.filmtrip.cn 等）
```

---

## 4. 接入步骤清单

### 4.1 @planner
- [ ] 确认使用的存储服务名、加速域名（例：`filmtrip-prod`、`img.filmtrip.cn`）。
- [ ] 整理目录命名规范：`filmtrip/{env}/{albumId}/{photoId}/{version}.jpg`。
- [ ] 与安全团队确认密钥存储位置（Vault/环境变量），禁止写入仓库。
- [ ] 在 `docs/specifications/命名与短链规范.md` 增补存储章节（实施后执行）。

### 4.2 @devops
- [ ] 创建云存储空间（私有读写），绑定加速域名并上传 SSL 证书。
- [ ] 配置缓存策略：公开资源 30 天、受保护资源 5 分钟或按需关闭缓存。
- [ ] 开启 Referer 防盗链（白名单包含 FilmTrip 前端域名、管理后台）。
- [ ] 启用访问日志与告警（上传失败、回源 5xx、命中率异常）。
- [ ] 输出配置文档（截图 + 参数说明）供 @reviewer 审计。

### 4.3 @backend
1. **依赖与配置**
   - 引入又拍云 SDK 或自实现 REST 客户端（Basic Auth + `Content-MD5` + `Date` + `Authorization` 签名）。
   - 环境变量：
     - `UPYUN_BUCKET`（空间名）
     - `UPYUN_OPERATOR`（操作员）
     - `UPYUN_PASSWORD`（操作员密码：建议使用密文或动态密钥服务）
     - `UPYUN_CDN_DOMAIN`（加速域名）
2. **上传流程**
   - `POST /api/storage/policy`：生成 `policy + signature`，限制 MIME/大小/有效期（默认 5 分钟）。
   - 前端直传至 `https://v0.api.upyun.com/<bucket>/`，使用 HTML Form Data。
   - 成功后又拍云回调（配置回调 URL），后端验证签名，写入数据库字段：
     ```
     storage_path, cdn_url, file_size, md5, operator, ip, ua, uploaded_at
     ```
3. **访问接口**
   - 公共资源直接返回 `https://{cdn_domain}/{storage_path}`。
   - 受保护资源：
     - 生成签名 URL：`GET https://{bucket}.b0.upaiyun.com/{path}?_upt={signature}`。
     - 签名算法（5 分钟有效期）：
       ```
       expire = now + 300
       token = md5("{path}&{expire}&{password}")
       final = "{path}?_upt=" + token + "." + expire
       ```
4. **删除与刷新**
   - 删除：调用又拍云删除接口（DELETE），同步数据库标记。
   - 缓存刷新：`POST /api/storage/purge` → 又拍云 `https://purge.upyun.com/purge/`。
   - 失败重试策略：间隔 30s，最多 3 次；失败事件写入 `storage_actions` 表。
5. **日志**
   - 使用统一 logger：落至 `logs/storage/{date}.log`，包含操作人、动作、状态码。
   - 与审计系统打通，输出 JSON（便于后续分析）。

### 4.4 @frontend
- 上传组件：
  - 调用后端 `policy` 接口，获取 `policy/signature`。
  - 表单字段：`file`, `policy`, `signature`, `bucket`, `save-key`, `return-url`, `notify-url` 等（按又拍云直传格式）。
  - 展示上传进度、失败重试、完成回调。
- 图片展示：
  - 全站统一使用 `cdnDomain + storage_path`。
  - 对受保护资源使用后端返回的签名 URL 或在请求时添加版本参数防缓存。
- 管理端：
  - 展示文件元信息（路径、大小、上传时间、是否受保护）。
  - 提供“刷新 CDN”按钮 → 调用 `/api/storage/purge`。
  - 日志：在调试模式打印 `uploadId`、`saveKey`。

### 4.5 @tester
- 功能用例：
  - 上传成功/失败（超限、类型不符）、受保护资源访问受限。
  - 管理端刷新缓存立即生效。
- 性能用例：
  - 不同地域访问延迟对比（CDN 命中 vs 回源）。
  - 大文件断点续传（如启用）。
- 安全用例：
  - 过期签名、被篡改签名访问应返回 403。
  - 直接访问源站需拒绝（验证 Referer/Token）。
- 生成测试报告并提交 @reviewer。

### 4.6 @reviewer
- 审查代码清单：`backend/services/storage/*`, `frontend/src/services/upload/*` 等。
- 核对：
  - 密钥不出现在仓库或日志；
  - 策略限制是否生效（大小/MIME/有效期）；
  - 受保护资源控制链路完整（接口 → 签名 → CDN 回源）；
  - 日志字段齐全，可追溯。
- 审查平台配置（由 @devops 提供）：
  - 空间权限、加速域名、缓存策略、防盗链、HTTPS 配置。
- 出具审计结论，列出风险项与整改建议。

---

## 5. 安全策略
- **密钥管理**：操作员密码仅存于服务器环境变量或密钥管理服务，禁止写入代码库与日志。
- **上传限制**：强制校验 Content-Type、大小（默认 15MB），禁止执行文件。
- **目录规范**：禁止客户端自定义 `save-key`，必须走后端生成的层级结构。
- **受保护资源**：使用私有空间 + 临时签名；管理端请求需携带管理员身份令牌。
- **日志留痕**：所有上传、删除、刷新操作必须写审计日志，包含操作者 ID、IP、UA、耗时。

---

## 6. 测试与验收
| 阶段 | 验收人 | 目标 |
| --- | --- | --- |
| 联调 | @frontend + @backend | 上传、预览、删除、刷新功能均可用 |
| 性能压测 | @tester | CDN 命中率、平均响应时间达标（<300ms） |
| 安全审计 | @reviewer | 密钥安全、权限链路、日志完整性无风险 |
| 用户验收 | Harvie | 验证实际管理操作流程、UI 反馈符合预期 |

测试完成后，`docs/work-plans/YYYY-MM-DD/summary.md` 必须记录自测与审计结论。

---

## 7. 上线 Checklist
1. ✅ 所有代码合并至 `main`，CI 通过。
2. ✅ 又拍云存储、CDN、证书、防盗链配置完成且已审计。
3. ✅ 管理后台环境变量已注入（操作员密钥等）。
4. ✅ 回滚方案：
   - 保留本地存储接口备用；
   - 保留旧版本构建镜像；
   - CDN 回滚计划（临时关闭加速，回源自建服务器）。
5. ✅ 发布后 30 分钟内监控访问日志与错误率。
6. ✅ 更新 `docs/work-plans/git-log.md` 与对应提交说明。

---

## 8. 审计要求（@reviewer 专用）
- 编写《又拍云接入审计报告》，至少包含：
  - 代码核查结果；
  - 平台配置核查结果；
  - 日志/监控配置核查；
  - 发现问题与整改措施。
- 跟踪整改：若有未闭环项，在 `docs/work-plans/.../summary.md` 标注“审计未通过”，直到修复。
- 验收签字：所有风险关闭后，将审计报告附到当日提交文档 `CMT-YYYYMMDD-xxx.md`。

---

## 9. 更新记录
| 日期 | 版本 | 作者 | 说明 |
| --- | --- | --- | --- |
| 2025-11-12 | v1.0 | Codex (GPT-5) | 首版，定义又拍云接入流程、角色责任与审计要求 |

---

## 附录 A · 实施排期

### 总览

| 里程碑 | 时间窗口 | 验收负责人 | 关键检查点 |
| --- | --- | --- | --- |
| M1 准备阶段 | T0 ~ T0+5 天 | @planner | 命名规范确认、密钥交接记录归档、基础资源清单 |
| M2 开发阶段 | T0+6 ~ T0+12 天 | @backend | 上传策略、签名下载、回调处理、CDN 刷新接口可用 |
| M3 验证阶段 | T0+13 ~ T0+18 天 | @tester, @reviewer | 自测通过、测试报告、审计初稿、文档更新 |
| M4 上线阶段 | T0+19 ~ T0+23 天 | @devops | 配置终检、回滚脚本、上线复盘、监控基线 |

> 说明：T0 为排期启动日，可根据实际开始日期平移。

### M1 准备阶段
- **@planner**
  - 输出《资源命名规范》附又拍云路径层级。
  - 协调密钥交接会议，记录《密钥交接单》并存放于安全库。
  - 更新冲刺计划与依赖矩阵。
- **@devops**
  - 创建又拍云存储空间（测试与预生产），确认私有权限。
  - 申请并绑定 CDN 加速域名，上传 SSL 证书。
  - 配置基础告警（回源 5xx、命中率 <80%）。
- **验收**
  - 所有产出上传至 `docs/work-plans/2025-11/upyun-rollout/`。
  - 在每日 stand-up 中通报风险（如密钥延迟）。

### M2 开发阶段
- **@backend**
  - 接入又拍云 SDK/REST 客户端；封装 `storageService`。
  - 实现 `POST /api/storage/policy`、`POST /api/storage/callback`、`POST /api/storage/purge`、签名下载逻辑。
  - 编写单元测试（签名正确性、策略限制）。
  - 在数据库新增 `storage_path`, `cdn_url`, `storage_actions` 表。
- **@frontend**
  - 直传表单组件（含进度、重试、回调处理）。
  - 图片展示统一使用 CDN URL，受保护资源调用签名接口。
  - 管理后台提供刷新按钮、操作日志面板。
- **@devops**
  - 配置测试环境变量，完成 webhook/回调地址允许列表。
- **验收**
  - 后端/前端自测通过并在 PR 描述贴上对应用例。

### M3 验证阶段
- **@tester**
  - 执行功能用例：上传成功/失败、权限校验、刷新结果。
  - 执行性能用例：CDN 命中率、地域访问延迟对比。
  - 执行安全用例：过期/篡改签名、Referer 防盗链检测。
  - 输出测试报告（包含缺陷清单与复测记录）。
- **@reviewer**
  - 完成代码审计（含密钥检查、策略约束）、配置审计。
  - 初版审计报告提交，列出风险项及整改建议。
- **@documenter**
  - 更新操作手册、FAQ、知识库 Q&A。
- **验收**
  - 所有缺陷进入跟踪状态，严重级别在 M4 前完成整改。

### M4 上线阶段
- **@devops**
  - 预生产/生产配置导入与二次核对。
  - 准备回滚剧本（替换环境变量、关闭 CDN 加速等）。
  - 设置上线监控仪表盘。
- **@backend / @frontend**
  - 处理遗留缺陷、完成最终代码合并与发布。
  - 发布后 30 分钟内进行冒烟测试。
- **@planner / @reviewer**
  - 复盘会议：确认风险关闭、记录经验教训。
- **验收**
  - 更新 `docs/work-plans/git-log.md`，归档上线纪要。

**依赖关系**：密钥交接 → 后端策略实现 → 前端联调 → 测试/审计 → 上线复盘。  
**风险提示**：密钥延期、CDN 防盗链配置错误、回调签名失败、日志未落库；对应预案见第 7 章 Checklist。

---

## 附录 B · API 示例

### API 结构总览

| 接口 | 方法 | 目的 | 认证方式 |
| --- | --- | --- | --- |
| `/api/storage/policy` | POST | 生成直传策略与签名 | 管理端 Bearer Token |
| `/api/storage/callback` | POST | 接收又拍云上传回调 | 又拍云 Authorization Header |
| `/api/storage/protected/:photoId` | GET | 获取受保护资源临时 URL | 用户身份 Token |
| `/api/storage/purge` | POST | 刷新 CDN 缓存 | 管理端 Bearer Token |

### `POST /api/storage/policy`
- **请求头**：`Authorization: Bearer <admin_token>`
- **请求体**
  ```
  {
    "fileName": "cover.jpg",
    "mime": "image/jpeg",
    "size": 123456,
    "albumId": "alb_123",
    "isProtected": true
  }
  ```
- **响应体**
  ```
  {
    "policy": "...",
    "signature": "...",
    "bucket": "filmtrip-prod",
    "saveKey": "/filmtrip/prod/alb_123/photo_456/v1/cover.jpg",
    "notifyUrl": "https://api.filmtrip.cn/storage/callback",
    "cdnUrl": "https://img.filmtrip.cn/filmtrip/prod/alb_123/photo_456/v1/cover.jpg",
    "expiresIn": 300
  }
  ```
- **错误码**
  - `400`：文件大小或类型超限
  - `401`：Token 失效
  - `500`：签名生成失败（记录日志 `storage_actions`）
- **示例 cURL**
  ```
  curl -X POST https://api.filmtrip.cn/api/storage/policy \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"fileName":"cover.jpg","mime":"image/jpeg","size":123456,"albumId":"alb_123","isProtected":true}'
  ```

### `POST /api/storage/callback`
- **又拍云 Header**：
  - `Authorization: UPYUN <operator>:<signature>`
  - `Date`, `Content-MD5`
- **请求体示例**
  ```
  {
    "url": "/filmtrip/prod/alb_123/photo_456/v1/cover.jpg",
    "file_size": 123456,
    "image-width": 2048,
    "image-height": 1365,
    "time": 1731427200,
    "ext-param": "uploadId=abc123"
  }
  ```
- **后端流程**
  1. 校验 Authorization 签名。
  2. 写入 `storage_files` 表（路径、MD5、上传人等）。
  3. 触发业务事件（例如通知管理后台刷新列表）。
  4. 返回 `{"status":"ok"}`。

### `GET /api/storage/protected/:photoId`
- **权限**：需要用户登录 Token，并校验其访问相册/照片权限。
- **响应示例**
  ```
  {
    "signedUrl": "https://filmtrip-prod.b0.upaiyun.com/filmtrip/prod/alb_123/photo_456/v1/cover.jpg?_upt=token.expire",
    "expireAt": 1731427500,
    "cdnFallback": "https://img.filmtrip.cn/filmtrip/prod/alb_123/photo_456/v1/cover.jpg?version=1731427200"
  }
  ```
- **错误码**
  - `403`：权限不足或签名生成失败
  - `404`：照片不存在

### `POST /api/storage/purge`
- **请求头**：`Authorization: Bearer <admin_token>`
- **请求体**
  ```
  {
    "paths": [
      "https://img.filmtrip.cn/filmtrip/prod/alb_123/photo_456/v1/cover.jpg"
    ],
    "reason": "manual-refresh"
  }
  ```
- **响应体**
  ```
  {
    "taskId": "purge-20251112-001",
    "status": "queued",
    "retry": {
      "intervalSeconds": 30,
      "maxAttempts": 3
    }
  }
  ```
- **错误码**
  - `400`：路径为空或非法
  - `429`：刷新频率受限
- **示例 cURL**
  ```
  curl -X POST https://api.filmtrip.cn/api/storage/purge \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"paths":["https://img.filmtrip.cn/filmtrip/prod/alb_123/photo_456/v1/cover.jpg"]}'
  ```

---

## 附录 C · 审计报告模板

```
# 又拍云接入审计报告模板

## 1. 基本信息
- 审计日期：
- 审计人（@reviewer）：
- 涉及版本 / 分支：
- 关联需求 / Jira 编号：

## 2. 代码核查清单
- [ ] 上传策略：限制 MIME、大小、有效期，密钥未曝光（文件/日志）
- [ ] 签名下载：临时 URL 时效正确、路径校验、防跳跃访问
- [ ] 回调处理：签名验证、幂等处理、异常重试
- [ ] CDN 刷新：频率限制、错误日志记录、告警对接
- 备注/发现：

## 3. 配置核查清单
- [ ] 存储空间属性：私有、HTTPS、访问日志开启
- [ ] CDN：证书有效、防盗链上线、缓存分层策略
- [ ] 环境变量：密钥位置、权限隔离、变更记录
- [ ] 监控告警：命中率、回源 5xx、上传失败阈值
- 备注/发现：

## 4. 测试结果复核
- 功能测试报告链接：
- 主要指标（命中率、平均响应时间）：
- 安全测试发现（含整改状态）：
- 性能压测截图/数据链接：

## 5. 风险与整改跟踪
| 风险项 | 严重度 | 改进措施 | 负责人 | 目标完成日 | 状态 |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## 6. 结论
- 综合结论：通过 / 限制上线 / 拒绝上线
- 需跟踪事项：
- 审计人签字：
- 归档路径：
```


