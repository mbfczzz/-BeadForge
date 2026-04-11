package com.beadforge.model.dto;

import lombok.Data;

/**
 * 用户 DTO - 隔离敏感字段
 */
@Data
public class UserDTO {
    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    private String email;
    private String phone;
}
