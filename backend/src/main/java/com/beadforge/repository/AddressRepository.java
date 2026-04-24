package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Address;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AddressRepository extends BaseMapper<Address> {
}
