# ========== Stage 1: App 前端构建 ==========
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps --ignore-scripts=false
COPY frontend/ ./
ENV NODE_ENV=production
ENV EXPO_NO_TELEMETRY=1
RUN npx expo export --platform web 2>&1 || { echo "=== FRONTEND BUILD FAILED ==="; exit 1; }

# ========== Stage 2: Admin 后台构建 ==========
FROM node:20 AS admin-build
WORKDIR /app/admin
COPY admin/package.json admin/package-lock.json ./
RUN npm install
COPY admin/ ./
RUN npm run build

# ========== Stage 3: 后端构建 ==========
FROM maven:3.9-eclipse-temurin-8 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src

# App Web 版 → static/
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
# Admin 后台 → static/admin/
COPY --from=admin-build /app/admin/dist ./src/main/resources/static/admin

RUN mvn package -DskipTests -B

# ========== Stage 4: 运行 ==========
FROM eclipse-temurin:8-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xmx512m" \
    TZ=Asia/Shanghai
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
