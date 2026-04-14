package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("t_pattern_purchase")
public class PatternPurchase {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long listingId;
    private BigDecimal price;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
