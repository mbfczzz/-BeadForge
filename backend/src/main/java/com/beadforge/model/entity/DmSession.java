package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 私信会话。userAId &lt; userBId 保持唯一对。
 */
@Data
@TableName("t_dm_session")
public class DmSession {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userAId;
    private Long userBId;

    private String lastContent;
    private LocalDateTime lastAt;

    private Integer unreadA;
    private Integer unreadB;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
