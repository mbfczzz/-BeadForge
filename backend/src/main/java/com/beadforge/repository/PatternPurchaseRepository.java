package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.PatternPurchase;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PatternPurchaseRepository extends BaseMapper<PatternPurchase> {
}
