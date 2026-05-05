package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_official_message")
public class OfficialMessage {
    @TableId(type = IdType.AUTO)
    private Long id;

    /** OFFICIAL / ACTIVITY */
    private String channel;

    private String title;
    private String content;
    private String icon;
    private String color;

    private LocalDateTime publishedAt;

    private Integer enabled;

    @TableLogic
    private Integer deleted;
}
