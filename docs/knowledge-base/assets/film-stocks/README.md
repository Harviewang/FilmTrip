# Film Stocks Asset Index

最后更新：2025-11-12

## 目录结构

```
assets/
└── film-stocks/
    ├── README.md          # 当前说明
    ├── incoming/          # 待整理素材（可选）
    └── <brand>-<series>-<iso>-<suffix>.png
```

> 说明：历史素材仍位于 `backend/uploads/filmStocks/`，后续迁移时请将同名文件复制至本目录，并保留 `backend` 路径作为运行时依赖。迁移完成后更新下方登记表。

## 命名规则

- `kebab-case`，字段组成：`{brand}-{series}-{iso}-{resource}`。
- `resource` 使用 `package`（包装图）或 `roll`（卷体图）。
- 所有资源以 `.png` 为主（透明背景优先），如需其他格式请在 README 追加说明。

## 登记状态

| 短码 | 文件名（package） | 文件名（roll） | 迁移状态 | 备注 |
| --- | --- | --- | --- | --- |
| `ALIEN_FILM_CN400` | `alien-film-cn400-package.png` | `alien-film-cn400-roll.png` | 待迁移 | - |
| `FUJIFILM_PROVIA_100F` | `fujifilm-provia-100f-package.png` | _缺失_ | 待补齐 | 卷体图缺失 |
| `LOMOGRAPHY_COLOR_400` | _缺失_ | _缺失_ | 待补齐 | 无任何素材 |
| `YESSTAR_COLOR_200` | `yesstar-color-200-package.png` | _缺失_ | 待补齐 | 待补卷体图 |

> 完整列表请参考 `docs/knowledge-base/assets/胶卷素材清单-2025-11-07.md`。迁移完成后，在此表将 `迁移状态` 更新为“已迁移”，并附上校验日期以及上传人。

## 操作流程（建议）

1. 从 `backend/uploads/filmStocks/` 拷贝素材至 `docs/knowledge-base/assets/film-stocks/`。
2. 校验文件命名是否符合规则；必要时执行 `npm run lint:assets`（计划任务，尚未落地）。
3. 更新上述登记表、主清单与缺失记录。
4. 将素材纳入版本控制后再执行导入脚本，确保数据库、文档与文件目录保持一致。
