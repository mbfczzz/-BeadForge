package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 珠饰设计实体
 */
@Data
@TableName("t_design")
public class Design {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;

    private String description;

    private String category;

    private String coverImage;

    /** 设计数据 JSON 格式存储 */
    private String designData;

    /** 状态: DRAFT, PUBLISHED, ARCHIVED */
    private String status;

    private Integer likeCount;

    private Integer viewCount;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
