# ========== Stage 1: 前端构建 ==========
FROM node:18 AS frontend-build
WORKDIR /app/frontend

# 先复制依赖文件，利用缓存
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps --ignore-scripts=false

# 复制源码和配置
COPY frontend/ ./

# 构建 web 版本
ENV NODE_ENV=production
ENV EXPO_NO_TELEMETRY=1
RUN npx expo export --platform web 2>&1 || { echo "=== BUILD FAILED ==="; cat /tmp/*.log 2>/dev/null; exit 1; }

# ========== Stage 2: 后端构建 ==========
FROM maven:3.9-eclipse-temurin-8 AS backend-build
WORKDIR /app/backend

# 先复制 pom，利用缓存
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# 复制后端源码
COPY backend/src ./src

# 把前端构建产物复制到 Spring Boot 静态资源目录
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

# 打包
RUN mvn package -DskipTests -B

# ========== Stage 3: 运行 ==========
FROM eclipse-temurin:8-jre-alpine
WORKDIR /app

COPY --from=backend-build /app/backend/target/*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xmx512m" \
    TZ=Asia/Shanghai

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
