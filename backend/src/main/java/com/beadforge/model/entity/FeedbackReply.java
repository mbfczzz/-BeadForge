package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 工单回复。fromRole: USER / STAFF。
 */
@Data
@TableName("t_feedback_reply")
public class FeedbackReply {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long feedbackId;

    /** USER / STAFF */
    private String fromRole;

    private String content;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
