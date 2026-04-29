package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.model.dto.ApiResponse;
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
import com.beadforge.service.GridImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Tag(name = "动态", description = "社区 Feed 流（推荐 / 最新 / 关注 / 我的 / 他人）")
@RestController
@RequestMapping("/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final FeedRepository feedRepo;
    private final UserRepository userRepo;
    private final FollowRepository followRepo;
    private final LikeRepository likeRepo;
    private final DesignRepository designRepo;
    private final GridImageService gridImageService;

    @Operation(summary = "动态列表", description = "公开；tab: recommend（默认）/ latest")
    @GetMapping("/list")
    public ApiResponse<Page<Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "recommend") String tab,
            HttpServletRequest request) {

        Page<Feed> p = new Page<>(page, size);
        QueryWrapper<Feed> qw = new QueryWrapper<>();
        if ("latest".equals(tab)) qw.orderByDesc("created_at");
        else qw.orderByDesc("like_count");

        Page<Feed> result = feedRepo.selectPage(p, qw);
        return ApiResponse.success(enrichFeeds(result, (Long) request.getAttribute("userId")));
    }

    @Operation(summary = "我发布的动态")
    @GetMapping("/mine")
    public ApiResponse<Page<Map<String, Object>>> mine(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        Page<Feed> p = new Page<>(page, size);
        QueryWrapper<Feed> qw = new QueryWrapper<>();
        qw.eq("user_id", userId).orderByDesc("created_at");
        Page<Feed> result = feedRepo.selectPage(p, qw);
        return ApiResponse.success(enrichFeeds(result, userId));
    }

    @Operation(summary = "某用户的动态", description = "公开；他人主页「动态」tab 用")
    @GetMapping("/by-user/{userId}")
    public ApiResponse<Page<Map<String, Object>>> byUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        Page<Feed> p = new Page<>(page, size);
        QueryWrapper<Feed> qw = new QueryWrapper<>();
        qw.eq("user_id", userId).orderByDesc("created_at");
        Page<Feed> result = feedRepo.selectPage(p, qw);
        return ApiResponse.success(enrichFeeds(result, (Long) request.getAttribute("userId")));
    }

    @Operation(summary = "关注的人的动态")
    @GetMapping("/following")
    public ApiResponse<Page<Map<String, Object>>> following(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {

        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        // 查关注列表
        QueryWrapper<Follow> fqw = new QueryWrapper<>();
        fqw.eq("follower_id", userId).select("following_id");
        List<Long> followingIds = followRepo.selectList(fqw).stream().map(Follow::getFollowingId).collect(Collectors.toList());

        if (followingIds.isEmpty()) {
            Page<Map<String, Object>> empty = new Page<>(page, size, 0);
            empty.setRecords(Collections.emptyList());
            return ApiResponse.success(empty);
        }

        Page<Feed> p = new Page<>(page, size);
        QueryWrapper<Feed> qw = new QueryWrapper<>();
        qw.in("user_id", followingIds).orderByDesc("created_at");
        Page<Feed> result = feedRepo.selectPage(p, qw);
        return ApiResponse.success(enrichFeeds(result, userId));
    }

    @Operation(summary = "发布动态",
            description = "若带 designId 但未带 mediaUrls，会自动把图纸 grid 渲染成 PNG 落到 /uploads，并回填 mediaUrls 让时间线正常显示图")
    @PostMapping
    public ApiResponse<Feed> create(@RequestBody Feed feed, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        feed.setUserId(userId);
        feed.setLikeCount(0);
        feed.setCommentCount(0);
        feed.setShareCount(0);

        boolean noMedia = feed.getMediaUrls() == null || feed.getMediaUrls().trim().isEmpty();
        if (noMedia && feed.getDesignId() != null) {
            try {
                Design design = designRepo.selectById(feed.getDesignId());
                if (design != null && design.getDesignData() != null) {
                    String url = gridImageService.renderToPng(design.getDesignData(), "feed-" + design.getId());
                    if (url != null) {
                        feed.setMediaUrls(url);
                        if (feed.getMediaType() == null || feed.getMediaType().isEmpty()) {
                            feed.setMediaType("image");
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("根据 designId={} 自动渲染 grid 失败: {}", feed.getDesignId(), e.getMessage());
            }
        }

        feedRepo.insert(feed);
        return ApiResponse.success("发布成功", feed);
    }

    /** 附加用户信息到动态列表 — 对齐前端 FeedItemData：补 media/coverAccent/linkedPatternIdx 占位字段 + 当前用户 liked 状态 */
    private Page<Map<String, Object>> enrichFeeds(Page<Feed> result, Long currentUserId) {
        Set<Long> userIds = result.getRecords().stream().map(Feed::getUserId).collect(Collectors.toSet());
        Map<Long, User> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            userRepo.selectBatchIds(userIds).forEach(u -> userMap.put(u.getId(), u));
        }

        // 批量查当前用户对这些 feed 的点赞状态
        Set<Long> likedFeedIds = new HashSet<>();
        if (currentUserId != null && !result.getRecords().isEmpty()) {
            List<Long> feedIds = result.getRecords().stream().map(Feed::getId).collect(Collectors.toList());
            likeRepo.selectList(new QueryWrapper<Like>()
                .eq("user_id", currentUserId).eq("target_type", "FEED").in("target_id", feedIds)
                .select("target_id"))
                .forEach(l -> likedFeedIds.add(l.getTargetId()));
        }

        String[] accents = {"#FF8DA8", "#6C8BFF", "#8E63FF", "#3FB28D", "#F9B95C", "#FF6F91"};

        Page<Map<String, Object>> mapped = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        mapped.setRecords(result.getRecords().stream().map(f -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", f.getId());
            User u = userMap.get(f.getUserId());
            Map<String, Object> userInfo = new LinkedHashMap<>();
            userInfo.put("id", f.getUserId());
            userInfo.put("name", u != null ? (u.getNickname() != null ? u.getNickname() : u.getUsername()) : "未知");
            userInfo.put("title", "创作者");
            m.put("user", userInfo);
            m.put("content", f.getContent());
            m.put("caption", null);
            m.put("designId", f.getDesignId());
            String tagsStr = f.getTags();
            m.put("tags", (tagsStr != null && !tagsStr.trim().isEmpty()) ? Arrays.asList(tagsStr.split(",")) : Collections.emptyList());
            m.put("likeCount", f.getLikeCount());
            m.put("commentCount", f.getCommentCount());
            m.put("shareCount", f.getShareCount());
            m.put("timeAgo", formatTimeAgo(f.getCreatedAt()));
            m.put("createdAt", f.getCreatedAt());

            // 真实媒体优先；没有则占位（前端 utils/feedMedia 会按 demoAssetId 生成 SVG）
            Map<String, Object> media = new LinkedHashMap<>();
            String mtype = f.getMediaType() != null ? f.getMediaType() : "image";
            media.put("type", mtype);
            media.put("demoAssetId", "feed-" + f.getId());
            media.put("aspectRatio", 1.0);
            if (f.getMediaUrls() != null && !f.getMediaUrls().trim().isEmpty()) {
                List<String> uris = Arrays.stream(f.getMediaUrls().split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
                media.put("assetUris", uris);
            }
            m.put("media", media);
            m.put("coverAccent", accents[(int) (Math.abs(f.getId()) % accents.length)]);
            m.put("linkedPatternIdx", (int) (Math.abs(f.getId()) % 8));
            m.put("liked", likedFeedIds.contains(f.getId()));
            return m;
        }).collect(Collectors.toList()));

        return mapped;
    }

    private String formatTimeAgo(java.time.LocalDateTime time) {
        if (time == null) return "";
        long minutes = java.time.Duration.between(time, java.time.LocalDateTime.now()).toMinutes();
        if (minutes < 60) return minutes + "分钟前";
        long hours = minutes / 60;
        if (hours < 24) return hours + "小时前";
        long days = hours / 24;
        if (days < 7) return days + "天前";
        return time.toLocalDate().toString();
    }
}
