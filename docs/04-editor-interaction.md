# 拼豆生成 — 编辑器交互手册

> 描述 EditorScreen 的工具集、画布交互、撤销栈、AI 输入面板、保存与发布的所有交互细节。
> 受众：客户端工程师、产品经理、QA。
> 实现位置：`frontend/src/screens/create/EditorScreen.tsx`（832 行）。

## 一、入口与初始化

### 1.1 入口参数

EditorScreen 通过 React Navigation 路由参数接收：

```typescript
type EditorParams = {
  mode: 'manual' | 'image' | 'ai';   // 创作模式
  cols: number;                       // 网格列数（建议 16/24/32）
  rows: number;                       // 网格行数
};
```

### 1.2 各模式的初始化行为

| mode | 初始动作 |
|---|---|
| `manual` | 直接进入空画布（`createEmptyGrid` 全 transparent），不显示生成 loading |
| `image` | 显示 1.5s 的 mock loading，然后用本地预制图填充（**待真实化**）|
| `ai` | 显示 prompt 输入面板（`showAiInput=true`），等待用户输入 |

实现：`EditorScreen.tsx:137-144` 的 `useEffect`。

## 二、工具栏

四个工具，单选互斥；切换工具不影响画布数据。

| 工具 | key | icon | 行为 |
|---|---|---|---|
| **画笔** | `pen` | `edit-3` | 把当前 cell 改为当前色 |
| **橡皮** | `eraser` | `x-circle` | 把当前 cell 改为 `transparent` |
| **填充** | `fill` | `droplet` | 4 邻接 flood fill：从点击 cell 出发，把所有同色相连区域改为当前色 |
| **吸管** | `picker` | `crosshair` | 读当前 cell 的颜色，自动设为"当前色"，并切回 `pen` |

实现：

- 工具应用：`EditorScreen.tsx:195` 起 `applyTool()`
- 填充算法：`EditorScreen.tsx:51` 起 `floodFill()` （非递归栈，避免大面积时爆栈）

### 2.1 工具切换的副作用

- `picker` 取色后**自动切回 `pen`**：连续吸不同色的体验差，吸完后大概率要画
- 切到 `eraser` / `fill` 时，"当前色" 仍保留（方便快速切回画笔继续画原来那色）

### 2.2 缺失的工具（路线图）

- 矩形 / 圆形选区
- 复制 / 粘贴选区
- 镜像（水平/垂直翻转）
- 旋转 90°
- 移动整图

## 三、调色板 UI

24 色按 4 行 × 6 列展示，单击切换"当前色"，被选中色有外框高亮。

- 调色板色码定义：`PALETTE_ROWS`（`EditorScreen.tsx:22-28`）
- 默认选中第一个色 `#EF4444`
- 切换色不影响当前工具

## 四、画布交互

### 4.1 触摸 → 单格

`onResponderGrant`：

```
pageX, pageY (屏幕坐标)
   │
   │ - canvasLayout.x/y     (画布在屏幕里的位置)
   ▼
localX, localY
   │
   │ / (cellSize + gap)     (gap = 1 if 显示网格线 else 0)
   ▼
[row, col]
   │
   ▼ applyTool(row, col, currentGrid)
```

实现：`touchToCell` (L184) + `applyTool` (L195)。

### 4.2 拖拽连续绘画

按下后，手指滑过的所有格子都按同样的工具应用（笔 / 橡皮）；填充和吸管不连续触发。

```typescript
const drawingRef = useRef(false);
const lastCellRef = useRef<string | null>(null);   // "row,col"，去重避免同一格反复 setState
```

**关键优化**：拖拽时禁用 ScrollView 滚动 (`setScrollEnabled(false)`)，否则上下滑会被 ScrollView 抢走。

### 4.3 网格线开关

`showGridLine` 切换：
- 开（默认）：每格之间 1px 间隔
- 关：格子贴在一起（更接近"成品"观感）

切换会改变 `cellSize` 计算（gap=1 vs gap=0）。

### 4.4 cellSize 自适应

```typescript
const canvasW = screenW - PAD * 2 - wp(24);
const cellSize = Math.min(
  Math.floor((canvasW - gap * (cols - 1)) / cols),
  wp(28)
);
```

- 总宽度自适应：屏幕宽 - 左右 padding - 卡片内边距
- 每格上限 `wp(28)`（约 28dp 宽）：避免在大屏 / 横屏时格子过大不像素艺术

## 五、撤销 / 重做（History）

### 5.1 双栈实现

```typescript
const [history, setHistory] = useState<string[][][]>([]);  // 撤销栈
const [future,  setFuture]  = useState<string[][][]>([]);  // 重做栈
const MAX_HISTORY = 30;
```

### 5.2 行为

- **每次有效写入** → push 当前 grid 到 history，清空 future
- **撤销** → history pop，把当前 grid push 到 future
- **重做** → future pop，把当前 grid push 到 history
- **超过 30 步**：丢弃最旧的（`h.slice(-MAX_HISTORY)`）

**已知边界 case**：

- 拖拽连续绘画时，**整段拖拽算一次历史**（按下时记录起始 grid，松手后再 push），而不是每格一条 history。
  - 实现位置：`pushHistory` 仅在 `onResponderRelease` 时调用一次
- `picker` 模式不写历史（只是读色，不改 grid）

### 5.3 清空画布

`clearCanvas()` → `pushHistory(createEmptyGrid(cols, rows))`，清空也是一次正常的可撤销操作。

### 5.4 缺失的历史能力（路线图）

- 跨进程持久化（关 App 后再打开仍能撤销）
- 命名快照（"我标记一下这个版本"）
- 历史时间轴回放

## 六、AI 输入面板

### 6.1 触发

`mode === 'ai'` 进入时自动展示；用户也可在编辑过程中点"AI 生成"按钮重新唤起。

### 6.2 交互

```
┌──────────────────────────────────┐
│  描述你想要的图案                │
│                                  │
│  [ 文本输入框 ]                  │
│                                  │
│  ┌──────────┐  ┌──────────┐     │
│  │  取消    │  │  生成 ▶  │     │
│  └──────────┘  └──────────┘     │
└──────────────────────────────────┘
```

实现：`EditorScreen.tsx:167` 起 `handleAiGenerate`。

### 6.3 状态机

```
idle ─[输入] → typing ─[点生成] → generating
                                    │
                                    ├─ 成功：grid 替换画布；面板关闭
                                    └─ 失败：fallback 到 mock；面板关闭；显示 toast
```

### 6.4 失败处理

后端调用失败时（豆包超时、密钥未配置、网络中断），前端回退到 `generateMockPattern`，并显示提示"生成失败，已使用本地图案"。

> 这条规则避免用户面对空白画布；但需要清晰提示用户这不是 AI 生成结果，避免误以为 AI 出图就这水平。

## 七、保存与发布

### 7.1 保存草稿

工具栏右上角"保存"按钮：

```typescript
POST /designs
{
  "title": "未命名",
  "description": "",
  "category": "其他",
  "designData": JSON.stringify({version, cols, rows, grid, palette, meta}),
  "status": "DRAFT"
}
```

### 7.2 编辑已有作品

进入 EditorScreen 时如果路由参数带 `designId`，则：
- 拉 `GET /designs/public/{id}` 拿 designData
- 反序列化 grid 到画布
- 保存改走 `PUT /designs/{id}`

> **当前状态**：编辑已有作品的入口尚未在 UI 上接通，路由参数只支持新建。建议在 MyDesignsScreen 的卡片上加"编辑"动作。

### 7.3 发布作品

完成后弹层"发布"：

```
PUT /designs/{id}
{
  "title": "...",
  "description": "...",
  "category": "...",
  "status": "PUBLISHED"
}
```

发布后立即出现在公开列表 `/designs/public/list`。

### 7.4 上架图纸（卖钱）

发布作品后，如果想收钱：

```
POST /patterns/publish
{
  "designId": 123,
  "title": "我的可爱小猫",
  "description": "16x16，适合新手",
  "category": "动物",
  "price": 9.9,         // ≤ 0 自动免费
  "cols": 16,
  "rows": 16
}
```

## 八、性能与边界

### 8.1 渲染优化

- 单格组件用 `React.memo`，颜色或选中态变化才 re-render
- 大尺寸 grid（如 64×64）→ 4096 格，不优化会卡
- 撤销栈最大 30 步 × 64×64 = 12 万 cell（~0.5 MB 内存）→ 可接受

### 8.2 已知性能边界

- ≤ 32×32：流畅
- 48×48：可用，拖拽偶有掉帧
- 64×64：建议关闭网格线、降低撤销栈深度
- 96×96+：需要切到 RN-skia / canvas，逐格 View 渲染会爆

### 8.3 大尺寸支持（路线图）

参见路线图"大尺寸画布"项；底层渲染要从 RN View 矩阵切到 RN-skia / Canvas。

## 九、可访问性 / 国际化

### 9.1 当前

- 工具按钮带 `label`（"画笔" / "橡皮" / ...），但没显式 `accessibilityLabel`
- 颜色块没有可读名（盲用户只能感知到位置，无法知道颜色）

### 9.2 建议

- 给每色加 `accessibilityLabel`（"鲜红色 #EF4444"）
- 给工具按钮加 `accessibilityHint`（"双击切换为画笔工具"）
- 后续国际化把所有中文文案抽到 i18n 字典

## 十、震动反馈（Haptics）

- 切换工具 / 颜色：`hapticSelection()` 轻微震动
- 完成生成：`hapticLight()`
- 实现：`hooks/useFeedback.ts`（已封装 `expo-haptics`）

> 这些反馈仅在 iOS / Android 物理设备生效，Web 与模拟器无效。

## 十一、键盘快捷键（Web）

> 当前未实现，建议路线图加入：

| 键 | 动作 |
|---|---|
| `B` | 画笔 |
| `E` | 橡皮 |
| `G` | 填充（Bucket） |
| `I` | 吸管 |
| `Cmd/Ctrl + Z` | 撤销 |
| `Cmd/Ctrl + Shift + Z` | 重做 |
| `Cmd/Ctrl + S` | 保存 |
| `空格` | 临时切换为吸管 |
| 数字 1-6 | 切换调色板第 N 色 |

实现位置建议在 `EditorScreen` 顶层 `useEffect` 注册 `window.addEventListener('keydown', ...)`，仅在 `Platform.OS === 'web'` 时生效。

## 十二、参考实现速查

| 段落 | 文件 / 行号 |
|---|---|
| 工具定义 | `EditorScreen.tsx:32-39` |
| 调色板 | `EditorScreen.tsx:22-28` |
| 撤销栈 | `EditorScreen.tsx:113-162` |
| 触摸坐标 | `EditorScreen.tsx:184-192` |
| flood fill | `EditorScreen.tsx:51-64` |
| AI 调用 | `EditorScreen.tsx:122-134` |
| 模式初始化 | `EditorScreen.tsx:137-144` |
