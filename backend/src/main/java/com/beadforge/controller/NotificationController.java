package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.dto.NotificationDTO;
import com.beadforge.model.entity.Notification;
import com.beadforge.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 站内通知中心。
 *
 * GET  /notifications             — 通知列表（分页，可按 type 过滤）
 * GET  /notifications/unread-count — 未读数（用于红点）
 * POST /notifications/{id}/read   — 标记单条已读
 * POST /notifications/read-all    — 全部已读
 * DELETE /notifications/{id}      — 删除（逻辑删）
 */
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepo;

    @GetMapping
    public ApiResponse<Page<NotificationDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            HttpServletRequest request) {
        Long userId = requireUser(request);

        QueryWrapper<Notification> qw = new QueryWrapper<>();
        qw.eq("user_id", userId);
        if (type != null && !type.isEmpty() && !"全部".equals(type)) {
            qw.eq("type", typeToEn(type));
        }
        qw.orderByDesc("created_at");
        Page<Notification> raw = notificationRepo.selectPage(new Page<>(page, size), qw);

        Page<NotificationDTO> result = new Page<>(raw.getCurrent(), raw.getSize(), raw.getTotal());
        result.setRecords(raw.getRecords().stream().map(NotificationDTO::from).collect(Collectors.toList()));
        return ApiResponse.success(result);
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount(HttpServletRequest request) {
        Long userId = requireUser(request);
        long cnt = notificationRepo.selectCount(new QueryWrapper<Notification>()
            .eq("user_id", userId)
            .eq("unread", 1));
        Map<String, Long> m = new HashMap<>();
        m.put("count", cnt);
        return ApiResponse.success(m);
    }

    @PostMapping("/{id}/read")
    public ApiResponse<Void> markRead(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Notification n = notificationRepo.selectById(id);
        if (n == null || !userId.equals(n.getUserId())) return ApiResponse.error(404, "通知不存在");
        if (Integer.valueOf(1).equals(n.getUnread())) {
            n.setUnread(0);
            notificationRepo.updateById(n);
        }
        return ApiResponse.success(null);
    }

    @PostMapping("/read-all")
    public ApiResponse<Map<String, Integer>> markAllRead(HttpServletRequest request) {
        Long userId = requireUser(request);
        UpdateWrapper<Notification> uw = new UpdateWrapper<>();
        uw.eq("user_id", userId).eq("unread", 1).set("unread", 0);
        int affected = notificationRepo.update(null, uw);
        Map<String, Integer> m = new HashMap<>();
        m.put("affected", affected);
        return ApiResponse.success("已全部标记为已读", m);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Notification n = notificationRepo.selectById(id);
        if (n == null || !userId.equals(n.getUserId())) return ApiResponse.error(404, "通知不存在");
        notificationRepo.deleteById(id);
        return ApiResponse.success(null);
    }

    /* ────── helpers ────── */

    private String typeToEn(String cn) {
        switch (cn) {
            case "系统": return "SYSTEM";
            case "订单": return "ORDER";
            case "互动": return "INTERACT";
            default: return cn;
        }
    }

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new BusinessException(401, "需要登录");
        return uid;
    }
}
