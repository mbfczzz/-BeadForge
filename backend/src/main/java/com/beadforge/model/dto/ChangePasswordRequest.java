package com.beadforge.model.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import lombok.Data;

/**
 * 修改登录密码请求。
 * 校验规则：
 *   - 旧密码必须非空
 *   - 新密码 8-32 位，必须同时包含字母和数字
 *   - 是否等于旧密码、是否与确认密码一致由 Service / 前端各自判断
 */
@Data
public class ChangePasswordRequest {

    @NotBlank(message = "请输入当前密码")
    private String oldPassword;

    @NotBlank(message = "请输入新密码")
    @Size(min = 8, max = 32, message = "新密码长度需 8-32 位")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "新密码需同时包含字母和数字")
    private String newPassword;
}
