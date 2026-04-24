package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户实体
 */
@Data
@TableName("t_user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    @JsonIgnore
    private String password;

    private String nickname;

    private String avatar;

    private String email;

    private String phone;

    /** 个人简介 */
    private String bio;
    /** 性别：male / female / other */
    private String gender;
    /** 生日 YYYY-MM-DD */
    private String birthday;
    /** 学历 / 教育背景 */
    private String education;
    /** 职业 */
    private String occupation;

    /** 角色: USER / ADMIN */
    private String role;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
