package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Wallet;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WalletRepository extends BaseMapper<Wallet> {
}
