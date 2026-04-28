package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.Follow;
import com.beadforge.model.entity.User;
import com.beadforge.repository.FollowRepository;
import com.beadforge.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

@Tag(name = "关注关系", description = "关注 / 取关 / 粉丝列表 / 关注列表")
@RestController
@RequestMapping("/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowRepository followRepo;
    private final UserRepository userRepo;

    @Operation(summary = "关注用户", description = "不能关注自己；幂等（已关注会返回 400）")
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

    @Operation(summary = "取消关注")
    @DeleteMapping("/{targetUserId}")
    public ApiResponse<Void> unfollow(@PathVariable Long targetUserId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        QueryWrapper<Follow> qw = new QueryWrapper<>();
        qw.eq("follower_id", userId).eq("following_id", targetUserId);
        followRepo.delete(qw);
        return ApiResponse.success("已取消关注", null);
    }

    @Operation(summary = "查询是否已关注")
    @GetMapping("/check/{targetUserId}")
    public ApiResponse<Boolean> isFollowing(@PathVariable Long targetUserId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        QueryWrapper<Follow> qw = new QueryWrapper<>();
        qw.eq("follower_id", userId).eq("following_id", targetUserId);
        return ApiResponse.success(followRepo.selectCount(qw) > 0);
    }

    @Operation(summary = "我的粉丝", description = "返回 ProfileFollowUser 形态，附带 followed 反向关注标记")
    @GetMapping("/followers")
    public ApiResponse<List<Map<String, Object>>> followers(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        List<Follow> rels = followRepo.selectList(new QueryWrapper<Follow>()
            .eq("following_id", userId).orderByDesc("created_at"));
        if (rels.isEmpty()) return ApiResponse.success(Collections.emptyList());

        Set<Long> ids = rels.stream().map(Follow::getFollowerId).collect(Collectors.toSet());
        Map<Long, User> umap = userRepo.selectBatchIds(ids).stream()
            .collect(Collectors.toMap(User::getId, u -> u));

        // 我反向关注了哪些（用于 followed 标记）
        Set<Long> myFollowing = followRepo.selectList(new QueryWrapper<Follow>()
            .eq("follower_id", userId).in("following_id", ids).select("following_id"))
            .stream().map(Follow::getFollowingId).collect(Collectors.toSet());

        return ApiResponse.success(rels.stream().map(r -> toFollowUser(umap.get(r.getFollowerId()), myFollowing.contains(r.getFollowerId())))
            .filter(Objects::nonNull).collect(Collectors.toList()));
    }

    @Operation(summary = "我关注的人")
    @GetMapping("/following")
    public ApiResponse<List<Map<String, Object>>> following(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        List<Follow> rels = followRepo.selectList(new QueryWrapper<Follow>()
            .eq("follower_id", userId).orderByDesc("created_at"));
        if (rels.isEmpty()) return ApiResponse.success(Collections.emptyList());

        Set<Long> ids = rels.stream().map(Follow::getFollowingId).collect(Collectors.toSet());
        Map<Long, User> umap = userRepo.selectBatchIds(ids).stream()
            .collect(Collectors.toMap(User::getId, u -> u));

        return ApiResponse.success(rels.stream().map(r -> toFollowUser(umap.get(r.getFollowingId()), true))
            .filter(Objects::nonNull).collect(Collectors.toList()));
    }

    private Map<String, Object> toFollowUser(User u, boolean followed) {
        if (u == null) return null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("username", u.getUsername());
        m.put("nickname", u.getNickname() != null ? u.getNickname() : u.getUsername());
        m.put("bio", "");
        m.put("followed", followed);
        return m;
    }
}
