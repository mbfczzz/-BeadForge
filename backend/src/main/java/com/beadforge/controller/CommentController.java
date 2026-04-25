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
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 评论。
 *   GET    /comments?type=feed&id=123       — 列表（一级 + 回复扁平展示，按 created_at 倒序）
 *   POST   /comments?type=feed&id=123       — 发评论 body: { content, parentId? }
 *   DELETE /comments/{id}                   — 删除（仅作者本人；事务内 t_feed.comment_count 同步 -1）
 */
@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepo;
    private final UserRepository userRepo;
    private final FeedRepository feedRepo;
    private final DesignRepository designRepo;
    private final LikeRepository likeRepo;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(
            @RequestParam String type,
            @RequestParam Long id,
            HttpServletRequest request) {
        String t = normalize(type);
        Long currentUserId = (Long) request.getAttribute("userId");
        List<Comment> comments = commentRepo.selectList(new QueryWrapper<Comment>()
            .eq("target_type", t).eq("target_id", id).orderByDesc("created_at"));
        if (comments.isEmpty()) return ApiResponse.success(Collections.emptyList());

        // 批量查当前用户对这些 comment 的点赞
        Set<Long> likedCommentIds = new HashSet<>();
        if (currentUserId != null) {
            List<Long> commentIds = comments.stream().map(Comment::getId).collect(Collectors.toList());
            likeRepo.selectList(new QueryWrapper<Like>()
                .eq("user_id", currentUserId).eq("target_type", "COMMENT").in("target_id", commentIds)
                .select("target_id"))
                .forEach(l -> likedCommentIds.add(l.getTargetId()));
        }

        // 批量加载评论作者
        Set<Long> userIds = comments.stream().map(Comment::getUserId).collect(Collectors.toSet());
        Map<Long, User> umap = userRepo.selectBatchIds(userIds).stream()
            .collect(Collectors.toMap(User::getId, u -> u));

        // 收集 parentId → 被回复评论的作者名
        Set<Long> parentIds = comments.stream()
            .map(Comment::getParentId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, String> parentAuthorName = new HashMap<>();
        if (!parentIds.isEmpty()) {
            List<Comment> parents = commentRepo.selectBatchIds(parentIds);
            Set<Long> parentAuthorIds = parents.stream().map(Comment::getUserId).collect(Collectors.toSet());
            // 父评论作者可能不在 umap 里
            Map<Long, User> pAuthors = parentAuthorIds.isEmpty() ? new HashMap<>()
                : userRepo.selectBatchIds(parentAuthorIds).stream()
                    .collect(Collectors.toMap(User::getId, u -> u));
            for (Comment p : parents) {
                User a = pAuthors.get(p.getUserId());
                if (a != null) {
                    parentAuthorName.put(p.getId(), a.getNickname() != null ? a.getNickname() : a.getUsername());
                }
            }
        }

        return ApiResponse.success(comments.stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("content", c.getContent());
            m.put("parentId", c.getParentId());
            m.put("replyToUserName", c.getParentId() == null ? null : parentAuthorName.get(c.getParentId()));
            m.put("timeAgo", formatTimeAgo(c.getCreatedAt()));
            m.put("createdAt", c.getCreatedAt());
            m.put("likeCount", c.getLikeCount() == null ? 0 : c.getLikeCount());
            m.put("liked", likedCommentIds.contains(c.getId()));

            User u = umap.get(c.getUserId());
            Map<String, Object> userInfo = new LinkedHashMap<>();
            userInfo.put("id", c.getUserId());
            userInfo.put("name", u != null ? (u.getNickname() != null ? u.getNickname() : u.getUsername()) : "已注销");
            userInfo.put("title", "创作者");
            m.put("user", userInfo);
            return m;
        }).collect(Collectors.toList()));
    }

    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Map<String, Object>> create(
            @RequestParam String type,
            @RequestParam Long id,
            @org.springframework.web.bind.annotation.RequestBody @javax.validation.Valid CreateRequest req,
            HttpServletRequest request) {
        Long userId = requireUser(request);
        String t = normalize(type);

        // 校验目标存在
        if ("FEED".equals(t)) {
            Feed f = feedRepo.selectById(id);
            if (f == null) throw new BusinessException(404, "动态不存在");
        } else if ("DESIGN".equals(t)) {
            Design d = designRepo.selectById(id);
            if (d == null) throw new BusinessException(404, "作品不存在");
        }

        // 校验 parentId
        if (req.getParentId() != null) {
            Comment parent = commentRepo.selectById(req.getParentId());
            if (parent == null || !parent.getTargetType().equals(t) || !parent.getTargetId().equals(id)) {
                throw new BusinessException(400, "回复的评论不存在");
            }
        }

        Comment c = new Comment();
        c.setUserId(userId);
        c.setTargetType(t);
        c.setTargetId(id);
        c.setContent(req.getContent().trim());
        c.setParentId(req.getParentId());
        commentRepo.insert(c);

        // 同步 +1
        if ("FEED".equals(t)) {
            Feed f = feedRepo.selectById(id);
            if (f != null) {
                f.setCommentCount((f.getCommentCount() == null ? 0 : f.getCommentCount()) + 1);
                feedRepo.updateById(f);
            }
        }

        // 重新查 + enrich 单条返回（复用列表的 user 拼装）
        User u = userRepo.selectById(userId);
        String replyToName = null;
        if (req.getParentId() != null) {
            Comment parent = commentRepo.selectById(req.getParentId());
            if (parent != null) {
                User pu = userRepo.selectById(parent.getUserId());
                if (pu != null) replyToName = pu.getNickname() != null ? pu.getNickname() : pu.getUsername();
            }
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("content", c.getContent());
        m.put("parentId", c.getParentId());
        m.put("replyToUserName", replyToName);
        m.put("timeAgo", "刚刚");
        m.put("createdAt", c.getCreatedAt());
        m.put("likeCount", 0);
        m.put("liked", false);
        Map<String, Object> userInfo = new LinkedHashMap<>();
        userInfo.put("id", userId);
        userInfo.put("name", u != null ? (u.getNickname() != null ? u.getNickname() : u.getUsername()) : "我");
        userInfo.put("title", "创作者");
        m.put("user", userInfo);
        return ApiResponse.success("评论成功", m);
    }

    @DeleteMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Void> remove(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Comment c = commentRepo.selectById(id);
        if (c == null) return ApiResponse.success("已删除", null);
        if (!userId.equals(c.getUserId())) {
            throw new BusinessException(403, "只能删除自己的评论");
        }

        commentRepo.deleteById(id);

        // 同步 -1
        if ("FEED".equals(c.getTargetType())) {
            Feed f = feedRepo.selectById(c.getTargetId());
            if (f != null && f.getCommentCount() != null && f.getCommentCount() > 0) {
                f.setCommentCount(f.getCommentCount() - 1);
                feedRepo.updateById(f);
            }
        }
        return ApiResponse.success("已删除", null);
    }

    /* ────── helpers ────── */

    private String normalize(String type) {
        if (type == null) return "FEED";
        switch (type.toLowerCase()) {
            case "feed":   return "FEED";
            case "design": return "DESIGN";
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

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new BusinessException(401, "需要登录");
        return uid;
    }

    @Data
    public static class CreateRequest {
        @NotBlank(message = "评论内容不能为空")
        @Size(max = 500, message = "评论内容最多 500 字")
        private String content;
        private Long parentId;
    }
}
