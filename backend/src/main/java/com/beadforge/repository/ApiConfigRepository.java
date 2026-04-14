package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.ApiConfig;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ApiConfigRepository extends BaseMapper<ApiConfig> {
}
