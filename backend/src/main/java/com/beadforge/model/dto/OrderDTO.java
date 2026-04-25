package com.beadforge.model.dto;

import com.beadforge.model.entity.Order;
import com.beadforge.model.entity.OrderItem;
import com.beadforge.model.enums.OrderStatus;
import com.beadforge.service.DictService;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 订单响应 DTO — 对齐前端 ProfileOrderItem / ProfileDisplayOrder。
 *
 * 基础字段：id, title, amount, status, createdAt, coverLabel
 * 扩展字段（前端 detail 页用）：orderNo, category, imageText, itemCount,
 *                              receiver, phone, address, trackingNo, statusNote
 *
 * 收件人/电话/地址来自当前用户默认地址（订单表暂未存地址快照）。
 * 金额按 number 输出（避免 BigDecimal 字符串化）。
 */
@Data
public class OrderDTO {
    private String id;
    private String orderNo;
    private String title;
    private Double amount;
    private String status;
    private String createdAt;
    private String coverLabel;
    private String category;
    private String imageText;
    private Integer itemCount;
    private String receiver;
    private String phone;
    private String address;
    private String trackingNo;
    private String statusNote;
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
        String idStr = String.valueOf(o.getId());
        d.setId(idStr);
        d.setOrderNo("BF" + idStr);
        d.setTitle(title);
        d.setAmount(o.getTotalAmount() == null ? 0.0 : o.getTotalAmount().doubleValue());
        OrderStatus s = OrderStatus.fromLabel(o.getStatus());
        d.setStatus(s == null ? o.getStatus() : s.getLabel());
        d.setCreatedAt(o.getCreatedAt() == null ? null : o.getCreatedAt().toLocalDate().toString());
        d.setCoverLabel(coverLabel);
        d.setCategory(coverLabel);
        d.setImageText(coverLabel);
        d.setItemCount(0);
        d.setStatusNote(buildStatusNote(s));
        d.setItems(Collections.emptyList());
        return d;
    }

    /** 完整 DTO（含 items，用于详情） */
    public static OrderDTO detail(Order o, String title, String coverLabel, List<OrderItem> items) {
        OrderDTO d = brief(o, title, coverLabel);
        d.setItemCount(items == null ? 0 : items.size());
        d.setItems(items == null
            ? Collections.emptyList()
            : items.stream().map(ItemDTO::from).collect(Collectors.toList()));
        return d;
    }

    /** 把当前用户默认地址填入收货信息 */
    public OrderDTO withReceiver(String receiver, String phone, String address) {
        this.receiver = receiver;
        this.phone = phone;
        this.address = address;
        return this;
    }

    private static String buildStatusNote(OrderStatus s) {
        return s == null ? "" : DictService.descriptionOf("ORDER_STATUS_NOTE", s.name());
    }
}
