package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.WalletLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WalletLogRepository extends BaseMapper<WalletLog> {
}
