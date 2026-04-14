package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.Follow;
import com.beadforge.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowRepository followRepo;

    @PostMapping("/{targetUserId}")
    public ApiResponse<Void> follow(@PathVariable Long targetUserId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        if (userId.equals(targetUserId)) return ApiResponse.error(400, "不能关注自己");

        QueryWrapper<Follow> qw = new QueryWrapper<>();
        qw.eq("follower_id", userId).eq("following_id", targetUserId);
        if (followRepo.selectCount(qw) > 0) {
            return ApiResponse.error(400, "已经关注了");
        }

        Follow f = new Follow();
        f.setFollowerId(userId);
        f.setFollowingId(targetUserId);
        followRepo.insert(f);
        return ApiResponse.success("关注成功", null);
    }

    @DeleteMapping("/{targetUserId}")
    public ApiResponse<Void> unfollow(@PathVariable Long targetUserId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        QueryWrapper<Follow> qw = new QueryWrapper<>();
        qw.eq("follower_id", userId).eq("following_id", targetUserId);
        followRepo.delete(qw);
        return ApiResponse.success("已取消关注", null);
    }

    @GetMapping("/check/{targetUserId}")
    public ApiResponse<Boolean> isFollowing(@PathVariable Long targetUserId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        QueryWrapper<Follow> qw = new QueryWrapper<>();
        qw.eq("follower_id", userId).eq("following_id", targetUserId);
        return ApiResponse.success(followRepo.selectCount(qw) > 0);
    }
}
