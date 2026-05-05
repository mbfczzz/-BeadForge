package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.OfficialMessage;
import com.beadforge.repository.OfficialMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 官方推送（系统/活动）。
 *   GET /official-messages?channel=OFFICIAL  — 列表
 *   admin 维护见 AdminController.officialMessages*
 */
@RestController
@RequestMapping("/official-messages")
@RequiredArgsConstructor
public class OfficialMessageController {

    private final OfficialMessageRepository repo;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(@RequestParam(required = false) String channel) {
        QueryWrapper<OfficialMessage> qw = new QueryWrapper<>();
        qw.eq("enabled", 1);
        if (channel != null && !channel.isEmpty()) qw.eq("channel", channel);
        qw.orderByDesc("published_at");
        List<OfficialMessage> rows = repo.selectList(qw);
        return ApiResponse.success(rows.stream().map(this::toView).collect(Collectors.toList()));
    }

    Map<String, Object> toView(OfficialMessage m) {
        Map<String, Object> v = new LinkedHashMap<>();
        v.put("id", m.getChannel().toLowerCase() + "-" + m.getId());
        v.put("rawId", m.getId());
        v.put("channel", m.getChannel());
        v.put("title", m.getTitle());
        v.put("content", m.getContent());
        v.put("icon", m.getIcon() == null ? "volume-2" : m.getIcon());
        v.put("color", m.getColor() == null ? "#3B82F6" : m.getColor());
        v.put("time", formatTime(m.getPublishedAt()));
        return v;
    }

    private String formatTime(LocalDateTime t) {
        if (t == null) return "";
        long days = ChronoUnit.DAYS.between(t.toLocalDate(), LocalDateTime.now().toLocalDate());
        if (days == 0) return String.format("今天 %02d:%02d", t.getHour(), t.getMinute());
        if (days == 1) return "昨天";
        if (days < 7) return days + " 天前";
        return t.toLocalDate().toString();
    }
}
