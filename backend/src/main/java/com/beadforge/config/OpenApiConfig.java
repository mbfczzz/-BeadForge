package com.beadforge.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI beadforgeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BeadForge API")
                        .version("1.0.0")
                        .description("拼豆创作平台后端 API（Spring Boot 2.7 + MyBatis-Plus）"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("登录后从 /auth/login 拿到的 token，填到此处")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
