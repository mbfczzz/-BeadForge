package com.beadforge.strategy;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.entity.Design;

/**
 * 设计排序策略接口
 */
public interface DesignSortStrategy {

    void applySorting(QueryWrapper<Design> wrapper);

    String getStrategyName();
}
