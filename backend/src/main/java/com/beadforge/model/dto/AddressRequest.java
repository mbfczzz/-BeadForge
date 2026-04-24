package com.beadforge.model.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 创建 / 更新收货地址的请求体。
 */
@Data
public class AddressRequest {

    @NotBlank(message = "收件人不能为空")
    @Size(max = 50, message = "收件人长度不超过 50")
    private String receiver;

    @NotBlank(message = "手机号不能为空")
    @Size(max = 20, message = "手机号长度不超过 20")
    private String phone;

    @NotBlank(message = "省市区不能为空")
    @Size(max = 100)
    private String region;

    @NotBlank(message = "详细地址不能为空")
    @Size(max = 500)
    private String detail;

    @Size(max = 20)
    private String tag;

    /** 新建或更新时可顺便置为默认；亦可单独走 /addresses/{id}/default */
    private Boolean isDefault;
}
