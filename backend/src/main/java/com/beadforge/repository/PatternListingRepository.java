package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.PatternListing;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PatternListingRepository extends BaseMapper<PatternListing> {
}
