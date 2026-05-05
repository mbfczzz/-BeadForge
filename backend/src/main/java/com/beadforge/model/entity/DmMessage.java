package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_dm_message")
public class DmMessage {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long sessionId;
    private Long fromUserId;
    private Long toUserId;

    private String content;

    /** photo / gif / null */
    private String attachment;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
