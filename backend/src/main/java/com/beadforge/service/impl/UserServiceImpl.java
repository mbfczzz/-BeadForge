package com.beadforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.LoginRequest;
import com.beadforge.model.dto.RegisterRequest;
import com.beadforge.model.dto.UserDTO;
import com.beadforge.model.dto.UserStatsDTO;
import com.beadforge.model.entity.Design;
import com.beadforge.model.entity.Follow;
import com.beadforge.model.entity.User;
import com.beadforge.repository.DesignRepository;
import com.beadforge.repository.FollowRepository;
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
    private final DesignRepository designRepository;
    private final FollowRepository followRepository;
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

        String role = user.getRole() != null ? user.getRole() : "USER";
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), role);
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", ConvertUtil.toUserDTO(user));
        return result;
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return ConvertUtil.toUserDTO(user);
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.selectById(id);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if (userDTO.getNickname() != null) user.setNickname(userDTO.getNickname());
        if (userDTO.getAvatar() != null) user.setAvatar(userDTO.getAvatar());
        if (userDTO.getEmail() != null) user.setEmail(userDTO.getEmail());
        if (userDTO.getPhone() != null) user.setPhone(userDTO.getPhone());
        if (userDTO.getBio() != null) user.setBio(userDTO.getBio());
        if (userDTO.getGender() != null) user.setGender(userDTO.getGender());
        if (userDTO.getBirthday() != null) user.setBirthday(userDTO.getBirthday());
        if (userDTO.getEducation() != null) user.setEducation(userDTO.getEducation());
        if (userDTO.getOccupation() != null) user.setOccupation(userDTO.getOccupation());
        userRepository.updateById(user);
        return ConvertUtil.toUserDTO(user);
    }

    @Override
    public UserStatsDTO getUserStats(Long userId) {
        long designCount = designRepository.selectCount(
                new QueryWrapper<Design>().eq("user_id", userId));

        // 统计该用户所有作品获得的总赞数
        QueryWrapper<Design> likeWrapper = new QueryWrapper<Design>()
                .eq("user_id", userId)
                .select("IFNULL(SUM(like_count), 0) as like_count");
        Design likeResult = designRepository.selectOne(likeWrapper);
        long totalLikes = likeResult != null && likeResult.getLikeCount() != null
                ? likeResult.getLikeCount() : 0;

        long followerCount = followRepository.selectCount(
                new QueryWrapper<Follow>().eq("following_id", userId));
        long followingCount = followRepository.selectCount(
                new QueryWrapper<Follow>().eq("follower_id", userId));

        int level = calculateLevel(designCount, totalLikes, followerCount);

        return new UserStatsDTO(designCount, totalLikes, followerCount, followingCount, level);
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("当前密码不正确");
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new BusinessException("新密码不能与当前密码相同");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.updateById(user);
    }

    /**
     * 创作者等级：经验值 = 作品数×10 + 收赞×1 + 粉丝×5
     * 阈值表：[0, 10, 30, 60, 100, 200, 500, 1000, 2000, 5000]
     * 新号经验=0 → Lv.1
     */
    private static final long[] LEVEL_THRESHOLDS = {0, 10, 30, 60, 100, 200, 500, 1000, 2000, 5000};

    private int calculateLevel(long designCount, long likeCount, long followerCount) {
        long exp = designCount * 10L + likeCount + followerCount * 5L;
        int level = 1;
        for (int i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (exp >= LEVEL_THRESHOLDS[i]) {
                level = i + 1;
            } else {
                break;
            }
        }
        return level;
    }
}
