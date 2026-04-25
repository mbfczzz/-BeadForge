package com.beadforge.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.exception.BusinessException;
import com.beadforge.factory.DesignFactory;
import com.beadforge.model.dto.DesignDTO;
import com.beadforge.model.entity.Design;
import com.beadforge.model.enums.DesignStatus;
import com.beadforge.model.entity.User;
import com.beadforge.repository.DesignRepository;
import com.beadforge.repository.UserRepository;
import com.beadforge.service.DesignService;
import com.beadforge.strategy.DesignSortContext;
import com.beadforge.strategy.DesignSortStrategy;
import com.beadforge.util.ConvertUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DesignServiceImpl implements DesignService {

    private final DesignRepository designRepository;
    private final UserRepository userRepository;
    private final DesignFactory designFactory;
    private final DesignSortContext sortContext;

    @Override
    public DesignDTO createDesign(Long userId, String title, String description, String category) {
        Design design = designFactory.createDraft(userId, title, description, category);
        designRepository.insert(design);
        return ConvertUtil.toDesignDTO(design);
    }

    @Override
    public DesignDTO getDesignById(Long id) {
        Design design = designRepository.selectById(id);
        if (design == null) {
            throw new BusinessException(404, "设计不存在");
        }
        DesignDTO dto = ConvertUtil.toDesignDTO(design);
        User author = userRepository.selectById(design.getUserId());
        if (author != null) dto.setAuthorName(author.getNickname() != null ? author.getNickname() : author.getUsername());
        return dto;
    }

    @Override
    public Page<DesignDTO> listDesigns(int page, int size, String sortBy, String category) {
        QueryWrapper<Design> wrapper = new QueryWrapper<>();
        wrapper.eq("status", DesignStatus.PUBLISHED.name());
        if (category != null && !category.isEmpty()) {
            wrapper.eq("category", category);
        }

        DesignSortStrategy strategy = sortContext.getStrategy(sortBy);
        strategy.applySorting(wrapper);

        Page<Design> designPage = designRepository.selectPage(new Page<>(page, size), wrapper);

        return enrichAuthorNames(designPage);
    }

    @Override
    public Page<DesignDTO> listUserDesigns(Long userId, int page, int size) {
        QueryWrapper<Design> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).orderByDesc("created_at");

        Page<Design> designPage = designRepository.selectPage(new Page<>(page, size), wrapper);
        return enrichAuthorNames(designPage);
    }

    @Override
    public Page<DesignDTO> listPublicDesignsByUser(Long userId, int page, int size) {
        QueryWrapper<Design> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId)
               .eq("status", DesignStatus.PUBLISHED.name())
               .orderByDesc("created_at");

        Page<Design> designPage = designRepository.selectPage(new Page<>(page, size), wrapper);
        return enrichAuthorNames(designPage);
    }

    /** 批量填充 authorName */
    private Page<DesignDTO> enrichAuthorNames(Page<Design> designPage) {
        List<DesignDTO> dtos = designPage.getRecords().stream().map(ConvertUtil::toDesignDTO).collect(Collectors.toList());

        Set<Long> userIds = designPage.getRecords().stream().map(Design::getUserId).collect(Collectors.toSet());
        Map<Long, String> nameMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            userRepository.selectBatchIds(userIds).forEach(u ->
                nameMap.put(u.getId(), u.getNickname() != null ? u.getNickname() : u.getUsername()));
        }
        dtos.forEach(dto -> dto.setAuthorName(nameMap.getOrDefault(dto.getUserId(), "未知")));

        Page<DesignDTO> dtoPage = new Page<>(designPage.getCurrent(), designPage.getSize(), designPage.getTotal());
        dtoPage.setRecords(dtos);
        return dtoPage;
    }

    @Override
    public DesignDTO updateDesign(Long userId, Long designId, DesignDTO dto) {
        Design design = designRepository.selectById(designId);
        if (design == null) {
            throw new BusinessException(404, "设计不存在");
        }
        if (!design.getUserId().equals(userId)) {
            throw new BusinessException(403, "无权修改此设计");
        }
        if (dto.getTitle() != null) design.setTitle(dto.getTitle());
        if (dto.getDescription() != null) design.setDescription(dto.getDescription());
        if (dto.getCategory() != null) design.setCategory(dto.getCategory());
        if (dto.getDesignData() != null) design.setDesignData(dto.getDesignData());
        if (dto.getCoverImage() != null) design.setCoverImage(dto.getCoverImage());
        if (dto.getStatus() != null) design.setStatus(dto.getStatus());
        designRepository.updateById(design);
        return ConvertUtil.toDesignDTO(design);
    }

    @Override
    public void deleteDesign(Long userId, Long designId) {
        Design design = designRepository.selectById(designId);
        if (design == null) {
            throw new BusinessException(404, "设计不存在");
        }
        if (!design.getUserId().equals(userId)) {
            throw new BusinessException(403, "无权删除此设计");
        }
        designRepository.deleteById(designId);
    }

    @Override
    public DesignDTO duplicateDesign(Long userId, Long sourceDesignId) {
        Design source = designRepository.selectById(sourceDesignId);
        if (source == null) {
            throw new BusinessException(404, "源设计不存在");
        }
        Design copy = designFactory.createFromTemplate(userId, source);
        designRepository.insert(copy);
        return ConvertUtil.toDesignDTO(copy);
    }
}
