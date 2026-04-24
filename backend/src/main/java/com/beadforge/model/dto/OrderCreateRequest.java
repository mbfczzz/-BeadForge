package com.beadforge.model.dto;

import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 创建订单请求。items 不为空，quantity >= 1。
 * 订单金额由后端按 product.price * quantity 计算，前端 amount 仅做展示参考（不采纳）。
 */
@Data
public class OrderCreateRequest {

    @NotEmpty(message = "订单项不能为空")
    @Valid
    private List<Item> items;

    /** 收货地址 id（可选，若将来做收发货流程则必填） */
    private Long addressId;

    @Data
    public static class Item {
        @NotNull(message = "productId 必填")
        private Long productId;

        @NotNull(message = "quantity 必填")
        @Min(value = 1, message = "quantity 至少 1")
        private Integer quantity;
    }
}
