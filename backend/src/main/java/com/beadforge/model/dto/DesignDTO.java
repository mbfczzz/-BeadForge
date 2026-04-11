package com.beadforge.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DesignDTO {
    private Long id;
    private Long userId;
    private String authorName;
    private String title;
    private String description;
    private String category;
    private String coverImage;
    private String designData;
    private String status;
    private Integer likeCount;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
