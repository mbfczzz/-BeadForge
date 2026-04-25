package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_discover_banner")
public class DiscoverBanner {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String sub;
    private Integer pi;
    private String bg;
    private String cat;
    private String sortMode;
    private Integer sortOrder;
    private String eyebrow;
    private String buttonText;
    private String textColor;
    private Integer enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
