package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 站内通知。
 * type:        SYSTEM / ORDER / INTERACT（前端中文：系统 / 订单 / 互动）
 * actionType:  orders / orderDetail / likes / wallet / settings（可空）
 * actionPayload: JSON 字符串，如 {"orderId":"BF240419008","tab":"待收货"}
 */
@Data
@TableName("t_notification")
public class Notification {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String type;
    private String title;
    private String content;

    /** 0 已读 / 1 未读 */
    private Integer unread;

    private String actionType;
    private String actionPayload;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableLogic
    private Integer deleted;
}
