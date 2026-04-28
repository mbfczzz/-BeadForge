# 拼豆生成 — API 调用指南

> 给前端 / 第三方接入方写。讲清楚一个完整创作 → 发布 → 售卖链路要调哪些接口、参数怎么传、返回什么。
> Base URL（开发）：`http://localhost:8085/api`
> Base URL（容器单镜像）：`http://localhost:8080/api`
> 完整 OpenAPI 文档：`{baseUrl}/v3/api-docs`（接 SpringDoc 后已生效）

## 一、通用约定

### 1.1 鉴权

除明确标注"公开"的接口外，所有请求需带 JWT：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

token 从 `/auth/login` 获得，有效期 24 小时。前端会自动写入 AsyncStorage（`beadforge_token`）并由 axios 拦截器附加。

### 1.2 响应包裹

所有接口返回统一结构：

```json
{
  "code": 200,
  "message": "成功",
  "data": { /* 业务数据 */ }
}
```

错误：

```json
{
  "code": 400,
  "message": "图纸不存在",
  "data": null
}
```

### 1.3 状态码

| code | 含义 | 前端建议 |
|---|---|---|
| 200 | 成功 | 取 `data` |
| 400 | 业务校验失败（参数错、状态错） | 弹 toast 显示 message |
| 401 | 未登录 / token 失效 | 跳登录，清空 token |
| 403 | 已登录但无权限 | 弹"无权访问" |
| 404 | 资源不存在 | 显示空状态 |
| 500 | 服务端错 | 提示稍后重试 |

### 1.4 分页约定

所有分页接口参数：

```
?page=1&size=20      // page 从 1 开始
```

返回 MyBatis-Plus `Page` 结构：

```json
{
  "records": [ ... ],
  "current": 1,
  "size": 20,
  "total": 156,
  "pages": 8
}
```

## 二、典型链路 ①：手动创作 → 保存草稿

```
POST /auth/login                  → 拿 token
POST /designs                     → 创建草稿
PUT  /designs/{id}                → 更新内容（带 grid 的 designData）
```

### 2.1 登录

```http
POST /auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "p@ss"
}
```

返回：

```json
{
  "code": 200,
  "data": {
    "token": "eyJ...",
    "user": { "id": 42, "username": "alice", "nickname": "Alice" }
  }
}
```

### 2.2 创建草稿

```http
POST /designs
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "title": "未命名",
  "description": "",
  "category": "其他"
}
```

返回的 `data.id` 是草稿 ID，后续保存用它。

### 2.3 写入 grid

```http
PUT /designs/{id}
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "title": "我的小猫",
  "description": "16x16 入门款",
  "category": "动物",
  "designData": "{\"version\":1,\"cols\":16,\"rows\":16,\"grid\":[[\"#EF4444\",...]],\"palette\":[\"#EF4444\"],\"meta\":{\"source\":\"manual\"}}"
}
```

> `designData` 是字符串（JSON 序列化后），不是嵌套对象。

## 三、典型链路 ②：AI 生图 → 编辑 → 发布

```
POST /ai/generate-image           → 拿 grid
POST /designs                     → 建草稿
PUT  /designs/{id}                → 写入 grid（编辑后）
PUT  /designs/{id}                → status=PUBLISHED 发布
```

### 3.1 AI 生图

```http
POST /ai/generate-image
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "prompt": "可爱的小猫咪",
  "cols": 16,
  "rows": 16
}
```

返回：

```json
{
  "code": 200,
  "data": {
    "grid": [
      ["transparent","#EF4444",...,"transparent"],
      ...
    ],
    "imageUrl": "https://ark.cn-beijing.volces.com/...",
    "prompt": "可爱的小猫咪"
  }
}
```

### 3.2 发布

把草稿状态切到 `PUBLISHED`：

```http
PUT /designs/{id}
{
  "title": "可爱的小猫",
  "description": "AI 生成 + 手工微调",
  "category": "动物",
  "designData": "{...}",
  "status": "PUBLISHED"
}
```

发布后会出现在 `/designs/public/list`。

## 四、典型链路 ③：上架图纸 → 卖钱

```
POST /patterns/publish            → 上架（引用已发布的 design_id）
GET  /patterns/list               → 别人逛市场
POST /patterns/{id}/buy           → 别人购买（钱包扣款）
GET  /patterns/purchased          → 我的已购列表
```

### 4.1 上架

```http
POST /patterns/publish
Authorization: Bearer eyJ...
Content-Type: application/json

{
  "designId": 123,
  "title": "可爱小猫 16x16",
  "description": "适合新手；需 18 种颜色，约 220 颗豆",
  "category": "动物",
  "price": 9.90,
  "cols": 16,
  "rows": 16
}
```

`price ≤ 0` 时后端自动设 `is_free=1`。

### 4.2 别人购买

```http
POST /patterns/{patternId}/buy
Authorization: Bearer eyJ...
```

后端事务：扣买家拼豆币 → 写 `t_pattern_purchase` → 增加 `downloads`。免费图纸不扣款。

### 4.3 验证购买后下载

购买后买家通过 `/patterns/purchased` 拿已购 listingId 列表，再通过 design_id 反查 designData：

```http
GET /patterns/purchased
→ data: [123, 456]   // listing IDs

GET /designs/public/{designId}    // 取 grid
→ data.designData
```

> **注意**：当前 `/designs/public/{id}` 不限定"必须已购买"，这是历史设计。如要做"未购买不能看 grid"，需要在 DesignController 里加权限校验。

## 五、典型链路 ④：图片转拼豆（待真实化）

> **当前状态**：后端 `/image/pixelate` 不存在；前端 image 模式是 mock。
> 下面是建议建好后的形态。

```
POST /upload/image                → 拿 imageUrl
POST /image/pixelate              → 拿 grid（待建）
POST /designs                     → 走 ②/③ 链路
```

### 5.1 上传图片

```http
POST /upload/image
Authorization: Bearer eyJ...
Content-Type: multipart/form-data

file: <binary>
```

返回：

```json
{
  "data": {
    "url": "/uploads/2026-04/abc123.png",
    "size": 102400,
    "type": "image"
  }
}
```

### 5.2 像素化（待建）

```http
POST /image/pixelate
{
  "url": "/uploads/2026-04/abc123.png",
  "cols": 16,
  "rows": 16,
  "preserveWhite": false
}

→ {
  "data": {
    "grid": [[...]],
    "palette": ["#EF4444", "#FBBF24", ...]
  }
}
```

实现思路：复用 `AiController` 已有的缩放 + 调色板匹配代码，抽到 `ImagePixelService`，AI 和 image 共用。

## 六、典型链路 ⑤：管理调色板与配置（运营）

```
GET    /admin/api-config              → 看密钥列表（脱敏）
GET    /admin/api-config/{id}/reveal  → 查完整密钥（写审计日志）
PUT    /admin/api-config/{id}         → 改 doubao_api_key 等
POST   /dict/reload                   → 改完字典后立刻刷新缓存
```

需要 ADMIN 角色 token。

## 七、错误处理示例（前端）

axios 拦截器（`frontend/src/api/client.ts`）已经做了：

```typescript
client.interceptors.response.use(
  (res) => {
    const { code, message, data } = res.data;
    if (code === 200) return { ...res, data };       // 成功直接展开
    if (code === 401) {
      // 跳登录、清 token
      AsyncStorage.removeItem('beadforge_token');
      // ... navigation.reset 到 LoginScreen
    }
    // 其他业务错抛出
    return Promise.reject(new Error(message || `code=${code}`));
  },
  (err) => Promise.reject(err)
);
```

业务调用：

```typescript
try {
  const res = await designApi.update(id, payload);
  Toast.show('保存成功');
} catch (e: any) {
  Toast.show(e.message);  // 已经是 message 文案
}
```

## 八、SpringDoc / Apifox 接入

### 8.1 OpenAPI JSON

```
GET {baseUrl}/v3/api-docs
```

返回完整 OpenAPI 3.0 JSON，包含 21 个 controller、100+ 接口、所有参数 / 响应 schema、JWT 鉴权方案。

### 8.2 Apifox 导入

1. 项目 → 数据管理 → 导入数据
2. 选 OpenAPI/Swagger
3. 模式选"URL"，粘贴 `http://localhost:8085/api/v3/api-docs`
4. 勾选"自动同步"，以后改注解自动跟随更新

### 8.3 在 Apifox 里调试

- 全局参数：`Authorization: Bearer {{token}}`
- 在环境变量里设 `token`，登录接口测试后用脚本 `pm.environment.set('token', pm.response.json().data.token)` 自动写入

## 九、Rate Limit / 配额（建议）

> 当前未实现，建议在网关或 `OncePerRequestFilter` 加。

| 接口 | 建议限频 |
|---|---|
| `/auth/login` | 同 IP 5 次/分钟 |
| `/auth/register` | 同 IP 1 次/分钟 |
| `/ai/generate-image` | 普通用户 5 次/日，VIP 50 次/日 |
| `/upload/image` | 同用户 30 次/小时 |
| `/comments` | 同用户 30 次/小时 |

## 十、调试技巧

### 10.1 看后端 SQL

`application.yml` 里 `com.beadforge.repository: debug` 已开，启动后控制台能看到所有 SQL 执行。

```yaml
logging:
  level:
    com.beadforge.repository: ${SQL_LOG_LEVEL:debug}
```

生产请改成 `info`。

### 10.2 看请求日志

`config/RequestLoggingFilter.java` 已经会打印每个请求的 method / path / status / 耗时。

### 10.3 复现前端 bug

后端可以本地起，前端 `client.ts` 改 base URL 到 `http://你的IP:8085/api`，移动端就能直连本机后端。
