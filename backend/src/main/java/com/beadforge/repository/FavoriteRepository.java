package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Favorite;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FavoriteRepository extends BaseMapper<Favorite> {
}
