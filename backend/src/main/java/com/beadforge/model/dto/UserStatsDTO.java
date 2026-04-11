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
}
