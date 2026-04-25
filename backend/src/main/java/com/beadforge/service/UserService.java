package com.beadforge.service;

import com.beadforge.model.dto.LoginRequest;
import com.beadforge.model.dto.RegisterRequest;
import com.beadforge.model.dto.UserDTO;
import com.beadforge.model.dto.UserStatsDTO;

import java.util.Map;

public interface UserService {

    Map<String, Object> register(RegisterRequest request);

    Map<String, Object> login(LoginRequest request);

    UserDTO getUserById(Long id);

    UserDTO updateUser(Long id, UserDTO userDTO);

    UserStatsDTO getUserStats(Long userId);

    void changePassword(Long userId, String oldPassword, String newPassword);
}
