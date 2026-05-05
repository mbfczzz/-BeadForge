package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.DmSession;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DmSessionRepository extends BaseMapper<DmSession> {
}
