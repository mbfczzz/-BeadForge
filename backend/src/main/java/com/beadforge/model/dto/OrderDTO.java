package com.beadforge.model.dto;

import com.beadforge.model.entity.Order;
import com.beadforge.model.entity.OrderItem;
import com.beadforge.model.enums.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 订单响应 DTO — 对齐前端 ProfileOrderItem：
 * {
 *   id: string, title: string, amount: number, status: '待支付'..., createdAt: string, coverLabel?: string
 * }
 *
 * title / coverLabel 由订单项（如果只有一条）或第一条+"等 N 件" 组合而成。
 * 金额按 number 输出（避免 BigDecimal 字符串化）。
 */
@Data
public class OrderDTO {
    private String id;
    private String title;
    private Double amount;
    private String status;
    private String createdAt;
    private String coverLabel;
    private List<ItemDTO> items;

    @Data
    public static class ItemDTO {
        private String id;
        private Long productId;
        private Integer quantity;
        private Double price;

        public static ItemDTO from(OrderItem oi) {
            ItemDTO d = new ItemDTO();
            d.setId(String.valueOf(oi.getId()));
            d.setProductId(oi.getProductId());
            d.setQuantity(oi.getQuantity());
            d.setPrice(oi.getPrice() == null ? 0.0 : oi.getPrice().doubleValue());
            return d;
        }
    }

    /** 基础 DTO（不含 items，用于列表） */
    public static OrderDTO brief(Order o, String title, String coverLabel) {
        OrderDTO d = new OrderDTO();
        d.setId(String.valueOf(o.getId()));
        d.setTitle(title);
        d.setAmount(o.getTotalAmount() == null ? 0.0 : o.getTotalAmount().doubleValue());
        OrderStatus s = OrderStatus.fromLabel(o.getStatus());
        d.setStatus(s == null ? o.getStatus() : s.getLabel());
        d.setCreatedAt(o.getCreatedAt() == null ? null : o.getCreatedAt().toLocalDate().toString());
        d.setCoverLabel(coverLabel);
        d.setItems(Collections.emptyList());
        return d;
    }

    /** 完整 DTO（含 items，用于详情） */
    public static OrderDTO detail(Order o, String title, String coverLabel, List<OrderItem> items) {
        OrderDTO d = brief(o, title, coverLabel);
        d.setItems(items == null
            ? Collections.emptyList()
            : items.stream().map(ItemDTO::from).collect(Collectors.toList()));
        return d;
    }
}
