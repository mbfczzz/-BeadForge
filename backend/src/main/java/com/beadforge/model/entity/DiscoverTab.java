package com.beadforge.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_discover_tab")
public class DiscoverTab {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tabKey;
    private String label;
    /** banner id 列表，逗号分隔 */
    private String bannerIds;
    /** 分类列表，逗号分隔 */
    private String categories;
    /** access mode 列表，逗号分隔（free/points/member） */
    private String accessModes;
    private String sortMode;
    private Integer sortOrder;
    private String resultTitle;
    private String emptyText;
    private String searchPlaceholder;
    private Integer isDefault;
    private Integer enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
