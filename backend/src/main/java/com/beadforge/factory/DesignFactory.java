package com.beadforge.factory;

import com.beadforge.model.entity.Design;
import com.beadforge.model.enums.DesignStatus;
import org.springframework.stereotype.Component;

/**
 * 设计对象工厂 - 封装创建逻辑，统一初始化默认值
 */
@Component
public class DesignFactory {

    public Design createDraft(Long userId, String title, String description, String category) {
        Design design = new Design();
        design.setUserId(userId);
        design.setTitle(title);
        design.setDescription(description);
        design.setCategory(category);
        design.setStatus(DesignStatus.DRAFT.name());
        design.setLikeCount(0);
        design.setViewCount(0);
        return design;
    }

    public Design createFromTemplate(Long userId, Design template) {
        Design design = new Design();
        design.setUserId(userId);
        design.setTitle(template.getTitle() + " - 副本");
        design.setDescription(template.getDescription());
        design.setCategory(template.getCategory());
        design.setDesignData(template.getDesignData());
        design.setStatus(DesignStatus.DRAFT.name());
        design.setLikeCount(0);
        design.setViewCount(0);
        return design;
    }
}
