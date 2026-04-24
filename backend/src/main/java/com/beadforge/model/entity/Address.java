package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户收货地址。
 * 字段对齐前端 ProfileAddressItem（api/profile.ts:45-53）。
 */
@Data
@TableName("t_address")
public class Address {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** 收件人姓名 */
    private String receiver;
    /** 收件人手机号 */
    private String phone;
    /** 省市区文本（如 "上海市 浦东新区"）。用前端已有的 region 组合，避免后端维护行政区划 */
    private String region;
    /** 详细地址（路名 + 门牌等） */
    private String detail;
    /** 标签：家 / 公司 等 */
    private String tag;
    /** 是否默认地址：0 否 / 1 是 */
    private Integer isDefault;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
