package com.beadforge.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.model.dto.DesignDTO;

public interface DesignService {

    DesignDTO createDesign(Long userId, String title, String description, String category);

    DesignDTO getDesignById(Long id);

    Page<DesignDTO> listDesigns(int page, int size, String sortBy, String category);

    Page<DesignDTO> listUserDesigns(Long userId, int page, int size);

    DesignDTO updateDesign(Long userId, Long designId, DesignDTO dto);

    void deleteDesign(Long userId, Long designId);

    DesignDTO duplicateDesign(Long userId, Long sourceDesignId);
}
