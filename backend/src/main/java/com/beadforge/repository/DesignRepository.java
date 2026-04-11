package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Design;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DesignRepository extends BaseMapper<Design> {
}
