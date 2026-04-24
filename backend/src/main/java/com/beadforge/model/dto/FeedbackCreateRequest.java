package com.beadforge.model.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * 创建工单的请求体。type 接受中文（功能问题/订单问题/体验建议）或英文枚举。
 */
@Data
public class FeedbackCreateRequest {

    @NotBlank(message = "类型必填")
    private String type;

    @NotBlank(message = "标题必填")
    @Size(max = 100)
    private String title;

    @NotBlank(message = "内容必填")
    private String content;

    /** 截图 URL 列表（可选） */
    private List<String> screenshots;
}
