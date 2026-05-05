package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_user_blacklist")
public class UserBlacklist {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long ownerUserId;
    private Long blockedUserId;

    private String reason;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
