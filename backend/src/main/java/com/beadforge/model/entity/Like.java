package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 点赞记录。target_type: DESIGN / FEED / PATTERN。
 * 类名是 Like（和 SQL 关键字同名），通过 @TableName 指向 t_like。
 * MyBatis-Plus / Spring 不会因为实体类名是 Like 而出问题（仅字符串冲突），
 * 但调用方需注意与 java.lang.* 无冲突（因 Like 不在 lang 包）。
 */
@Data
@TableName("t_like")
public class Like {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;
    private String targetType;
    private Long targetId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
