package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.OfficialMessage;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OfficialMessageRepository extends BaseMapper<OfficialMessage> {
}
