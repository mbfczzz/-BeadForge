# 🧩 BeadForge — 拼豆创作平台

拼豆设计、分享、交易一站式平台。支持手动创作、图片转换、AI 生成拼豆图纸。

## 功能模块

| 模块 | 功能 |
|------|------|
| **发现** | 作品瀑布流、搜索、分类筛选、排序 |
| **市场** | 材料商城（购物车/结算）+ 图纸市场（购买/发布/下载） |
| **创作** | 手动画布编辑、图片转换、AI 文生图（豆包 API） |
| **动态** | 社区 Feed 流、Stories、关注、点赞、评论 |
| **我的** | 个人中心、作品管理、收藏、点赞、设置 |

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React Native (Expo SDK 54) + TypeScript + Zustand |
| 后端 | Spring Boot 2.7 + MyBatis-Plus + MySQL + JWT |
| AI | 豆包 Seedream 5.0（火山方舟 Ark API） |
| 部署 | Docker + GitHub Actions CI/CD |

---

## 🐳 Docker 部署（推荐）

前后端打包为**单一镜像**，一个端口访问全部。

### 方式一：从 GitHub Container Registry 拉取

```bash
# 拉取最新镜像
docker pull ghcr.io/mbfczzz/-beadforge:latest

# 运行
docker run -d \
  --name beadforge \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://YOUR_MYSQL_HOST:3306/beadforge?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&createDatabaseIfNotExist=true" \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  ghcr.io/mbfczzz/-beadforge:latest
```

### 方式二：本地构建

```bash
git clone https://github.com/mbfczzz/-BeadForge.git
cd BeadForge
docker build -t beadforge .
docker run -d --name beadforge -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://YOUR_MYSQL_HOST:3306/beadforge?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&createDatabaseIfNotExist=true" \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  beadforge
```

### 访问

启动后浏览器打开 **http://localhost:8080**

- 首次启动自动建表 + 初始化 mock 数据
- 默认测试账号：注册一个新用户即可

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SPRING_DATASOURCE_URL` | MySQL 连接地址 | `jdbc:mysql://106.14.165.141:3306/beadforge...` |
| `SPRING_DATASOURCE_USERNAME` | 数据库用户名 | `root` |
| `SPRING_DATASOURCE_PASSWORD` | 数据库密码 | `root_password` |
| `JWT_SECRET` | JWT 签名密钥 | `beadforge-default-secret...` |
| `JAVA_OPTS` | JVM 参数 | `-Xmx512m` |

### Docker 镜像架构

```
┌───────────────────────────────────────────┐
│           Docker 容器 (:8080)              │
│                                            │
│   浏览器请求                                │
│     ├─ /api/**  → Spring Boot Controller  │
│     └─ /*       → 前端 SPA (index.html)   │
│                                            │
│   构建流程：                                │
│     Node 18 编译前端 → Maven 编译后端       │
│     → 前端静态文件打入 resources/static/   │
│     → JRE 8 运行 jar                      │
└───────────────────────────────────────────┘
```

---

## 📱 本地开发（前端）

```bash
cd frontend
npm install --legacy-peer-deps
npx expo start        # 按 w 打开 Web，或用 Expo Go 扫码
```

修改 `src/api/client.ts` 中的 IP 地址为你的后端地址。

## ☕ 本地开发（后端）

需要 Java 8+ 和 Maven 3.6+

```bash
cd backend
mvn spring-boot:run
```

后端地址：`http://localhost:8080/api`

### 主要 API

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/auth/register` | POST | 注册 | 公开 |
| `/api/auth/login` | POST | 登录 | 公开 |
| `/api/user/profile` | GET/PUT | 个人资料 | 需登录 |
| `/api/user/stats` | GET | 用户统计 | 需登录 |
| `/api/designs/public/list` | GET | 作品列表 | 公开 |
| `/api/designs/my` | GET | 我的作品 | 需登录 |
| `/api/products/list` | GET | 材料商品 | 公开 |
| `/api/patterns/list` | GET | 图纸市场 | 公开 |
| `/api/patterns/publish` | POST | 发布图纸 | 需登录 |
| `/api/patterns/{id}/buy` | POST | 购买图纸 | 需登录 |
| `/api/feeds/list` | GET | 社区动态 | 公开 |
| `/api/ai/generate-image` | POST | AI 生图 | 需登录 |
| `/api/follow/{userId}` | POST/DELETE | 关注/取消 | 需登录 |

---

## 🏗 项目结构

```
BeadForge/
├── Dockerfile                    # 前后端合并镜像（三阶段构建）
├── .github/workflows/            # GitHub Actions CI/CD
├── frontend/                     # React Native (Expo)
│   └── src/
│       ├── api/                  # HTTP 客户端 + 豆包 API
│       ├── components/common/    # BeadGrid, Danmaku, Toast, HoverView...
│       ├── hooks/                # useDanmaku, useFeedback (haptics)
│       ├── navigation/           # Tab + Stack 导航 + 类型
│       ├── screens/              # 11+ 页面
│       ├── store/                # Zustand (auth, design, pattern)
│       └── theme/                # 主题色 + 响应式
├── backend/                      # Spring Boot 2.7
│   └── src/main/
│       ├── java/com/beadforge/
│       │   ├── config/           # Security, CORS, MyBatis, WebMvc
│       │   ├── controller/       # 8 个 REST Controller
│       │   ├── model/            # Entity (7) + DTO (6) + Enum
│       │   ├── repository/       # 7 个 MyBatis-Plus Mapper
│       │   ├── service/          # 业务逻辑层
│       │   └── util/             # JWT, 转换工具
│       └── resources/
│           ├── schema.sql        # 12 张表建表脚本
│           ├── data.sql          # 初始 mock 数据
│           └── application.yml   # 配置文件
└── README.md
```

## 设计模式

- **Repository Pattern** — 数据访问层抽象
- **Factory Pattern** — Design 对象创建
- **Strategy Pattern** — 排序策略切换
- **DTO Pattern** — 数据传输隔离
- **Proxy Pattern** — AI API Key 后端代理，防泄露

## License

MIT
