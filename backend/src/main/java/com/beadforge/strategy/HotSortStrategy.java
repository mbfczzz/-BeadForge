package com.beadforge.strategy;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.entity.ApiConfig;
import com.beadforge.model.entity.Design;
import com.beadforge.repository.ApiConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 热度排序：权重可在后台 API配置 中调整 */
@Component
@RequiredArgsConstructor
public class HotSortStrategy implements DesignSortStrategy {

    private final ApiConfigRepository configRepo;

    private int getWeight(String key, int defaultVal) {
        try {
            QueryWrapper<ApiConfig> qw = new QueryWrapper<>();
            qw.eq("config_key", key);
            ApiConfig c = configRepo.selectOne(qw);
            return c != null ? Integer.parseInt(c.getConfigValue()) : defaultVal;
        } catch (Exception e) {
            return defaultVal;
        }
    }

    @Override
    public void applySorting(QueryWrapper<Design> wrapper) {
        int likeW = getWeight("hot_like_weight", 3);
        int viewW = getWeight("hot_view_weight", 1);
        wrapper.orderByDesc("like_count * " + likeW + " + view_count * " + viewW);
    }

    @Override
    public String getStrategyName() { return "hot"; }
}
