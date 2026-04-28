package com.beadforge.controller;

import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.dto.LoginRequest;
import com.beadforge.model.dto.RegisterRequest;
import com.beadforge.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "认证", description = "注册 / 登录（公开接口，无需 token）")
@SecurityRequirements
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @Operation(summary = "用户注册", description = "成功后返回 token + 用户信息")
    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(userService.register(request));
    }

    @Operation(summary = "用户登录", description = "用户名/邮箱 + 密码登录，返回 JWT token")
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(userService.login(request));
    }
}
