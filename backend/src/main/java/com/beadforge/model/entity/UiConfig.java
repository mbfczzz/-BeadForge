package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_ui_config")
public class UiConfig {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String configKey;

    /** JSON 字符串 */
    private String configValue;

    private String description;

    private Integer sortOrder;

    private Integer enabled;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
