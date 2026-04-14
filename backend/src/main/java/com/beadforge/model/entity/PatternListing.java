package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("t_pattern_listing")
public class PatternListing {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long designId;
    private String title;
    private String description;
    private String category;
    private BigDecimal price;
    @TableField("is_free")
    private Integer isFree;
    @TableField("`cols`")
    private Integer cols;
    @TableField("`rows`")
    private Integer rows;
    private String previewData;
    private Integer downloads;
    private BigDecimal rating;
    private String status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
