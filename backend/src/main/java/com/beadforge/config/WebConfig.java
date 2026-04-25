package com.beadforge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.nio.file.Paths;

/**
 * 前端 SPA 路由支持：
 * - /api/** → 走后端 Controller
 * - /admin/** → 返回 static/admin/index.html（管理后台 SPA）
 * - 其他路径 → 返回 static/index.html（App Web 版 SPA）
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 用户上传目录（必须在 /** 之前，否则会被 SPA fallback 抢走）
        String absUploadDir = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        if (!absUploadDir.endsWith("/") && !absUploadDir.endsWith("\\")) {
            absUploadDir = absUploadDir + "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absUploadDir);

        // Admin 后台
        registry.addResourceHandler("/admin/**")
                .addResourceLocations("classpath:/static/admin/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);
                        return requested.exists() && requested.isReadable()
                                ? requested
                                : new ClassPathResource("/static/admin/index.html");
                    }
                });

        // App Web 版
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);
                        return requested.exists() && requested.isReadable()
                                ? requested
                                : new ClassPathResource("/static/index.html");
                    }
                });
    }
}
