package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.DiscoverSetting;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DiscoverSettingRepository extends BaseMapper<DiscoverSetting> {
}
