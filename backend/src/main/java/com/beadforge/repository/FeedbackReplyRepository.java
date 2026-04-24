package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.FeedbackReply;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FeedbackReplyRepository extends BaseMapper<FeedbackReply> {
}
