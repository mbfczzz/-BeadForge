package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单主表。
 * status: PENDING / PAID / SHIPPED / COMPLETED / CANCELLED / REFUND
 * （REFUND 用于"退款/售后"状态）
 */
@Data
@TableName("t_order")
public class Order {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private BigDecimal totalAmount;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
