package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Follow;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FollowRepository extends BaseMapper<Follow> {
}
