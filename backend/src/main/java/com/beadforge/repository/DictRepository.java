package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Dict;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DictRepository extends BaseMapper<Dict> {
}
