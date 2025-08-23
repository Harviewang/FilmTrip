# 存储与命名策略（推荐）

- 原图：`objects/{sha256}/o.{ext}`
- LQIP：`objects/{sha256}/lqip.jpg`
- 多尺寸：`objects/{sha256}/{w}.webp`（w ∈ 256,1024,2048）
- 可选 EXIF：`objects/{sha256}/exif.json`

访问：
- 公开图：`{CDN_BASE_URL}/objects/{sha256}/{w}.webp`
- 受保护：后端签名 URL（含过期时间），不直接公开读

缓存：
- 公开图：`max-age=31536000, immutable`
- 受保护图：短时签名，不缓存

备选：`rolls/{rollId}/{frameNumber}/{w}.webp`（不推荐，迁移/改名成本高）

