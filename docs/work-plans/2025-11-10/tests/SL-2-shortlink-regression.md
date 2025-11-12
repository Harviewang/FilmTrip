# SL-2 短链流程回归记录

- **日期**：2025-11-12
- **执行人**：Codex (GPT-5)
- **版本**：frontend `MapLibre` 短链修复、文档更新

## 1. 回归范围

| 模块 | 场景 | 预期 | 结果 |
| --- | --- | --- | --- |
| Gallery | 默认加载（访客） | 地址栏保持 `/gallery`，点击照片后写入 `/s/{code}`，关闭返回列表 | ✅ |
| Gallery | 旧链接 `/gallery?photo={uuid}` | 自动跳转 `/s/{code}`，关闭回到 `/gallery` | ✅ |
| Gallery | “隐藏加密图片”切换 | 勾选后立即过滤已加载数组，重拉完成后不再出现锁图 | ✅ |
| Timeline | 直接访问 `/timeline/{shortCode}` | 首次渲染即展示目标照片，关闭回到 `/timeline` | ✅ |
| Timeline | 旧链接 `/timeline?photo={uuid}` | 自动跳转 `/s/{code}` | ✅ |
| Map | 旧链接 `/map?photo={uuid}` | 页面加载后替换为 `/s/{code}`，关闭返回 `/map` | ✅ |
| Map | 多次切换标记 | 每次切换均写入新短链，关闭恢复初始路径 | ✅ |
| 短链直访 | 浏览器直接打开 `/s/{code}` | 解析成功，显示对应照片或加密提示 | ✅ |
| 加密照片 | 访客访问 `/s/{protected}` | 显示锁定提示，无原图 URL 返回 | ✅ |

## 2. 日志截取

```text
[Map][ShortLink] updateHistoryEffect {"mode":"replace","hasPushed":false,"replace":true,"id":"map-230512","shortCode":"ab12C"}
[Map][ShortLink] restoreHistoryPath {"path":"/map"}
```

```text
[Gallery][ShortLink] legacy query detected {"photoId":"45c5..."}
[Gallery][ShortLink] replace history with short link {"shortLink":"/s/xy9KQ"}
```

## 3. 待办 / 风险

- ❗ 若浏览器禁用历史 API，地址栏恢复逻辑会失效，需要另行提示。
- ❗ Map 页日志目前仅存于前端内存，建议在后端添加 API 以便批量收集。

## 4. 附件

- 调试截图、视频：见 `logs/shortlink/2025-11-12/`（待上传）。

