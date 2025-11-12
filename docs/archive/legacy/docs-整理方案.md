# docs/ 目录整理方案

## 📋 当前问题

docs/ 根目录下有大量零散文件，不够清晰：
- `快速参考指南.md` - ✅ 已整合到 `ai-workflow/`
- `质量检查清单.md` - ✅ 已整合到 `ai-workflow/`
- `项目规范总览.md` - ✅ 内容已整合到 `ai-workflow/`
- `API规范-统一版.md` - 需要整理
- `前端设计规范.md` - 需要整理
- `数据库设计.md` - 需要整理
- `需求文档-统一版.md` - 需要整理
- `部署指南.md` - 需要整理
- `密钥管理指南.md` - 需要整理
- `开发计划.md` - 需要整理
- `文档整理计划.md` - 需要整理
- `项目文件整理指南.md` - 需要整理
- `ok_data_level3.csv` - 数据文件，需要移动

## 🎯 整理方案

### 方案A: 按文档类型分类（推荐）

```
docs/
├── README.md                              # 文档索引（保持）
├── ai-workflow/                           # AI工作流文档✅
├── specifications/                        # 规范文档（新）
│   ├── API规范-统一版.md
│   ├── 需求文档-统一版.md
│   └── README.md
├── design/                               # 设计文档（新）
│   ├── 前端设计规范.md
│   ├── 数据库设计.md
│   └── README.md
├── guides/                                # 指南文档（新）
│   ├── 部署指南.md
│   ├── 密钥管理指南.md
│   ├── 开发计划.md
│   └── README.md
├── archive/                               # 归档文档✅
├── knowledge-base/                        # 知识库✅
├── best-practices/                        # 最佳实践✅
└── work-plans/                           # 工作计划✅
```

### 方案B: 扁平化分类（简化）

```
docs/
├── README.md                              # 文档索引
├── ai-workflow/                           # AI工作流
├── technical-docs/                        # 技术文档（新）
│   ├── API规范-统一版.md
│   ├── 前端设计规范.md
│   ├── 数据库设计.md
│   ├── 部署指南.md
│   └── README.md
├── project-docs/                          # 项目文档（新）
│   ├── 需求文档-统一版.md
│   ├── 开发计划.md
│   ├── 密钥管理指南.md
│   └── README.md
├── archive/                               # 归档
├── knowledge-base/                        # 知识库
└── work-plans/                           # 工作计划
```

## ✅ 推荐方案

**推荐方案A**，因为：
1. ✅ 分类更清晰 - 规范、设计、指南分开
2. ✅ 职责明确 - 每个目录的用途清楚
3. ✅ 便于维护 - 新文档按类型放入对应目录
4. ✅ 便于查找 - 知道文档类型就能快速定位

## 📝 具体操作

### 1. 创建新目录
```bash
mkdir -p docs/specifications
mkdir -p docs/design
mkdir -p docs/guides
```

### 2. 移动文件
```bash
# 规范文档
mv docs/API规范-统一版.md docs/specifications/
mv docs/需求文档-统一版.md docs/specifications/

# 设计文档
mv docs/前端设计规范.md docs/design/
mv docs/数据库设计.md docs/design/

# 指南文档
mv docs/部署指南.md docs/guides/
mv docs/密钥管理指南.md docs/guides/
mv docs/开发计划.md docs/guides/

# 归档已整合的文档
mv docs/快速参考指南.md docs/archive/
mv docs/质量检查清单.md docs/archive/
mv docs/项目规范总览.md docs/archive/
```

### 3. 更新索引
更新 `docs/README.md`，添加新目录的说明

### 4. 创建子README
为每个新目录创建 README.md 说明文档用途

## 🎯 最终目标

```
docs/
├── README.md                    # 总索引
├── specifications/              # 规范文档（3个文件）
├── design/                     # 设计文档（2个文件）
├── guides/                     # 指南文档（3个文件）
├── ai-workflow/               # AI工作流（6个文件+模板）
├── archive/                    # 归档文档
├── knowledge-base/            # 知识库
├── best-practices/           # 最佳实践
└── work-plans/               # 工作计划

根目录文件从 17个 → 1个 (README.md)
```

