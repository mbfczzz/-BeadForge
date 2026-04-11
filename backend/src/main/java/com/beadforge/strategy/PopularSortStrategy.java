package com.beadforge.strategy;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.entity.Design;
import org.springframework.stereotype.Component;

@Component
public class PopularSortStrategy implements DesignSortStrategy {

    @Override
    public void applySorting(QueryWrapper<Design> wrapper) {
        wrapper.orderByDesc("like_count");
    }

    @Override
    public String getStrategyName() {
        return "popular";
    }
}
