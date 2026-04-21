package com.beadforge.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * 启动后检查关键安全配置是否被默认值覆盖。
 * - 默认 profile / dev profile：仅警告
 * - 其它 profile（prod、staging...）：直接终止进程
 */
@Slf4j
@Component
public class ConfigGuard implements ApplicationListener<ApplicationReadyEvent> {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        Environment env = event.getApplicationContext().getEnvironment();
        String[] profiles = env.getActiveProfiles();
        boolean isDev = profiles.length == 0 || Arrays.asList(profiles).contains("dev");

        boolean jwtInsecure = jwtSecret == null
                || jwtSecret.contains("dev-insecure")
                || jwtSecret.contains("change-in-production")
                || jwtSecret.length() < 32;
        boolean dbInsecure = "root_password".equals(dbPassword) || "root".equals(dbPassword);

        if (jwtInsecure) {
            String msg = "[ConfigGuard] JWT_SECRET 未正确配置或强度不足（< 32 字符 / 含默认值）。生产环境必须通过环境变量 JWT_SECRET 覆盖。";
            if (isDev) log.warn(msg); else fail(msg);
        }
        if (dbInsecure) {
            String msg = "[ConfigGuard] DB_PASSWORD 正在使用默认弱口令。生产环境必须通过环境变量 DB_PASSWORD 覆盖。";
            if (isDev) log.warn(msg); else fail(msg);
        }
        if (!jwtInsecure && !dbInsecure) {
            log.info("[ConfigGuard] 关键安全配置检查通过。");
        }
    }

    private void fail(String msg) {
        log.error(msg);
        throw new IllegalStateException(msg);
    }
}
