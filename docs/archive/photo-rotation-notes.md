# FilmTrip 预览视图：旋转后的等比自适应（长边=80%）最佳实践

目标：无论横竖与是否旋转，图片在视口内始终让“长边=视口对应轴的 80%（或 100% 沉浸）”，短边按等比计算，并横竖居中显示。

你试过 PhotoSwipe / lightGallery 效果不理想，因此希望以可控实现交给 Cursor。

## 1. 常见问题与根因

1. **同时设置 `max-width` 与 `max-height`**  
   浏览器会同时满足两者 → 取更“紧”的那个，导致旋转后忽大忽小（横图转竖被过度压缩、竖图转横又显得过大/过小）。
2. **把宽度绑定到 `vh` 或高度绑定到 `vw`**  
   例如 `${80 * aspect}vh`。旋转后可视包围盒（bounding box）变化，易触发“夹逼”缩放。
3. **用 `transform: rotate()` 旋转视觉，但计算尺寸仍用未旋转的宽高**  
   旋转后的包围盒与计算用比例不一致，进一步放大误差。

## 2. 推荐实现路线

### 路线 A（强推荐）：JS 精算尺寸 + 仅设置 `width`/`height`（px）

**原则：**

- 归一化角度（90/270° 视作宽高交换）。
- 以旋转后的宽高比在 `viewport * ratio` 的盒子中做“装箱”（boxing）：长边贴 80%，短边等比；若短边因此超过另一轴 80%，再反向贴边一次。
- 只给像素 `width`/`height`；旋转仅交给 `transform`。不要再叠加 `max-*`。

**封装函数（TS/JS 通用，可直接拷贝）：**

```ts
type ViewMode = 'standard' | 'immersive';

/**
 * 计算旋转后的等比尺寸，使长边贴视口 80%（沉浸=100%），短边自适应
 */
export function getFittedSizeAfterRotate(
  imgWidth: number,
  imgHeight: number,
  rotateDeg: number,
  viewMode: ViewMode = 'standard',
  viewport?: { width?: number; height?: number }
): { width: number; height: number } {
  if (!imgWidth || !imgHeight) return { width: 0, height: 0 };

  // 规范角度到 [0, 360)
  const norm = ((rotateDeg % 360) + 360) % 360;
  const swapped = norm === 90 || norm === 270;

  // 旋转后用于装箱的宽高
  const rw = swapped ? imgHeight : imgWidth;
  const rh = swapped ? imgWidth : imgHeight;
  const ar = rw / rh; // 旋转后宽高比

  // 目标比例：沉浸=100%，标准=80%
  const MAX_W_RATIO = viewMode === 'immersive' ? 1 : 0.8;
  const MAX_H_RATIO = viewMode === 'immersive' ? 1 : 0.8;

  const vw =
    viewport?.width ??
    (typeof window !== 'undefined' ? window.innerWidth : 0);
  const vh =
    viewport?.height ??
    (typeof window !== 'undefined' ? window.innerHeight : 0);

  const maxW = vw * MAX_W_RATIO;
  const maxH = vh * MAX_H_RATIO;

  let width: number;
  let height: number;

  if (ar >= 1) {
    // 横向图（旋转后）
    width = Math.min(maxW, maxH * ar);
    height = width / ar;
    if (height > maxH) {
      height = maxH;
      width = height * ar;
    }
  } else {
    // 竖向图（旋转后）
    height = Math.min(maxH, maxW / ar);
    width = height * ar;
    if (width > maxW) {
      width = maxW;
      height = width / ar;
    }
  }

  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height)),
  };
}
```

**React 组件中的用法：**

```tsx
import { useEffect, useState } from 'react';
import { getFittedSizeAfterRotate } from './fit';

export function PhotoPreview({
  src,
  naturalWidth,
  naturalHeight,
  rotateDeg,
  viewMode = 'standard',
}: {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  rotateDeg: number; // 允许任意整数角度
  viewMode?: 'standard' | 'immersive';
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const recalc = () => {
    setSize(
      getFittedSizeAfterRotate(
        naturalWidth,
        naturalHeight,
        rotateDeg,
        viewMode,
        { width: window.innerWidth, height: window.innerHeight }
      )
    );
  };

  useEffect(() => {
    recalc();
    const onResize = () => {
      // 可用 rAF 或节流
      window.requestAnimationFrame(recalc);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [naturalWidth, naturalHeight, rotateDeg, viewMode]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        background: 'var(--stage-bg, #f4f6f8)',
      }}
    >
      <img
        src={src}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          objectFit: 'contain',
          transform: `rotate(${rotateDeg}deg)`,
          transformOrigin: 'center center',
        }}
        alt=""
      />
    </div>
  );
}
```

> 重点：不要再给图片 `max-width`/`max-height`，避免二次约束导致的“旋转后变小/变大”。

### 路线 B（零 JS、够用即可）：CSS 容器 80% + `object-fit: contain`

- 优点：实现简单，不写 JS。
- 缺点：90/270° 旋转时最长边可能达不到“恰好 80%”（只保证不超过）。

```html
<div class="stage">
  <img class="photo" src="..." />
</div>
```

```css
.stage {
  width: 80vw;
  height: 80svh; /* 移动端用 svh 更稳 */
  display: grid;
  place-items: center;
  overflow: hidden;
}

.photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform: rotate(var(--deg, 0deg));
  transform-origin: center center;
}
```

旋转时仅更新 `--deg`。该方案不会超界，但不是严格“长边=80%”。

## 3. 与第三方库的取舍

PhotoSwipe / lightGallery 内部装箱策略与“路线 A”类似，但当我们自定义旋转按钮或改变容器策略、存在边距动画/缩放边界时，视觉与触发点可能与你的“严格 80%”期望略有偏差。

- 需要最强可控性与一致性：自己实现（路线 A）。
- 需要手势缩放、动效、键鼠/触屏事件全家桶：库 + 少量定制。

## 4. 实现细节与坑位清单

- ✅ 只设置 `width`/`height`（px）；旋转仅用 `transform`。
- ✅ 监听 `resize` / 图片加载后重算；节流或 `requestAnimationFrame`。
- ✅ 外层容器用 `display: grid; place-items: center;` 居中最省心。
- ✅ 移动端建议用 `svh` / `lvh`（避免地址栏收缩导致 `vh` 跳动）。
- ✅ 90/270° 时**交换宽高（或取倒数宽高比）**再装箱。
- ❌ 不要同时设置 `max-width` 和 `max-height`。
- ❌ 不要把宽度绑定到 `vh` 或把高度绑定到 `vw`。

## 5. 最小可复用接口（给 Cursor）

- `getFittedSizeAfterRotate(imgW, imgH, deg, viewMode, { width?, height? }) → { width, height }`
- 图片样式：`width`/`height`（px） + `object-fit: contain` + `transform: rotate(deg)`
- 容器样式：`100vw × 100vh` + `display: grid; place-items: center; overflow: hidden`
- 窗口变化与角度变化时调用一次 `getFittedSizeAfterRotate` 重算。

如有需要，可以进一步把现有组件改成“开箱即用”的版本（保留原有 `viewMode`、按钮与日志），再补一段 `useMeasure()` 封装，便于后续加入缩放手势。
