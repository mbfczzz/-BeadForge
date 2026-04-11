# BeadForge

珠饰设计与管理应用，支持 Android 和 iOS 平台。

## 技术栈

- **前端**: React Native (Expo)
- **后端**: Java Spring Boot
- **数据库**: MySQL

## 项目结构

```
BeadForge/
├── backend/          # Spring Boot 后端服务
│   └── src/main/java/com/beadforge/
│       ├── config/       # 配置类
│       ├── controller/   # 控制器层
│       ├── service/      # 服务层接口
│       │   └── impl/     # 服务层实现
│       ├── repository/   # 数据访问层
│       ├── model/        # 数据模型
│       │   ├── entity/   # 数据库实体
│       │   ├── dto/      # 数据传输对象
│       │   └── enums/    # 枚举类型
│       ├── factory/      # 工厂模式
│       ├── strategy/     # 策略模式
│       ├── util/         # 工具类
│       └── exception/    # 统一异常处理
├── frontend/         # React Native 前端应用
│   ├── src/
│   │   ├── api/          # API 请求封装
│   │   ├── components/   # 通用组件
│   │   ├── screens/      # 页面
│   │   ├── navigation/   # 路由导航
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── store/        # 状态管理
│   │   ├── utils/        # 工具函数
│   │   └── theme/        # 主题样式
│   └── ...
└── README.md
```

## 设计模式

- **Repository Pattern**: 数据访问层抽象
- **Factory Pattern**: 对象创建封装
- **Strategy Pattern**: 算法策略切换
- **DTO Pattern**: 数据传输隔离
- **Singleton Pattern**: 配置与工具类单例
- **Observer Pattern**: 前端状态管理
```
