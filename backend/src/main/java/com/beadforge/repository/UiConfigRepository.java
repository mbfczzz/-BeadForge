package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.UiConfig;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UiConfigRepository extends BaseMapper<UiConfig> {
}
