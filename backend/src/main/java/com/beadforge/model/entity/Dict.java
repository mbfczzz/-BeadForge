package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_dict")
public class Dict {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String dictType;
    private String dictKey;
    private String label;
    private String description;
    private Integer sortOrder;
    private Integer enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
