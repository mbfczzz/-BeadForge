package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 反馈工单主表（对应前端 FeedbackTicketItem）。
 * type / status 用英文枚举存库，由 FeedbackDTO 映射回前端中文。
 */
@Data
@TableName("t_feedback")
public class Feedback {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** FEATURE / ORDER / SUGGESTION */
    private String type;

    private String title;
    private String content;

    /** PROCESSING / WAITING / COMPLETED */
    private String status;

    /** JSON 数组字符串（截图 URL 列表） */
    private String screenshots;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
