package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_danmaku")
public class Danmaku {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long designId;

    private Long userId;

    private String text;

    private String color;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableLogic
    private Integer deleted;
}
