# 2025-10-25 Cursor 恢复指引

**目的**：上午由 Cascade AI 助手完成的前端预览体验调整被 Cursor 覆盖，本文档梳理所有改动点，便于 Cursor 在本地或云端恢复代码。涉及文件：

- `frontend/src/components/PhotoPreview.jsx`
- `frontend/src/index.css`
- `docs/work-plans/2025-10-24/summary.md`

---

## 1. PhotoPreview.jsx 期待状态

### 1.1 顶层容器
- 使用**静态低饱和度渐变背景**：
  ```jsx
  style={{
    background: 'linear-gradient(135deg, #e8f0f7 0%, #dce7f2 25%, #d0deec 50%, #c4d5e6 75%, #d0deec 100%)',
    transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)'
  }}
  ```
- 仅做 `opacity` 过渡，不再包含 `scale`/`translate`。
- 移除几何图形装饰及任何背景动画。

### 1.2 列表 → 预览动画
- 点列表打开预览时的淡入时间应为 **400ms**（由 800ms 调整）。
- 具体体现在图片元素的 `transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)'`。

### 1.3 预览模式切换（标准 ↔ 沉浸）
- **不再平移或缩放图片**，仅切换 UI 显隐。
- 删除 `transform`、`scale`、`translateY` 相关样式。
- `showChrome` 控制的工具栏和信息面板需保留 500ms 的淡入淡出，并在隐藏时加上 `pointer-events-none`。
- 工具栏/信息面板 className：
  ```jsx
  className={`... transition-all duration-500 ease-out ${
    showChrome ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
  }`}
  ```
  信息面板改为 `translate-y-8` 以保持离场空间。

### 1.4 图片样式
- 使用 `maxWidth/maxHeight + auto` 以保持比例：
  ```jsx
  style={{
    maxWidth: `${imageWidth}px`,
    maxHeight: `${imageHeight}px`,
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    opacity: imageLoaded ? 1 : 0,
    transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
    ...(viewMode === 'standard' ? {
      borderRadius: '16px',
      boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 20px 48px -8px rgba(0, 0, 0, 0.18), 0 12px 24px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)'
    } : {})
  }}
  ```
- 阴影需使用上述四层叠加效果，圆角保持 16px。

### 1.5 导航按钮
- 同步 500ms 过渡和 `pointer-events-none`，并确保隐藏时位移 8px：
  ```jsx
  className={`... duration-500 ease-out ${
    条件 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
  }`}
  ```

---

## 2. index.css 期待状态

- 保留 `@keyframes gradientShift`、自定义缓动变量 `--ease-*` 和 `.gpu-accelerated` 工具类。
- **删除** `@keyframes float1/float2/float3` 等几何浮动动画（恢复静态背景即可）。
- 代码片段应如下：
  ```css
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  :root {
    --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-in-smooth: cubic-bezier(0.4, 0, 1, 1);
    --ease-out-smooth: cubic-bezier(0, 0, 0.2, 1);
  }

  .gpu-accelerated {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: transform, opacity;
  }
  ```

---

## 3. 文档记录

- `docs/work-plans/2025-10-24/summary.md`
  - 表格中 P1-3 的状态应为 “进行中”，备注需写明：
    > 今日完成列表→预览动效加速、模式切换平滑化与静态背景优化；比例与设计复核待 Codex 确认。
  - “遗留事项/风险”中新增：
    > 预览视觉调整尚未经过 Codex/设计复核，需确认比例（80%/90%）与最终配色方案。

---

## 4. 恢复建议步骤

1. **更新 PhotoPreview.jsx**
   - 参考第 1 节逐项对照现有文件，恢复样式与动画设置。
   - 移除所有 `scale-90 translate-y-8`、`scale-95`、固定 `width/height` 等逻辑。

2. **更新 index.css**
   - 删除浮动动画定义。
   - 保留渐变动画、缓动变量与 GPU 工具类。

3. **校验 UI**
   - 打开本地预览，确认：
     - 列表→预览淡入 < 500ms。
     - 切换标准/沉浸模式时图片不抖动、不移动。
     - 背景为静态低饱和度蓝灰渐变。

4. **更新文档**
   - 确保 `summary.md` 中的任务状态/风险同步。

---

## 5. 洞察与后续

- 当前改动未触及业务逻辑，仅影响 UI 表现与文档。
- 若设计团队提供新稿，建议在 `docs/work-plans/2025-10-25/` 继续补充设计确认记录，以便追踪来源。
- Cursor 恢复后请保留本文件，供后续审计使用。
