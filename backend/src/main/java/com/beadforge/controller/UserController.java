package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.dto.ChangePasswordRequest;
import com.beadforge.model.dto.UserDTO;
import com.beadforge.model.dto.UserStatsDTO;
import com.beadforge.model.entity.Design;
import com.beadforge.model.entity.Feed;
import com.beadforge.model.entity.Follow;
import com.beadforge.model.entity.Like;
import com.beadforge.model.entity.User;
import com.beadforge.repository.DesignRepository;
import com.beadforge.repository.FeedRepository;
import com.beadforge.repository.FollowRepository;
import com.beadforge.repository.LikeRepository;
import com.beadforge.repository.UserRepository;
import com.beadforge.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户", description = "当前用户资料 / 统计 / 密码 / 社区用户档案")
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepo;
    private final FollowRepository followRepo;
    private final FeedRepository feedRepo;
    private final DesignRepository designRepo;
    private final LikeRepository likeRepo;

    @Operation(summary = "获取我的资料")
    @GetMapping("/profile")
    public ApiResponse<UserDTO> getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(userService.getUserById(userId));
    }

    @Operation(summary = "修改我的资料", description = "可更新昵称、头像、简介等")
    @PutMapping("/profile")
    public ApiResponse<UserDTO> updateProfile(HttpServletRequest request, @RequestBody UserDTO userDTO) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(userService.updateUser(userId, userDTO));
    }

    @Operation(summary = "我的统计数据", description = "作品数 / 粉丝数 / 关注数 / 获赞数 等聚合数据")
    @GetMapping("/stats")
    public ApiResponse<UserStatsDTO> getStats(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(userService.getUserStats(userId));
    }

    @Operation(summary = "修改登录密码")
    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req,
                                            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        userService.changePassword(userId, req.getOldPassword(), req.getNewPassword());
        return ApiResponse.success("密码修改成功", null);
    }

    @Operation(summary = "社区用户档案",
            description = "通过 nickname 或 username 查找，供他人主页 / 私信页面使用；返回字段对齐前端 CommunityUserData")
    @GetMapping("/community/{name}")
    public ApiResponse<Map<String, Object>> communityProfile(@PathVariable String name) {
        QueryWrapper<User> uqw = new QueryWrapper<>();
        uqw.eq("nickname", name).or().eq("username", name).last("LIMIT 1");
        User u = userRepo.selectOne(uqw);
        if (u == null) {
            // 未注册的展示名，返回缺省骨架（保持 UI 可渲染）
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("id", null);
            empty.put("name", name);
            empty.put("title", "创作者");
            empty.put("bio", "");
            empty.put("followers", 0);
            empty.put("following", 0);
            empty.put("posts", 0);
            empty.put("likes", 0);
            empty.put("joinDate", "");
            empty.put("tags", java.util.Collections.emptyList());
            return ApiResponse.success(empty);
        }

        long followers = followRepo.selectCount(new QueryWrapper<Follow>().eq("following_id", u.getId()));
        long following = followRepo.selectCount(new QueryWrapper<Follow>().eq("follower_id", u.getId()));
        long posts = feedRepo.selectCount(new QueryWrapper<Feed>().eq("user_id", u.getId()))
                   + designRepo.selectCount(new QueryWrapper<Design>().eq("user_id", u.getId()));
        // 收到的赞 = like.target 命中本人发布的 design / feed
        long likes = 0;
        java.util.List<Long> myDesigns = designRepo.selectList(new QueryWrapper<Design>().eq("user_id", u.getId()).select("id"))
            .stream().map(Design::getId).collect(java.util.stream.Collectors.toList());
        java.util.List<Long> myFeeds = feedRepo.selectList(new QueryWrapper<Feed>().eq("user_id", u.getId()).select("id"))
            .stream().map(Feed::getId).collect(java.util.stream.Collectors.toList());
        if (!myDesigns.isEmpty()) {
            likes += likeRepo.selectCount(new QueryWrapper<Like>().eq("target_type", "DESIGN").in("target_id", myDesigns));
        }
        if (!myFeeds.isEmpty()) {
            likes += likeRepo.selectCount(new QueryWrapper<Like>().eq("target_type", "FEED").in("target_id", myFeeds));
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("name", u.getNickname() != null ? u.getNickname() : u.getUsername());
        m.put("title", "创作者");
        m.put("bio", "");
        m.put("followers", followers);
        m.put("following", following);
        m.put("posts", posts);
        m.put("likes", likes);
        m.put("joinDate", u.getCreatedAt() == null ? "" : u.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        m.put("tags", java.util.Collections.emptyList());
        return ApiResponse.success(m);
    }
}
