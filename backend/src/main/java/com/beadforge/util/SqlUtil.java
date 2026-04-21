package com.beadforge.util;

/**
 * SQL 相关工具：转义 LIKE 中的 `%` / `_` / `\`，避免模糊查询语义逃逸。
 */
public final class SqlUtil {

    private SqlUtil() {}

    /**
     * 转义 LIKE 子句中的特殊字符。搭配 MyBatis-Plus QueryWrapper.likeLeft/like/likeRight 使用时，
     * MyBatis-Plus 不会自动转义 `%`、`_`，因此用户输入应先过这一层。
     */
    public static String escapeLike(String input) {
        if (input == null) return null;
        return input
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
