package com.beadforge.model.enums;

/**
 * 上架状态：用于 Product、PatternListing 等可上/下架的实体。
 * 字符串存库便于 SQL 读写；使用 .name() 而非魔法字符串，避免拼写漂移。
 */
public enum ListingStatus {
    ACTIVE("在售"),
    INACTIVE("已下架");

    private final String label;

    ListingStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
