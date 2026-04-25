package com.beadforge.model.dto;

import com.beadforge.model.entity.Feedback;
import com.beadforge.model.entity.FeedbackReply;
import com.beadforge.service.DictService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 工单响应 DTO — 对齐前端 FeedbackTicketItem。
 *
 * 关键映射：
 * - id: Long → String（前端契约）
 * - type: 英文枚举 → 中文（功能问题 / 订单问题 / 体验建议）
 * - status: 英文枚举 → 中文（处理中 / 待回复 / 已完成）
 * - screenshots: DB 存 JSON 字符串 → List<String>
 */
@Data
public class FeedbackDTO {
    private String id;
    private String type;
    private String title;
    private String content;
    private String status;
    private String createdAt;
    private List<String> screenshots;
    private List<ReplyDTO> replies;

    @Data
    public static class ReplyDTO {
        private String id;
        /** "用户" / "客服" — 对齐前端 */
        private String from;
        private String content;
        private String createdAt;

        public static ReplyDTO from(FeedbackReply r) {
            ReplyDTO d = new ReplyDTO();
            d.setId(String.valueOf(r.getId()));
            d.setFrom("STAFF".equalsIgnoreCase(r.getFromRole()) ? "客服" : "用户");
            d.setContent(r.getContent());
            d.setCreatedAt(r.getCreatedAt() == null ? null : r.getCreatedAt().format(DATETIME_FMT));
            return d;
        }
    }

    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static FeedbackDTO from(Feedback f, List<FeedbackReply> replies) {
        FeedbackDTO d = new FeedbackDTO();
        d.setId(String.valueOf(f.getId()));
        d.setType(typeToCn(f.getType()));
        d.setTitle(f.getTitle());
        d.setContent(f.getContent());
        d.setStatus(statusToCn(f.getStatus()));
        d.setCreatedAt(f.getCreatedAt() == null ? null : f.getCreatedAt().format(DATETIME_FMT));
        d.setScreenshots(parseScreenshots(f.getScreenshots()));
        d.setReplies(replies == null
            ? Collections.emptyList()
            : replies.stream().map(ReplyDTO::from).collect(Collectors.toList()));
        return d;
    }

    @SuppressWarnings("unchecked")
    private static List<String> parseScreenshots(String json) {
        if (json == null || json.isEmpty()) return Collections.emptyList();
        try {
            return MAPPER.readValue(json, List.class);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public static String typeToCn(String en) {
        return en == null ? null : DictService.labelOf("FEEDBACK_TYPE", en);
    }

    public static String typeToEn(String cn) {
        return cn == null ? null : DictService.keyOf("FEEDBACK_TYPE", cn);
    }

    public static String statusToCn(String en) {
        return en == null ? null : DictService.labelOf("FEEDBACK_STATUS", en);
    }
}
