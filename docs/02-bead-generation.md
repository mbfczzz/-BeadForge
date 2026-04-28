# 拼豆生成 — 技术方案

> 覆盖 24 色调色板的设计依据、像素化算法、AI 生图调用链、性能与成本边界。
> 受众：后端 / 前端工程师、运营。

## 一、24 色调色板

### 1.1 当前色卡

按色相 + 饱和度排列，4 行 × 6 列，硬编码于后端 `AiController.PALETTE` 与前端 `EditorScreen.PALETTE_ROWS`。

| 行 | 色族 | Hex |
|---|---|---|
| 1 | 红 / 粉 | `#EF4444` `#F87171` `#FCA5A5` `#FDA4AF` `#F9A8D4` `#EC4899` |
| 2 | 橙 / 黄 | `#F97316` `#FB923C` `#FBBF24` `#FCD34D` `#FDE68A` `#FEF3C7` |
| 3 | 绿 / 蓝 | `#22C55E` `#16A34A` `#86EFAC` `#0EA5E9` `#7DD3FC` `#3B82F6` |
| 4 | 紫 / 中性 | `#8B5CF6` `#A78BFA` `#C4B5FD` `#1E1B2E` `#6B7280` `#FAFAFA` |

外加一个特殊值 `transparent` —— 表示该格不放豆。

### 1.2 设计依据

- **24 色**：常见家用拼豆套装（Hama / Perler / 国产）的入门款基本是 24 / 36 / 48 色，24 是最低公约数
- **行列布局**：方便前端用 `[6 列 × 4 行]` 调色板 UI 直接渲染
- **同色族多档明度**：让生成图保留层次感（如 #EF4444 → #F87171 → #FCA5A5 是同色族浅化）
- **明确黑白灰**：`#1E1B2E` 深紫黑、`#6B7280` 中灰、`#FAFAFA` 近白，避开纯黑纯白便于实物豆色匹配

### 1.3 与商家色卡的映射

> **状态**：未实现，已列入 06 路线图。

建议建表 `t_palette_mapping`：

```sql
CREATE TABLE t_palette_mapping (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  hex VARCHAR(7) NOT NULL,         -- '#EF4444'
  vendor VARCHAR(32) NOT NULL,     -- 'hama' / 'perler' / 'cn-default'
  vendor_code VARCHAR(32) NOT NULL,-- 'H22' / 'P05' / '红'
  vendor_name VARCHAR(64),         -- '正红'
  UNIQUE KEY (hex, vendor)
);
```

效果：用户导出图纸 PDF 时，每个 hex 旁边自动印商家货号 + 中文名，去店里直接报号买。

### 1.4 双端一致性

调色板**两份硬编码必须同步**：

- `backend/.../controller/AiController.java` 静态字段 `PALETTE`
- `frontend/src/screens/create/EditorScreen.tsx` 顶部 `PALETTE_ROWS`

> 长期建议改为后端单一源，通过 `/discovery/settings` 或新增 `/palette` 接口下发，前端启动拉取并缓存。

## 二、像素化算法

### 2.1 算法流程

```
原图 (任意尺寸)
   │
   ├─ 1. 双线性缩放到 cols × rows
   │     RenderingHints.VALUE_INTERPOLATION_BILINEAR
   │
   ├─ 2. 逐像素读 RGB
   │
   ├─ 3. 透明判定：
   │     R > 245 && G > 245 && B > 245  → "transparent"
   │
   ├─ 4. 非透明像素 → 调色板最近色
   │     欧氏距离最小：(r-pr)² + (g-pg)² + (b-pb)²
   │
   └─→ grid[rows][cols] = "#XXXXXX" | "transparent"
```

实现位置：`AiController.java` 第 95–117 行 + `nearestColor()` 方法。

### 2.2 算法选择理由

| 选项 | 选 / 不选 | 原因 |
|---|---|---|
| 双线性缩放 | ✅ | 平滑过渡，适合卡通 / 渐变图；保留层次 |
| 最近邻缩放 | ❌ | 块状感强但容易丢失细节，AI 生图本身锯齿就重 |
| 欧氏 RGB 距离 | ✅ | 实现简单，对当前 24 色够用 |
| 感知距离（CIEDE2000）| ⚠️ | 更接近人眼感知但实现复杂；色板扩到 64+ 时再换 |
| HSL 距离 | ❌ | 同色族明度差异敏感；不适合扁平像素艺术 |

### 2.3 透明判定的边界 case

当前阈值 `> 245` 偏激进，会把"接近白"也算透明：

- **AI 图**：通常背景纯白（prompt 里写了"纯色背景"），适用
- **用户上传**：白色物体（雪人、白狗）会丢失主体 — 已知缺陷

**改进方向**（image 模式真实化时）：

1. 让用户在前端裁剪时手动指定背景色
2. 或者用边缘检测 / GrabCut 分离前景
3. 或者最简单：增加一个 "保留白色" 开关，关掉就不做透明判定

### 2.4 失败回退

前端 `EditorScreen.doGenerate` 已有兜底逻辑：

```typescript
try {
  const result = await doubaoGenerate(prompt, cols, rows, PALETTE);
  if (result) { pushHistory(result); return; }
} catch {
  setGenError('生成失败，已使用本地图案');
}
pushHistory(generateMockPattern(cols, rows));   // ← 取本地预制图填充
```

`ALL_PATTERNS` 是前端 `components/common` 里几十个预制小图。这条 fallback 让 AI 失败时用户也不至于看到空白画布。

## 三、AI 生图（豆包 Seedream）调用链

### 3.1 完整时序

参见 `01-product-overview.md` 第 5.2 节时序图。关键步骤：

1. 前端 `doubaoGenerate(prompt, cols, rows)` → 后端 `/ai/generate-image`
2. 后端从 `t_api_config` 读 `doubao_api_key` / `doubao_model` / `doubao_base_url`
3. 拼 prompt：`"像素风格拼豆图案，简洁可爱，纯色背景，{user_prompt}"`
4. 调豆包 `POST {baseUrl}/images/generations`
5. 拿到 `imageUrl` → `ImageIO.read(URL)` 下载
6. 双线性缩放 → 像素化 → 返回 `grid` + `imageUrl`（imageUrl 给前端做"原图预览"用）

### 3.2 prompt 包装

后端固定加前缀：

```java
"像素风格拼豆图案，简洁可爱，纯色背景，" + prompt.trim()
```

效果：

- "像素风格" → 让 AI 主动出方块感图
- "简洁可爱" → 适合拼豆审美（豆子总数有限）
- "纯色背景" → 配合后续透明判定

> **可优化**：把这段前缀提到 `t_api_config` 里成为 `doubao_prompt_prefix`，运营可在线 A/B。

### 3.3 豆包请求参数

```json
{
  "model": "{doubao_model}",
  "prompt": "{包装后 prompt}",
  "response_format": "url",
  "size": "2K",
  "sequential_image_generation": "disabled",
  "stream": false,
  "watermark": false
}
```

- `size: "2K"`：返回大图，给后端缩放留余地；不要 1K，AI 在小尺寸出像素艺术容易糊
- `watermark: false`：避免水印干扰透明判定
- `stream: false`：图生成天然是 batch 形态，不需要流式

### 3.4 错误码与降级

| 场景 | 后端响应 | 前端降级 |
|---|---|---|
| 未登录 | `401 需要登录` | 拦截器跳登录 |
| prompt 为空 | `400 请输入图案描述` | UI 已经做了非空校验，理论不会触发 |
| AI Key 未配置 | `500 AI服务未配置` | 显示错误，不 fallback |
| 豆包返回非 200 | `500 AI生成失败` | fallback 到本地 mock 图 |
| 豆包超时 / 网络错 | `500 AI服务异常` | fallback 到本地 mock 图 |

## 四、性能与成本

### 4.1 性能

| 阶段 | 耗时 | 占比 |
|---|---|---|
| 豆包生图（外部） | 5–12s | ~85% |
| 后端下载图片 | 0.3–1.5s | ~5% |
| 缩放 + 调色板匹配（cols×rows × 24 次距离） | < 50ms | < 1% |
| 网络往返 | 0.2–0.5s | ~3% |

> 像素化本身不是瓶颈。只要 cols×rows ≤ 64×64，单图全流程 < 50ms 内完成像素化部分。

### 4.2 成本

豆包 Seedream 5.0 计价：

- 按调用次数计费（具体定价见火山方舟控制台）
- 一张 2K 图大概 ¥0.1–0.3 量级（具体随模型版本浮动）

**控制策略建议**（待实现）：

1. **每用户每日限次**：免费用户 5 次 / 日，会员 50 次
2. **prompt 去重缓存**：相同 prompt + size 24 小时内复用结果（建一个 `t_ai_cache` 表）
3. **失败不计费**：fallback 到 mock 时不扣用户额度
4. **VIP 优先级**：付费用户走单独的高 RPS 配额

## 五、图片转换（image 模式）

### 5.1 当前状态

前端 `EditorScreen.tsx:138` 的 image 模式是**假的**：

```typescript
if (mode === 'image') {
  const t = setTimeout(() => {
    pushHistory(generateMockPattern(cols, rows));   // ← mock
    setGenerating(false);
  }, 1500);
  return () => clearTimeout(t);
}
```

服务端没有对应接口，前端直接喂本地预制图。

### 5.2 真实化方案

**新增接口** `POST /image/pixelate`：

```
form-data:
  file: <multipart>      图片文件 (jpg/png/webp)
  cols: 16
  rows: 16
  bgColor: '#FFFFFF'     可选；指定背景色，自动透明
  preserveWhite: false   可选；保留白色不做透明判定

返回:
  { grid: [[hex,...]], width, height }
```

实现可以**直接复用** `AiController` 的像素化代码：

```java
// 伪代码
BufferedImage original = ImageIO.read(file.getInputStream());
BufferedImage scaled = resize(original, cols, rows);
String[][] grid = toGrid(scaled, bgColor, preserveWhite);
return ApiResponse.success(grid);
```

建议把缩放 + 像素化抽到 `service/ImagePixelService`，AI 和 image 两个 Controller 共用。

### 5.3 文件大小限制

- 客户端预压缩到 ≤ 2MB（Expo `ImageManipulator`）
- 服务端 multipart 限制 25MB / 100MB（已有 `application.yml`）
- 拒绝非图片 mime（已有 `UploadController.ALLOWED_EXT` 可抄）

## 六、扩展性预留

| 扩展点 | 预留位置 | 备注 |
|---|---|---|
| **64 色 / 96 色调色板** | `t_api_config` 加 `palette_size`；后端按规模选 PALETTE | 优先做对照商家色卡 |
| **CIEDE2000 距离** | `nearestColor()` 切换实现 | 色板大于 36 色时建议换 |
| **多模型 AI** | `t_api_config` 加 `ai_provider` 字段 | 当前只接豆包；预留 Stable Diffusion / DALL-E |
| **prompt 模板库** | 新表 `t_ai_prompt_template` | 让用户从模板（"二次元角色"/"像素风景"）起步 |
| **AR 实物预览** | 前端 expo-three / RN-skia | 远期 |

## 七、参考实现速查

| 文件 | 行号 | 内容 |
|---|---|---|
| `AiController.java` | L52–129 | `/ai/generate-image` 主流程 |
| `AiController.java` | L132–143 | `nearestColor()` 调色板匹配 |
| `AiController.java` | L32–37 | `PALETTE` 24 色定义 |
| `EditorScreen.tsx` | L22–28 | 前端 PALETTE_ROWS |
| `EditorScreen.tsx` | L122–134 | `doGenerate` 调豆包 + fallback |
| `doubao.ts` | 全文 | 前端 client 透传 |
