package com.beadforge.model.dto;

import com.beadforge.model.entity.Address;
import lombok.Data;

/**
 * 前端响应用的 Address DTO。
 * 关键点：`id` 是 String（对齐前端 ProfileAddressItem.id: string），
 * 由 Long 主键转字符串输出，避免 JS 大整数丢精度 + 前端类型契约。
 */
@Data
public class AddressDTO {
    private String id;
    private String receiver;
    private String phone;
    private String region;
    private String detail;
    private String tag;
    private Boolean isDefault;

    public static AddressDTO from(Address a) {
        AddressDTO d = new AddressDTO();
        d.setId(a.getId() == null ? null : String.valueOf(a.getId()));
        d.setReceiver(a.getReceiver());
        d.setPhone(a.getPhone());
        d.setRegion(a.getRegion());
        d.setDetail(a.getDetail());
        d.setTag(a.getTag());
        d.setIsDefault(Integer.valueOf(1).equals(a.getIsDefault()));
        return d;
    }
}
