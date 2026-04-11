package com.beadforge.model.enums;

/**
 * 设计状态枚举
 */
public enum DesignStatus {
    DRAFT("草稿"),
    PUBLISHED("已发布"),
    ARCHIVED("已归档");

    private final String label;

    DesignStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
