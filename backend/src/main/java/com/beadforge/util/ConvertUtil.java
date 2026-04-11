package com.beadforge.util;

import com.beadforge.model.dto.DesignDTO;
import com.beadforge.model.dto.UserDTO;
import com.beadforge.model.entity.Design;
import com.beadforge.model.entity.User;

/**
 * 实体与 DTO 转换工具
 */
public final class ConvertUtil {

    private ConvertUtil() {
    }

    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setNickname(user.getNickname());
        dto.setAvatar(user.getAvatar());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        return dto;
    }

    public static DesignDTO toDesignDTO(Design design) {
        if (design == null) return null;
        DesignDTO dto = new DesignDTO();
        dto.setId(design.getId());
        dto.setUserId(design.getUserId());
        dto.setTitle(design.getTitle());
        dto.setDescription(design.getDescription());
        dto.setCategory(design.getCategory());
        dto.setCoverImage(design.getCoverImage());
        dto.setDesignData(design.getDesignData());
        dto.setStatus(design.getStatus());
        dto.setLikeCount(design.getLikeCount());
        dto.setViewCount(design.getViewCount());
        dto.setCreatedAt(design.getCreatedAt());
        dto.setUpdatedAt(design.getUpdatedAt());
        return dto;
    }
}
