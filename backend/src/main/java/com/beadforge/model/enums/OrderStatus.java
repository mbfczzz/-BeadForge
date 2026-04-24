package com.beadforge.model.enums;

/**
 * 订单状态枚举：数据库用英文存；前端显示用中文 label。
 *
 * 状态流：
 *   PENDING（待支付） → PAID（已支付、待发货） → SHIPPED（已发货、待收货）
 *                                              → COMPLETED（已完成）
 *   任一阶段都可进入 CANCELLED（已取消）
 *   COMPLETED / SHIPPED 可申请 REFUND（退款/售后）
 */
public enum OrderStatus {
    PENDING("待支付"),
    PAID("待发货"),
    SHIPPED("待收货"),
    COMPLETED("已完成"),
    CANCELLED("已取消"),
    REFUND("退款/售后");

    private final String label;

    OrderStatus(String label) { this.label = label; }
    public String getLabel() { return label; }

    /** 前端中文 → 后端枚举 */
    public static OrderStatus fromLabel(String label) {
        if (label == null) return null;
        for (OrderStatus s : values()) {
            if (s.label.equals(label) || s.name().equalsIgnoreCase(label)) return s;
        }
        return null;
    }
}
