package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.UserBlacklist;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserBlacklistRepository extends BaseMapper<UserBlacklist> {
}
