package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.User;
import com.beadforge.model.entity.UserBlacklist;
import com.beadforge.repository.UserBlacklistRepository;
import com.beadforge.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 用户黑名单。
 *   GET    /user-blacklist             — 我的黑名单
 *   POST   /user-blacklist             — 拉黑（body: { targetUserId, reason? }）
 *   DELETE /user-blacklist/{id}        — 移出黑名单
 */
@RestController
@RequestMapping("/user-blacklist")
@RequiredArgsConstructor
public class UserBlacklistController {

    private final UserBlacklistRepository repo;
    private final UserRepository userRepo;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(HttpServletRequest request) {
        Long userId = requireUser(request);
        List<UserBlacklist> rows = repo.selectList(new QueryWrapper<UserBlacklist>()
            .eq("owner_user_id", userId).orderByDesc("created_at"));
        if (rows.isEmpty()) return ApiResponse.success(Collections.emptyList());

        Set<Long> blockedIds = rows.stream().map(UserBlacklist::getBlockedUserId).collect(Collectors.toSet());
        Map<Long, User> users = userRepo.selectBatchIds(blockedIds).stream()
            .collect(Collectors.toMap(User::getId, u -> u));

        return ApiResponse.success(rows.stream().map(r -> {
            User u = users.get(r.getBlockedUserId());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", "u" + r.getId());
            m.put("rawId", r.getId());
            m.put("blockedUserId", r.getBlockedUserId());
            m.put("name", u != null ? (u.getNickname() != null ? u.getNickname() : u.getUsername()) : "已注销");
            m.put("reason", r.getReason() == null ? "" : r.getReason());
            return m;
        }).collect(Collectors.toList()));
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> add(
            @Valid @RequestBody AddRequest req,
            HttpServletRequest request) {
        Long userId = requireUser(request);
        if (userId.equals(req.getTargetUserId())) {
            throw new BusinessException(400, "不能拉黑自己");
        }
        User target = userRepo.selectById(req.getTargetUserId());
        if (target == null) throw new BusinessException(404, "用户不存在");

        // 已存在则更新原因
        UserBlacklist existing = repo.selectOne(new QueryWrapper<UserBlacklist>()
            .eq("owner_user_id", userId).eq("blocked_user_id", req.getTargetUserId()));
        if (existing != null) {
            existing.setReason(req.getReason());
            repo.updateById(existing);
            Map<String, Object> upd = new LinkedHashMap<>();
            upd.put("id", "u" + existing.getId());
            return ApiResponse.success("已更新", upd);
        }

        UserBlacklist row = new UserBlacklist();
        row.setOwnerUserId(userId);
        row.setBlockedUserId(req.getTargetUserId());
        row.setReason(req.getReason());
        repo.insert(row);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", "u" + row.getId());
        m.put("rawId", row.getId());
        m.put("name", target.getNickname() != null ? target.getNickname() : target.getUsername());
        m.put("reason", row.getReason() == null ? "" : row.getReason());
        return ApiResponse.success("已加入黑名单", m);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        UserBlacklist row = repo.selectById(id);
        if (row == null) return ApiResponse.success(null);
        if (!userId.equals(row.getOwnerUserId())) {
            throw new BusinessException(403, "只能管理自己的黑名单");
        }
        repo.deleteById(id);
        return ApiResponse.success("已移出黑名单", null);
    }

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new BusinessException(401, "需要登录");
        return uid;
    }

    @Data
    public static class AddRequest {
        @NotNull(message = "targetUserId 不能为空")
        private Long targetUserId;
        private String reason;
    }
}
