package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Product;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductRepository extends BaseMapper<Product> {
}
