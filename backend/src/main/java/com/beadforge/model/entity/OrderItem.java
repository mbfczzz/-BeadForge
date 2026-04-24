package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;

/**
 * 订单明细。对应 t_order_item。
 */
@Data
@TableName("t_order_item")
public class OrderItem {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;
    private Long productId;
    private Integer quantity;
    private BigDecimal price;
}
