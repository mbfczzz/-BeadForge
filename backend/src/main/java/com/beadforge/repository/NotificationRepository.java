package com.beadforge.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beadforge.model.entity.Notification;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NotificationRepository extends BaseMapper<Notification> {
}
