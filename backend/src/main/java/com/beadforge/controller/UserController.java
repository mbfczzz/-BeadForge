package com.beadforge.controller;

import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.dto.UserDTO;
import com.beadforge.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ApiResponse<UserDTO> getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(userService.getUserById(userId));
    }

    @PutMapping("/profile")
    public ApiResponse<UserDTO> updateProfile(HttpServletRequest request, @RequestBody UserDTO userDTO) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(userService.updateUser(userId, userDTO));
    }
}
