package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_feed")
public class Feed {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String content;
    private Long designId;
    private String tags;
    private Integer likeCount;
    private Integer commentCount;
    private Integer shareCount;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
