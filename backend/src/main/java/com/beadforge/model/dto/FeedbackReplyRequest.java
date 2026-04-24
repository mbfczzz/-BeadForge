package com.beadforge.model.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 追加一条工单回复。当前版本只允许工单发起者（USER）追加；
 * 管理端回复（STAFF）走 admin 接口。
 */
@Data
public class FeedbackReplyRequest {

    @NotBlank(message = "回复内容必填")
    private String content;
}
