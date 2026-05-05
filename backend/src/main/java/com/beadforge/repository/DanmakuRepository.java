package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Danmaku;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DanmakuRepository extends BaseMapper<Danmaku> {
}
