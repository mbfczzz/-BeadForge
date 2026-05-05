package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_user_session")
public class UserSession {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String deviceId;
    private String deviceName;
    private String deviceMeta;

    private Integer isCurrent;

    private LocalDateTime lastActiveAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
