package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.DmMessage;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DmMessageRepository extends BaseMapper<DmMessage> {
}
