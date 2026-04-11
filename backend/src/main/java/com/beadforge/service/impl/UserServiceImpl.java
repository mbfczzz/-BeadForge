package com.beadforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.LoginRequest;
import com.beadforge.model.dto.RegisterRequest;
import com.beadforge.model.dto.UserDTO;
import com.beadforge.model.entity.User;
import com.beadforge.repository.UserRepository;
import com.beadforge.service.UserService;
import com.beadforge.util.ConvertUtil;
import com.beadforge.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Map<String, Object> register(RegisterRequest request) {
        // 检查用户名是否存在
        long count = userRepository.selectCount(
                new QueryWrapper<User>().eq("username", request.getUsername()));
        if (count > 0) {
            throw new BusinessException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setEmail(request.getEmail());
        userRepository.insert(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", ConvertUtil.toUserDTO(user));
        return result;
    }

    @Override
    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.selectOne(
                new QueryWrapper<User>().eq("username", request.getUsername()));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", ConvertUtil.toUserDTO(user));
        return result;
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return ConvertUtil.toUserDTO(user);
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (userDTO.getNickname() != null) user.setNickname(userDTO.getNickname());
        if (userDTO.getAvatar() != null) user.setAvatar(userDTO.getAvatar());
        if (userDTO.getEmail() != null) user.setEmail(userDTO.getEmail());
        if (userDTO.getPhone() != null) user.setPhone(userDTO.getPhone());
        userRepository.updateById(user);
        return ConvertUtil.toUserDTO(user);
    }
}
