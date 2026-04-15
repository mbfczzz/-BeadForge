package com.beadforge.strategy;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.entity.Design;
import org.springframework.stereotype.Component;

@Component
public class ViewsSortStrategy implements DesignSortStrategy {
    @Override
    public void applySorting(QueryWrapper<Design> wrapper) {
        wrapper.orderByDesc("view_count");
    }
    @Override
    public String getStrategyName() { return "views"; }
}
