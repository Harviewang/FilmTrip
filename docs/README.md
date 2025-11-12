# FilmTrip 文档索引
> 状态：2025-11-12（Codex 更新）

## A. 核心文档（保持最新）
| 目录/文件 | 说明 |
| --- | --- |
| [specifications/](specifications/) | 规范文档：API规范、需求文档 |
| [design/](design/) | 设计文档：前端设计、数据库设计 |
| [guides/](guides/) | 指南文档：部署指南、开发计划 |
| [work-plans/](work-plans/) | 工作计划：协作指南、每日记录 |

## 📚 知识库
- [knowledge-base/](knowledge-base/) - 项目知识库（统一收录最佳实践、问题复盘等）
  - `best-practices/` - 最佳实践与需求澄清记录
  - `refactoring-guides/` - 重构案例与迁移指南
  - `problem-solving/` - 故障排查与修复总结
  - `assets/` - 胶卷素材与资产索引

## 🤖 AI 工作流文档中心
- [`ai-workflow/`](ai-workflow/) - AI 工作流统一文档中心
  - [`workflow-guide.md`](ai-workflow/workflow-guide.md) - 6阶段标准流程和 Agent 速查
  - [`agent-roles.md`](ai-workflow/agent-roles.md) - 9 个 Agent 角色职责
  - [`quality-checklist.md`](ai-workflow/quality-checklist.md) - 质量检查清单体系
  - [`tracking-system.md`](ai-workflow/tracking-system.md) - 追踪与留痕系统
  - [`templates/`](ai-workflow/templates/) - 8 个工作模板（A-H）
  - **用途**: 统一 AI 协作流程与回溯记录

## 📋 其他文件

### 待整理文件
目前无。若有新草稿或临时记录，请在整理后移入 `archive/` 或知识库。

### 已归档文件
这些文件内容已整合，已移动到 `archive/legacy/` 目录：
- `快速参考指南.md` ✅ 已整合到 `ai-workflow/workflow-guide.md`
- `质量检查清单.md` ✅ 已整合到 `ai-workflow/quality-checklist.md`
- `项目规范总览.md` ✅ 内容已整合到 `ai-workflow/` 各文档

## C. 已归档（2025-10-22）

## 📂 目录结构

```
docs/
├── README.md                    # 📖 文档总索引（本文件）
├── specifications/              # 📋 规范文档（API、需求）
├── design/                     # 🎨 设计文档（前端、数据库）
├── guides/                     # 📚 指南文档（部署、开发计划）
├── ai-workflow/               # 🤖 AI工作流文档（已整理）
├── archive/                    # 📦 归档文档（按月份+legacy 分类）
├── knowledge-base/            # 💡 知识库（含最佳实践）
└── work-plans/               # 📅 工作计划
```

---

## ✅ 整理完成说明

- ✅ **2025-10-28**: AI 工作流文档已整理到 `ai-workflow/`
- ✅ **2025-10-28**: 规范文档已整理到 `specifications/`
- ✅ **2025-10-28**: 设计文档已整理到 `design/`
- ✅ **2025-10-28**: 指南文档已整理到 `guides/`
- ✅ **2025-11-12**: 知识库统一至 `knowledge-base/`，归档目录按年月与 legacy 重组

**整理目标**: 保持 docs/ 根目录文件数量最少，所有文档按类型归类到子目录。  
