package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Feed;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FeedRepository extends BaseMapper<Feed> {
}
