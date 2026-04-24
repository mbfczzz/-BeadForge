package com.beadforge.model.dto;

import com.beadforge.model.entity.Notification;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Map;

/**
 * 通知响应 DTO — 对齐前端 ProfileNoticeItem：
 * { id, type: '系统'|'订单'|'互动', title, content, timeAgo, unread?, action? }
 *
 * action 字段是 { type, ...其它 } 的对象，前端 tagged union。
 */
@Data
public class NotificationDTO {
    private Long id;
    private String type;
    private String title;
    private String content;
    private String timeAgo;
    private Boolean unread;
    private Map<String, Object> action;

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final DateTimeFormatter YMD = DateTimeFormatter.ofPattern("M-d HH:mm");

    public static NotificationDTO from(Notification n) {
        NotificationDTO d = new NotificationDTO();
        d.setId(n.getId());
        d.setType(typeToCn(n.getType()));
        d.setTitle(n.getTitle());
        d.setContent(n.getContent());
        d.setTimeAgo(formatTimeAgo(n.getCreatedAt()));
        d.setUnread(Integer.valueOf(1).equals(n.getUnread()));
        d.setAction(buildAction(n));
        return d;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> buildAction(Notification n) {
        if (n.getActionType() == null || n.getActionType().isEmpty()) return null;
        Map<String, Object> payload;
        try {
            payload = n.getActionPayload() == null
                ? Collections.emptyMap()
                : MAPPER.readValue(n.getActionPayload(), Map.class);
        } catch (Exception e) {
            payload = Collections.emptyMap();
        }
        payload.put("type", n.getActionType());
        return payload;
    }

    private static String typeToCn(String en) {
        if (en == null) return null;
        switch (en) {
            case "SYSTEM":   return "系统";
            case "ORDER":    return "订单";
            case "INTERACT": return "互动";
            default: return en;
        }
    }

    private static String formatTimeAgo(LocalDateTime t) {
        if (t == null) return "";
        long minutes = ChronoUnit.MINUTES.between(t, LocalDateTime.now());
        if (minutes < 1) return "刚刚";
        if (minutes < 60) return minutes + " 分钟前";
        long hours = minutes / 60;
        if (hours < 24) return hours + " 小时前";
        long days = hours / 24;
        if (days == 1) return "昨天";
        if (days < 7) return days + " 天前";
        return t.format(YMD);
    }
}
