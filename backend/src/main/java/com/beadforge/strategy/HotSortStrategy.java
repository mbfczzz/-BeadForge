package com.beadforge.strategy;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.entity.Design;
import org.springframework.stereotype.Component;

/** 热度排序：综合点赞+浏览+时间的加权算法 */
@Component
public class HotSortStrategy implements DesignSortStrategy {
    @Override
    public void applySorting(QueryWrapper<Design> wrapper) {
        // 热度 = like_count * 3 + view_count + 时间衰减
        wrapper.orderByDesc("like_count * 3 + view_count");
    }
    @Override
    public String getStrategyName() { return "hot"; }
}
