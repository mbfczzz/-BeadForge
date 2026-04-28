package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.Comment;
import com.beadforge.model.entity.Design;
import com.beadforge.model.entity.Feed;
import com.beadforge.model.entity.Like;
import com.beadforge.model.entity.User;
import com.beadforge.repository.CommentRepository;
import com.beadforge.repository.DesignRepository;
import com.beadforge.repository.FeedRepository;
import com.beadforge.repository.LikeRepository;
import com.beadforge.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 点赞相关。
 *   POST   /likes/{type}/{id}           — 点赞（type: design / feed / pattern）
 *   DELETE /likes/{type}/{id}           — 取消
 *   GET    /likes/check/{type}/{id}     — 是否已赞
 *   GET    /likes/given                 — 我给出的赞（ProfileGivenLikeItem 形态）
 *   GET    /likes/received              — 我收到的赞（ProfileReceivedLikeItem 形态）
 *
 * 点赞/取消时同步维护目标表的 like_count（保持简单，不用 version 乐观锁，
 * 并发场景个位数误差可接受；严格一致可后续改为 UPDATE ... SET like_count = like_count + 1）。
 */
@Tag(name = "点赞", description = "对作品 / 动态 / 评论的点赞；含「我给的赞」「我收到的赞」")
@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeRepository likeRepo;
    private final DesignRepository designRepo;
    private final FeedRepository feedRepo;
    private final UserRepository userRepo;
    private final CommentRepository commentRepo;

    @Operation(summary = "点赞", description = "type: design / feed / pattern / comment；幂等")
    @PostMapping("/{type}/{id}")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Void> like(@PathVariable String type, @PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        String t = normalize(type);
        long exists = likeRepo.selectCount(new QueryWrapper<Like>()
            .eq("user_id", userId).eq("target_type", t).eq("target_id", id));
        if (exists > 0) return ApiResponse.success("已点赞", null);

        Like like = new Like();
        like.setUserId(userId);
        like.setTargetType(t);
        like.setTargetId(id);
        likeRepo.insert(like);

        // 同步 +1 到目标计数
        if ("DESIGN".equals(t)) {
            Design d = designRepo.selectById(id);
            if (d != null) {
                d.setLikeCount((d.getLikeCount() == null ? 0 : d.getLikeCount()) + 1);
                designRepo.updateById(d);
            }
        } else if ("FEED".equals(t)) {
            Feed f = feedRepo.selectById(id);
            if (f != null) {
                f.setLikeCount((f.getLikeCount() == null ? 0 : f.getLikeCount()) + 1);
                feedRepo.updateById(f);
            }
        } else if ("COMMENT".equals(t)) {
            Comment c = commentRepo.selectById(id);
            if (c != null) {
                c.setLikeCount((c.getLikeCount() == null ? 0 : c.getLikeCount()) + 1);
                commentRepo.updateById(c);
            }
        }
        return ApiResponse.success("点赞成功", null);
    }

    @Operation(summary = "取消点赞")
    @DeleteMapping("/{type}/{id}")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Void> unlike(@PathVariable String type, @PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        String t = normalize(type);
        int removed = likeRepo.delete(new QueryWrapper<Like>()
            .eq("user_id", userId).eq("target_type", t).eq("target_id", id));
        if (removed > 0) {
            if ("DESIGN".equals(t)) {
                Design d = designRepo.selectById(id);
                if (d != null && d.getLikeCount() != null && d.getLikeCount() > 0) {
                    d.setLikeCount(d.getLikeCount() - 1);
                    designRepo.updateById(d);
                }
            } else if ("FEED".equals(t)) {
                Feed f = feedRepo.selectById(id);
                if (f != null && f.getLikeCount() != null && f.getLikeCount() > 0) {
                    f.setLikeCount(f.getLikeCount() - 1);
                    feedRepo.updateById(f);
                }
            } else if ("COMMENT".equals(t)) {
                Comment c = commentRepo.selectById(id);
                if (c != null && c.getLikeCount() != null && c.getLikeCount() > 0) {
                    c.setLikeCount(c.getLikeCount() - 1);
                    commentRepo.updateById(c);
                }
            }
        }
        return ApiResponse.success("已取消点赞", null);
    }

    @Operation(summary = "查询是否已点赞")
    @GetMapping("/check/{type}/{id}")
    public ApiResponse<Map<String, Boolean>> check(@PathVariable String type, @PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        long exists = likeRepo.selectCount(new QueryWrapper<Like>()
            .eq("user_id", userId).eq("target_type", normalize(type)).eq("target_id", id));
        Map<String, Boolean> m = new HashMap<>();
        m.put("liked", exists > 0);
        return ApiResponse.success(m);
    }

    @Operation(summary = "我给出的赞", description = "近 50 条；用于个人中心「我点过的赞」")
    @GetMapping("/given")
    public ApiResponse<List<Map<String, Object>>> given(HttpServletRequest request) {
        Long userId = requireUser(request);
        List<Like> likes = likeRepo.selectList(new QueryWrapper<Like>()
            .eq("user_id", userId).orderByDesc("created_at").last("LIMIT 50"));
        if (likes.isEmpty()) return ApiResponse.success(Collections.emptyList());

        Set<Long> designIds = likes.stream()
            .filter(l -> "DESIGN".equals(l.getTargetType())).map(Like::getTargetId).collect(Collectors.toSet());
        Set<Long> feedIds = likes.stream()
            .filter(l -> "FEED".equals(l.getTargetType())).map(Like::getTargetId).collect(Collectors.toSet());

        Map<Long, Design> dmap = designIds.isEmpty() ? new HashMap<>()
            : designRepo.selectBatchIds(designIds).stream().collect(Collectors.toMap(Design::getId, d -> d));
        Map<Long, Feed> fmap = feedIds.isEmpty() ? new HashMap<>()
            : feedRepo.selectBatchIds(feedIds).stream().collect(Collectors.toMap(Feed::getId, f -> f));

        Set<Long> authorIds = new HashSet<>();
        dmap.values().forEach(d -> authorIds.add(d.getUserId()));
        fmap.values().forEach(f -> authorIds.add(f.getUserId()));
        Map<Long, String> nameMap = authorIds.isEmpty() ? new HashMap<>()
            : userRepo.selectBatchIds(authorIds).stream().collect(Collectors.toMap(
                User::getId, u -> u.getNickname() != null ? u.getNickname() : u.getUsername()));

        List<Map<String, Object>> result = likes.stream().map(l -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", l.getId());
            m.put("targetType", "FEED".equals(l.getTargetType()) ? "动态" : "作品");
            m.put("timeAgo", formatTimeAgo(l.getCreatedAt()));
            if ("DESIGN".equals(l.getTargetType())) {
                Design d = dmap.get(l.getTargetId());
                m.put("title", d != null ? d.getTitle() : "(已删除)");
                m.put("author", d != null ? nameMap.getOrDefault(d.getUserId(), "") : "");
                m.put("patternIndex", (int) (l.getTargetId() % 8));
                m.put("likeCount", d != null && d.getLikeCount() != null ? d.getLikeCount() : 0);
            } else {
                Feed f = fmap.get(l.getTargetId());
                m.put("title", f != null ? safeShorten(f.getContent(), 30) : "(已删除)");
                m.put("author", f != null ? nameMap.getOrDefault(f.getUserId(), "") : "");
                m.put("patternIndex", (int) (l.getTargetId() % 8));
                m.put("likeCount", f != null && f.getLikeCount() != null ? f.getLikeCount() : 0);
            }
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.success(result);
    }

    @Operation(summary = "某用户点过的赞", description = "公开；他人主页「喜欢」tab 用")
    @GetMapping("/by-user/{userId}")
    public ApiResponse<List<Map<String, Object>>> byUser(@PathVariable Long userId) {
        List<Like> likes = likeRepo.selectList(new QueryWrapper<Like>()
            .eq("user_id", userId).orderByDesc("created_at").last("LIMIT 50"));
        if (likes.isEmpty()) return ApiResponse.success(Collections.emptyList());

        Set<Long> designIds = likes.stream()
            .filter(l -> "DESIGN".equals(l.getTargetType())).map(Like::getTargetId).collect(Collectors.toSet());
        Set<Long> feedIds = likes.stream()
            .filter(l -> "FEED".equals(l.getTargetType())).map(Like::getTargetId).collect(Collectors.toSet());

        Map<Long, Design> dmap = designIds.isEmpty() ? new HashMap<>()
            : designRepo.selectBatchIds(designIds).stream().collect(Collectors.toMap(Design::getId, d -> d));
        Map<Long, Feed> fmap = feedIds.isEmpty() ? new HashMap<>()
            : feedRepo.selectBatchIds(feedIds).stream().collect(Collectors.toMap(Feed::getId, f -> f));

        Set<Long> authorIds = new HashSet<>();
        dmap.values().forEach(d -> authorIds.add(d.getUserId()));
        fmap.values().forEach(f -> authorIds.add(f.getUserId()));
        Map<Long, String> nameMap = authorIds.isEmpty() ? new HashMap<>()
            : userRepo.selectBatchIds(authorIds).stream().collect(Collectors.toMap(
                User::getId, u -> u.getNickname() != null ? u.getNickname() : u.getUsername()));

        List<Map<String, Object>> result = likes.stream().map(l -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", l.getId());
            m.put("targetType", "FEED".equals(l.getTargetType()) ? "动态" : "作品");
            m.put("timeAgo", formatTimeAgo(l.getCreatedAt()));
            if ("DESIGN".equals(l.getTargetType())) {
                Design d = dmap.get(l.getTargetId());
                m.put("targetId", l.getTargetId());
                m.put("title", d != null ? d.getTitle() : "(已删除)");
                m.put("author", d != null ? nameMap.getOrDefault(d.getUserId(), "") : "");
                m.put("patternIndex", (int) (l.getTargetId() % 8));
                m.put("likeCount", d != null && d.getLikeCount() != null ? d.getLikeCount() : 0);
            } else {
                Feed f = fmap.get(l.getTargetId());
                m.put("targetId", l.getTargetId());
                m.put("title", f != null ? safeShorten(f.getContent(), 30) : "(已删除)");
                m.put("author", f != null ? nameMap.getOrDefault(f.getUserId(), "") : "");
                m.put("patternIndex", (int) (l.getTargetId() % 8));
                m.put("likeCount", f != null && f.getLikeCount() != null ? f.getLikeCount() : 0);
            }
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.success(result);
    }

    @Operation(summary = "我收到的赞", description = "别人对我作品/动态的点赞，近 50 条")
    @GetMapping("/received")
    public ApiResponse<List<Map<String, Object>>> received(HttpServletRequest request) {
        Long userId = requireUser(request);

        // 我发布的作品 / 动态 id 列表
        List<Long> myDesignIds = designRepo.selectList(new QueryWrapper<Design>()
            .eq("user_id", userId).select("id")).stream().map(Design::getId).collect(Collectors.toList());
        List<Long> myFeedIds = feedRepo.selectList(new QueryWrapper<Feed>()
            .eq("user_id", userId).select("id")).stream().map(Feed::getId).collect(Collectors.toList());

        // 没有任何自己发布的内容 → 不可能收到赞，直接返回空
        if (myDesignIds.isEmpty() && myFeedIds.isEmpty()) {
            return ApiResponse.success(Collections.emptyList());
        }

        QueryWrapper<Like> qw = new QueryWrapper<>();
        qw.and(w -> {
            if (!myDesignIds.isEmpty()) w.or(x -> x.eq("target_type", "DESIGN").in("target_id", myDesignIds));
            if (!myFeedIds.isEmpty())   w.or(x -> x.eq("target_type", "FEED").in("target_id", myFeedIds));
        });
        qw.ne("user_id", userId).orderByDesc("created_at").last("LIMIT 50");

        List<Like> likes = likeRepo.selectList(qw);
        if (likes.isEmpty()) return ApiResponse.success(Collections.emptyList());

        Set<Long> likerIds = likes.stream().map(Like::getUserId).collect(Collectors.toSet());
        Map<Long, User> likerMap = likerIds.isEmpty() ? new HashMap<>()
            : userRepo.selectBatchIds(likerIds).stream().collect(Collectors.toMap(User::getId, u -> u));

        Set<Long> dIds = likes.stream().filter(l -> "DESIGN".equals(l.getTargetType())).map(Like::getTargetId).collect(Collectors.toSet());
        Set<Long> fIds = likes.stream().filter(l -> "FEED".equals(l.getTargetType())).map(Like::getTargetId).collect(Collectors.toSet());
        Map<Long, Design> dmap = dIds.isEmpty() ? new HashMap<>()
            : designRepo.selectBatchIds(dIds).stream().collect(Collectors.toMap(Design::getId, d -> d));
        Map<Long, Feed> fmap = fIds.isEmpty() ? new HashMap<>()
            : feedRepo.selectBatchIds(fIds).stream().collect(Collectors.toMap(Feed::getId, f -> f));

        List<Map<String, Object>> result = likes.stream().map(l -> {
            User liker = likerMap.get(l.getUserId());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", l.getId());
            m.put("userName", liker != null && liker.getNickname() != null ? liker.getNickname() : (liker != null ? liker.getUsername() : ""));
            m.put("username", liker != null ? liker.getUsername() : "");
            m.put("userTitle", "创作者");
            m.put("targetType", "FEED".equals(l.getTargetType()) ? "动态" : "作品");
            if ("DESIGN".equals(l.getTargetType())) {
                Design d = dmap.get(l.getTargetId());
                m.put("targetTitle", d != null ? d.getTitle() : "(已删除)");
            } else {
                Feed f = fmap.get(l.getTargetId());
                m.put("targetTitle", f != null ? safeShorten(f.getContent(), 30) : "(已删除)");
            }
            m.put("timeAgo", formatTimeAgo(l.getCreatedAt()));
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.success(result);
    }

    /* ────── helpers ────── */

    private String normalize(String type) {
        if (type == null) return "DESIGN";
        switch (type.toLowerCase()) {
            case "design":  return "DESIGN";
            case "feed":    return "FEED";
            case "pattern": return "PATTERN";
            case "comment": return "COMMENT";
            default: return type.toUpperCase();
        }
    }

    private String formatTimeAgo(LocalDateTime t) {
        if (t == null) return "";
        long minutes = ChronoUnit.MINUTES.between(t, LocalDateTime.now());
        if (minutes < 1) return "刚刚";
        if (minutes < 60) return minutes + " 分钟前";
        long hours = minutes / 60;
        if (hours < 24) return hours + " 小时前";
        long days = hours / 24;
        if (days == 1) return "昨天";
        if (days < 7) return days + " 天前";
        return t.toLocalDate().toString();
    }

    private String safeShorten(String s, int n) {
        if (s == null) return "";
        return s.length() <= n ? s : s.substring(0, n) + "...";
    }

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new BusinessException(401, "需要登录");
        return uid;
    }
}
