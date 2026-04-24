package com.beadforge.model.dto;

import lombok.Data;

/**
 * 用户 DTO — 隔离敏感字段（password 被 @JsonIgnore 隔离）。
 * 字段对齐前端 UserInfo（auth.ts）：基础 6 字段 + 5 个资料扩展字段。
 */
@Data
public class UserDTO {
    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    private String email;
    private String phone;

    // 资料扩展（对齐前端 UserInfo，EditProfile 页会用到）
    private String bio;
    private String gender;
    private String birthday;
    private String education;
    private String occupation;
}
