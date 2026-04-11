package com.beadforge.strategy;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 策略上下文 - 根据名称动态选择排序策略
 */
@Component
public class DesignSortContext {

    private final Map<String, DesignSortStrategy> strategyMap;

    public DesignSortContext(List<DesignSortStrategy> strategies) {
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(DesignSortStrategy::getStrategyName, Function.identity()));
    }

    public DesignSortStrategy getStrategy(String name) {
        return strategyMap.getOrDefault(name, strategyMap.get("latest"));
    }
}
