package com.beadforge.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private long designCount;
    private long likeCount;
    private long followerCount;
    private long followingCount;
    /** 创作者等级，由后端基于 designCount/likeCount/followerCount 综合计算，新号为 1 */
    private int level;
}
