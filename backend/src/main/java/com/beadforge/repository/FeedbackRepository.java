package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Feedback;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FeedbackRepository extends BaseMapper<Feedback> {
}
