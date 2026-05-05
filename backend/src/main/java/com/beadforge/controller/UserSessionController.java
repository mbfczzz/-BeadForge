package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.UserSession;
import com.beadforge.repository.UserSessionRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 登录设备列表（设置页）。
 *   GET    /user-sessions                — 我的登录设备
 *   POST   /user-sessions/heartbeat      — 客户端启动时上报当前设备（自动 upsert，并把 isCurrent 翻转给本设备）
 *   DELETE /user-sessions/{id}           — 移除某设备（不允许删自己）
 */
@RestController
@RequestMapping("/user-sessions")
@RequiredArgsConstructor
public class UserSessionController {

    private final UserSessionRepository repo;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(HttpServletRequest request) {
        Long userId = requireUser(request);
        List<UserSession> rows = repo.selectList(new QueryWrapper<UserSession>()
            .eq("user_id", userId).orderByDesc("last_active_at"));
        return ApiResponse.success(rows.stream().map(this::toView).collect(Collectors.toList()));
    }

    @PostMapping("/heartbeat")
    public ApiResponse<Map<String, Object>> heartbeat(
            @Valid @RequestBody HeartbeatRequest req,
            HttpServletRequest request) {
        Long userId = requireUser(request);

        UserSession existing = repo.selectOne(new QueryWrapper<UserSession>()
            .eq("user_id", userId).eq("device_id", req.getDeviceId()));

        if (existing == null) {
            UserSession s = new UserSession();
            s.setUserId(userId);
            s.setDeviceId(req.getDeviceId());
            s.setDeviceName(req.getDeviceName());
            s.setDeviceMeta(req.getDeviceMeta());
            s.setIsCurrent(1);
            s.setLastActiveAt(LocalDateTime.now());
            repo.insert(s);
            existing = s;
        } else {
            UpdateWrapper<UserSession> uw = new UpdateWrapper<>();
            uw.eq("id", existing.getId())
                .set("device_name", req.getDeviceName())
                .set("device_meta", req.getDeviceMeta())
                .set("is_current", 1)
                .set("last_active_at", LocalDateTime.now());
            repo.update(null, uw);
        }

        // 把同一用户的其它设备 isCurrent 置 0
        UpdateWrapper<UserSession> uwOthers = new UpdateWrapper<>();
        uwOthers.eq("user_id", userId).ne("device_id", req.getDeviceId()).set("is_current", 0);
        repo.update(null, uwOthers);

        return ApiResponse.success("已上报", toView(existing));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        UserSession s = repo.selectById(id);
        if (s == null) return ApiResponse.success(null);
        if (!userId.equals(s.getUserId())) throw new BusinessException(403, "只能管理自己的设备");
        if (Integer.valueOf(1).equals(s.getIsCurrent())) {
            throw new BusinessException(400, "不能移除当前正在使用的设备");
        }
        repo.deleteById(id);
        return ApiResponse.success(null);
    }

    private Map<String, Object> toView(UserSession s) {
        Map<String, Object> v = new LinkedHashMap<>();
        v.put("id", s.getId());
        v.put("name", s.getDeviceName() == null ? "未知设备" : s.getDeviceName());
        v.put("meta", buildMeta(s));
        v.put("current", Integer.valueOf(1).equals(s.getIsCurrent()));
        return v;
    }

    private String buildMeta(UserSession s) {
        StringBuilder sb = new StringBuilder();
        if (Integer.valueOf(1).equals(s.getIsCurrent())) sb.append("当前设备 · ");
        if (s.getDeviceMeta() != null && !s.getDeviceMeta().isEmpty()) sb.append(s.getDeviceMeta()).append(" · ");
        if (s.getLastActiveAt() != null) sb.append(formatActive(s.getLastActiveAt()));
        String out = sb.toString();
        if (out.endsWith(" · ")) out = out.substring(0, out.length() - 3);
        return out;
    }

    private String formatActive(LocalDateTime t) {
        long minutes = ChronoUnit.MINUTES.between(t, LocalDateTime.now());
        if (minutes < 1) return "刚刚活跃";
        if (minutes < 60) return minutes + " 分钟前";
        long hours = minutes / 60;
        if (hours < 24) return String.format("今天 %02d:%02d", t.getHour(), t.getMinute());
        long days = hours / 24;
        if (days == 1) return "昨天 " + String.format("%02d:%02d", t.getHour(), t.getMinute());
        if (days < 7) return days + " 天前";
        return t.toLocalDate().toString();
    }

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new BusinessException(401, "需要登录");
        return uid;
    }

    @Data
    public static class HeartbeatRequest {
        @NotBlank(message = "deviceId 不能为空")
        private String deviceId;
        private String deviceName;
        private String deviceMeta;
    }
}
