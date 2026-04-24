package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 收藏记录。target_type: DESIGN / PATTERN。
 */
@Data
@TableName("t_favorite")
public class Favorite {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;
    private String targetType;
    private Long targetId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
