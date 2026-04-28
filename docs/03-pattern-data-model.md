# 拼豆生成 — 图纸数据模型

> 描述 Design / Pattern 两个核心实体的字段定义、`designData` JSON 结构、调色板存储、版本兼容、导入导出格式。
> 受众：后端工程师、客户端工程师、需要对接图纸数据的第三方。

## 一、实体关系

```
User ──┬─◇ Design   (我创作的草稿/已发布作品；私有)
       │     │
       │     └─◇ PatternListing  (上架图纸，引用 design_id)
       │              │
       │              └─◇ PatternPurchase (谁购买了谁；解锁下载权限)
       │
       └─◇ Favorite  (target_type=DESIGN/PATTERN, target_id)
       └─◇ Like      (同上)
```

- `Design` 是创作产物，私有 + 公开两种可见性
- `PatternListing` 是商品上架记录，**引用** Design（不是拷贝），所以 Design 删除 / 更新会影响已上架图纸 — 业务上要求 Design 上架后不允许 hard delete，仅逻辑删

## 二、Design 实体

### 2.1 表结构

文件：`backend/.../model/entity/Design.java`，表 `t_design`

| 列 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | BIGINT PK AUTO_INCREMENT | ✅ | |
| `user_id` | BIGINT | ✅ | 创作者 |
| `title` | VARCHAR(64) | ✅ | 标题 |
| `description` | VARCHAR(500) | | 简介 |
| `category` | VARCHAR(32) | | 分类标签（如「角色」「风景」） |
| `cover_image` | VARCHAR(500) | | 封面图 URL（缩略图）|
| `design_data` | TEXT / LONGTEXT | ✅ | **核心字段**：JSON 序列化的 grid + 元数据 |
| `status` | VARCHAR(16) | ✅ | `DRAFT` / `PUBLISHED` / `ARCHIVED` |
| `like_count` | INT | | 缓存的点赞数，由 LikeController 维护 |
| `view_count` | INT | | 浏览数 |
| `created_at` | DATETIME | | 自动 |
| `updated_at` | DATETIME | | 自动 |
| `deleted` | TINYINT | | `@TableLogic` 逻辑删 |

### 2.2 designData JSON 结构（建议规范）

> 当前实现把 `designData` 当字符串存，没有强 schema。下面是建议落地的版本：

```json
{
  "version": 1,
  "cols": 16,
  "rows": 16,
  "grid": [
    ["#EF4444", "#EF4444", "transparent", ...],
    ["transparent", "#FBBF24", "#FBBF24", ...],
    ...
  ],
  "palette": ["#EF4444", "#F87171", "..."],
  "meta": {
    "source": "ai",
    "prompt": "可爱的小猫咪",
    "originalImageUrl": "https://...",
    "createdBy": "editor-v1.0"
  }
}
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| `version` | int | 数据格式版本，用于将来扩展时的兼容判断 |
| `cols` / `rows` | int | 网格尺寸（必须等于 `grid[].length` 与 `grid.length`） |
| `grid` | string[rows][cols] | 二维数组；每元素为 hex 颜色或字面量 `"transparent"` |
| `palette` | string[] | 该图实际用到的颜色子集（用于前端图例 / 备料计算）|
| `meta.source` | string | `manual` / `image` / `ai` — 用于产品分析 |
| `meta.prompt` | string \| null | AI 生成时记录原始 prompt |
| `meta.originalImageUrl` | string \| null | image 或 ai 模式来源图，方便回溯 |
| `meta.createdBy` | string | 客户端版本，便于排查历史问题 |

### 2.3 grid 格式的不变量

**任何写入 `designData` 的代码都必须保证**：

1. `grid.length === rows && grid[i].length === cols`（矩阵规整）
2. 每个 cell 要么是 `"transparent"`，要么是 7 字符的 hex（`#RRGGBB`，不接受短形 `#RGB`）
3. hex 必须**全大写**（统一便于比对、去重、入库索引）
4. `palette` 是 `grid` 中实际出现的非 transparent 颜色去重后的集合，由后端在保存时计算（而不是信任客户端）

> 上述规范当前**没有强校验**，是下一步要补的（见路线图 "图纸数据校验" 项）。

### 2.4 状态机

```
   ┌──────┐  PUT /designs/{id} status=PUBLISHED   ┌───────────┐
   │ DRAFT │ ────────────────────────────────────▶│ PUBLISHED │
   └──────┘                                        └─────┬─────┘
       ▲                                                │
       │                                                ▼
       └───────  PUT /designs/{id} status=DRAFT  ────  归档/重新草稿
                                                       │
                                                  ┌────▼─────┐
                                                  │ ARCHIVED │ 用户主动归档，不再在公开列表展示
                                                  └──────────┘
```

- DRAFT：仅作者本人 `/designs/my` 可见
- PUBLISHED：进入 `/designs/public/list`
- ARCHIVED：不在公开列表，但作者历史里仍可访问 / 复制

## 三、PatternListing 实体

### 3.1 表结构

文件：`backend/.../model/entity/PatternListing.java`，表 `t_pattern_listing`

| 列 | 类型 | 说明 |
|---|---|---|
| `id` | BIGINT PK | |
| `user_id` | BIGINT | 卖家（= 原作者）|
| `design_id` | BIGINT | 引用 Design，**软关联**，不加外键 |
| `title` | VARCHAR(64) | 上架时可以独立修改，与 Design.title 解耦 |
| `description` | VARCHAR(500) | 上架文案 |
| `category` | VARCHAR(32) | |
| `price` | DECIMAL(10,2) | 拼豆币 / 元 |
| `is_free` | TINYINT | `price ≤ 0` 时自动置 1 |
| `cols` | INT | 冗余字段（来源于 Design.designData） |
| `rows` | INT | 冗余字段 |
| `preview_data` | TEXT | 给图纸市场卡片用的低分辨率预览（可选）|
| `downloads` | INT | 下载次数（含购买）|
| `rating` | DECIMAL(3,2) | 评分，默认 5.0 |
| `status` | VARCHAR(16) | `ACTIVE` / `OFFLINE` / `BANNED` |
| ... 时间 / 软删 | | |

### 3.2 解耦设计

**为什么 PatternListing 不直接拷贝 grid 而是引用 Design？**

| 方案 | 优点 | 缺点 |
|---|---|---|
| **A. 引用 Design**（当前）| 数据单一来源，作者修改图自动同步 | 删除/改 Design 会影响已售图纸（业务上需限制改动）|
| B. 上架时拷贝 grid | 完全隔离，作者后续修改不影响买家 | 数据冗余；图纸市场表会变得很大 |

> 当前选 A，但需要业务约束：**已上架的 Design 不允许修改 cols/rows/grid**，只能改 title/description/cover。这条约束**目前没有强制**（见路线图）。

## 四、版本兼容

### 4.1 兼容策略

`designData.version` 字段读出来后按版本分支处理：

```java
JsonNode root = mapper.readTree(designData);
int version = root.path("version").asInt(1);  // 缺省值 1（老数据）
switch (version) {
  case 1: return parseV1(root);
  case 2: return parseV2(root);
  default: throw new BusinessException(400, "不支持的图纸版本: " + version);
}
```

### 4.2 历史数据迁移

老数据（无 `version` 字段）默认按 v1 解析。如果未来需要批量升级（比如从 v1 → v2 加字段），写一个一次性迁移脚本：

```java
// 伪代码
designRepo.selectList(null).stream().forEach(d -> {
  JsonNode old = mapper.readTree(d.getDesignData());
  ObjectNode upgraded = upgradeV1ToV2(old);
  d.setDesignData(upgraded.toString());
  designRepo.updateById(d);
});
```

### 4.3 客户端兼容

- 客户端读到 `version` 高于自己已知 → 显示"请升级 App 查看此图纸"
- 客户端读到无 `version` → 当 v1 处理（向下兼容）
- 客户端永远写**自己版本**的数据，不要篡改更高版本字段

## 五、导入 / 导出格式

### 5.1 当前支持

| 方向 | 格式 | 状态 |
|---|---|---|
| AI 生图 → grid | 内部转换 | ✅ |
| 图片 → grid | image 模式 | ⚠️ 前端 mock，后端待建 |
| grid → 数据库 | designData JSON | ✅ |
| grid → 渲染 | 前端 BeadGrid 组件 | ✅ |

### 5.2 待支持的格式

#### a. PNG 导出

把 grid 渲染成图片下载。两种实现：

- **前端**：`react-native-view-shot` 截屏 BeadGrid 组件 → 导出 PNG
- **后端**：新增 `GET /designs/{id}/export?format=png&scale=20` —— 服务端用 `BufferedImage` 把每个格子画成 `scale × scale` 像素方块

后端方案适合做高分辨率导出（打印用），前端方案适合分享到社交。

#### b. PDF 导出（含商家色卡）

`GET /designs/{id}/export?format=pdf&vendor=hama`

PDF 包含：
1. 全图预览（高清）
2. 网格化对照图（每格写坐标 A1, A2, ..., 方便照着摆豆）
3. 颜色清单：每色 hex + 商家货号 + 数量（用于备料）
4. 二维码（深链接回 BeadForge）

技术选型：iText 7 / Apache PDFBox。

#### c. JSON 互通格式

直接导出 `designData` JSON 给第三方：

```
GET /designs/{id}/export?format=json
Content-Disposition: attachment; filename="design-123.beadforge.json"
```

文件首字段固定 `"format":"beadforge.design"` + `"version":1`，方便其他工具识别。

#### d. 第三方导入

支持从其他主流工具的格式导入：
- Hama PSD（每色一图层）：靠图层名映射 hex
- 通用 PNG：等同于 image 模式上传
- 表格/CSV：每个 cell 是 hex 字符串

## 六、调色板存储

### 6.1 当前

- 24 色硬编码在前后端代码里
- `Design.designData.palette` 字段记录"该图实际用了哪些色"

### 6.2 建议演进

把调色板做成**数据库可配置**：

```sql
CREATE TABLE t_palette (
  id BIGINT PRIMARY KEY,
  name VARCHAR(64),       -- '24 色家用款'
  size INT,               -- 24 / 36 / 64
  is_default TINYINT,     -- 同时只能有 1 个默认
  enabled TINYINT
);

CREATE TABLE t_palette_color (
  id BIGINT PRIMARY KEY,
  palette_id BIGINT,
  hex VARCHAR(7),
  display_order INT,
  hue_group VARCHAR(16),  -- 'red'/'orange'/...
  vendor_codes JSON       -- {"hama":"H22","perler":"P05","cn-default":"红"}
);
```

`Design.designData` 加字段 `paletteId`，记录这张图基于哪个调色板生成 / 编辑。

好处：
- 运营可在线扩 64 色 / 上线节日特别款
- 不同调色板独立维护商家色卡映射
- AI 生图按用户当前选择的调色板做匹配

## 七、Validation 校验（建议）

提供一个统一的校验工具：

```java
public class DesignDataValidator {
  public static void validate(String json, int expectedCols, int expectedRows) {
    JsonNode root = MAPPER.readTree(json);
    int cols = root.path("cols").asInt();
    int rows = root.path("rows").asInt();
    if (cols != expectedCols || rows != expectedRows)
      throw new BusinessException(400, "尺寸不匹配");

    JsonNode grid = root.path("grid");
    if (!grid.isArray() || grid.size() != rows)
      throw new BusinessException(400, "grid 行数不正确");
    for (JsonNode row : grid) {
      if (!row.isArray() || row.size() != cols)
        throw new BusinessException(400, "grid 列数不正确");
      for (JsonNode cell : row) {
        String c = cell.asText();
        if (!"transparent".equals(c) && !c.matches("^#[0-9A-F]{6}$"))
          throw new BusinessException(400, "非法颜色: " + c);
      }
    }
  }
}
```

调用点：`DesignService.createDesign` / `updateDesign` 入口。

## 八、参考实现速查

| 文件 | 内容 |
|---|---|
| `entity/Design.java` | 主实体定义 |
| `entity/PatternListing.java` | 上架记录 |
| `entity/PatternPurchase.java` | 购买/下载记录 |
| `dto/DesignDTO.java` | 对外 DTO |
| `controller/DesignController.java` | CRUD 入口 |
| `controller/PatternController.java` | 发布 / 购买 / 已购列表 |
| `schema.sql` | 12 张表的 DDL |
