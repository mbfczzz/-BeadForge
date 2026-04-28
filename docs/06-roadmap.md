# 拼豆生成 — 路线图

> 不是 PRD，不是承诺时间表；是按"已完成 / 短期 / 中期 / 长期"分类的清单，方便排期讨论。

## 一、已完成 ✅

> 这些已经在生产代码里跑了，对应 `docs/feature-status.xlsx` 里的 ✅ 行。

### 1.1 创作能力
- [x] 24 色调色板（前后端硬编码）
- [x] 手动画布编辑（笔 / 橡皮 / 填充 / 吸管）
- [x] 撤销 / 重做（30 步）
- [x] AI 文生图：豆包 Seedream → 像素化 → grid
- [x] 像素化算法：双线性缩放 + 欧氏 RGB 最近色匹配
- [x] AI 失败 fallback 到本地 mock 图

### 1.2 数据持久化
- [x] Design 草稿 / 发布 / 归档状态机
- [x] designData JSON 字段（无 schema 校验）
- [x] PatternListing 上架与售卖
- [x] 购买记录与已购列表

### 1.3 周边
- [x] AI 调用密钥后端代理（不下发到客户端）
- [x] 管理后台 API Config 配置 + 脱敏 + reveal 审计

## 二、短期（接下来 1-2 周可做） 🔥

> 改动小、收益高、不需要架构变化。建议优先级排序。

### P0 — image 模式真实化
- [ ] 后端新增 `POST /image/pixelate`
- [ ] 抽 `ImagePixelService`，AiController 与新接口共用
- [ ] 前端 EditorScreen 的 image 模式从 mock 切到真实接口
- [ ] 透明判定加 `preserveWhite` 选项

**验收**：上传一张照片 → 进入编辑器看到拼豆化结果（而非随机 mock 图）。

### P0 — designData schema 校验
- [ ] 实现 `DesignDataValidator`（参见 03 数据模型 第七节）
- [ ] 在 DesignService 创建 / 更新入口调用
- [ ] grid 不规整、非法 hex、尺寸不匹配 → 400 拒绝

**收益**：避免脏数据混入数据库。

### P1 — AI 调用配额限制
- [ ] 在 `t_user` 加 `ai_quota_used_today` / `ai_quota_reset_at`
- [ ] AiController 入口先扣额度，失败回滚
- [ ] 普通用户 5 次/日，VIP 50 次/日

**收益**：控制豆包 API 成本。

### P1 — prompt 包装可配置
- [ ] 把 `"像素风格拼豆图案，简洁可爱，纯色背景，"` 前缀挪到 `t_api_config`
- [ ] 运营在 admin 后台可在线改

**收益**：A/B 测试不同 prompt 模板的效果。

### P2 — 调色板单一来源
- [ ] 后端新增 `GET /palette/default` 返回当前调色板
- [ ] 前端启动拉取，缓存到 AsyncStorage
- [ ] 删除前端硬编码 `PALETTE_ROWS`

**收益**：双端永远一致。

## 三、中期（1-2 月） 🎯

### M1 — 编辑已有作品
- [ ] EditorScreen 接受路由参数 `designId`
- [ ] MyDesignsScreen 卡片加"编辑"动作
- [ ] 保存走 `PUT /designs/{id}` 而非 `POST`

**当前**：进编辑器只能新建，老作品改不了。

### M2 — 大尺寸画布支持
- [ ] 切换底层渲染：48×48 起用 RN-skia，每格画 Rect 而非 View
- [ ] 撤销栈策略调整（按差量存储而非整 grid）
- [ ] 移动端内存监控

**目标**：64×64 流畅，96×96 可用。

### M3 — 商家色卡映射
- [ ] 建表 `t_palette_mapping`（hex × vendor → vendor_code）
- [ ] 数据收集 / 录入 Hama / Perler / 国产三套映射
- [ ] 详情页显示：每色旁边显示商家货号

### M4 — PNG / PDF 导出
- [ ] `GET /designs/{id}/export?format=png&scale=20`（高清渲染）
- [ ] `GET /designs/{id}/export?format=pdf&vendor=hama`（带色卡）
- [ ] 客户端"导出"按钮，长按直接保存到相册

### M5 — 图纸购买后才能看 grid
- [ ] DesignController 公开接口加权限校验：未购买 / 非作者 → 不返回 designData
- [ ] 改 `/designs/public/{id}` 行为；或新增 `/designs/locked/{id}` 返回脱敏版本（grid 留低分辨率预览）

### M6 — 完整工具集
- [ ] 矩形 / 圆形选区
- [ ] 复制 / 粘贴
- [ ] 镜像（水平/垂直）
- [ ] 整图旋转 90°

## 四、长期（3-6 月+） 🌅

### L1 — prompt 模板库
- [ ] 新表 `t_ai_prompt_template`（分类 + 标题 + prompt 文本 + 推荐网格尺寸）
- [ ] AI 模式起步页显示模板卡片：「Q 版人物」「像素风景」「Pokémon 风格」等
- [ ] 用户从模板出发，再补一句自定义 prompt

### L2 — 多模型 AI
- [ ] AI 服务抽象层 `AiImageProvider` 接口
- [ ] 实现：豆包（已有）/ 通义万相 / Stable Diffusion 自部署
- [ ] 运营在 admin 后台切换默认 provider

### L3 — 实物色卡识别（拍照查色）
- [ ] 用户拍下手头的拼豆 → 客户端识别每颗豆的颜色 → 返回最接近的调色板色
- [ ] 客户端用 ML Kit / Vision Camera 实现

### L4 — AR 实物预览
- [ ] 用 expo-three / react-native-skia 在 3D 平面上渲染拼豆图案
- [ ] iOS 走 ARKit，Android 走 ARCore
- [ ] 让用户在桌面看到 1:1 大小的成品效果

### L5 — 协作编辑
- [ ] WebSocket 实时同步多端 grid 变更
- [ ] 操作变换（OT）或 CRDT 处理冲突
- [ ] 教师模式：老师演示 → 学生跟着看

### L6 — 智能识图 → 自动转拼豆
- [ ] 用户上传"已有拼豆作品"照片
- [ ] 识别每颗豆位置 / 颜色 / 网格规模
- [ ] 还原为可编辑 grid

## 五、技术债 / 工程化 🔧

> 不是产品功能，但影响交付质量。

### T1 — 单元测试
- [ ] 后端：`AiController.nearestColor` / `floodFill` 之类纯函数补 JUnit 测试
- [ ] 前端：调色板 / 撤销栈用 React Testing Library
- [ ] CI 跑测试，pass 才合并 master

### T2 — 像素化抽 service
- [ ] `AiController` 里像素化逻辑挪到 `ImagePixelService`
- [ ] image 模式接口、AI 模式接口都依赖它
- [ ] 测试覆盖

### T3 — 文件存储 OSS 化
- [ ] `/uploads/**` 当前落本地磁盘，重启容器丢失
- [ ] 切到 MinIO 自部署 / 阿里云 OSS / 七牛
- [ ] `UploadController` 抽 `StorageService` 接口

### T4 — 全文档化错误码
- [ ] 现在错误信息散落在各 Controller `ApiResponse.error(400, "...")` 里
- [ ] 抽集中 `ErrorCode` 枚举，前端能按 code 做精确处理
- [ ] OpenAPI schema 标注每个接口可能返回的 code

### T5 — 调色板大小可选
- [ ] 当前 24 色硬编码
- [ ] 改为 `t_palette` 表 + 用户偏好
- [ ] AI 生图时按当前 palette 做匹配

### T6 — 前端 i18n
- [ ] 所有中文抽到 `i18n/zh.json`
- [ ] 配 `i18n-js` 或 `react-intl`
- [ ] 至少做英文版以打开海外市场

## 六、不做 / 拒绝 ❌

> 防止概念蔓延。

- ❌ 复杂图层系统（拼豆是单层像素艺术，不需要）
- ❌ 矢量编辑（不是矢量产品）
- ❌ 全自动配色推荐（让 AI 决定颜色搭配 — 这会偏离"拼豆 = 受调色板限制"的核心约束）
- ❌ 视频教程内嵌（让用户去 B 站 / 小红书，平台不重做内容）
- ❌ 社交媒体即时分享（用户复制图自己发即可，不需要做平台）

## 七、决策日志

| 日期 | 决定 | 原因 |
|---|---|---|
| 2026-04 | 调色板暂不做 64 色 | 商家色卡映射没做完，扩到 64 反而带来匹配混乱 |
| 2026-04 | image 模式延后到 P0 | 当前 mock 占位足够展示流程，但用户量级到 1000 后必须真实化 |
| 2026-04 | AR / 实物识别归长期 | 业务模型没跑通前不投入复杂技术 |
