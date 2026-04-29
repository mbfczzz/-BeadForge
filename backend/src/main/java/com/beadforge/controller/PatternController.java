package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.PatternListing;
import com.beadforge.model.entity.PatternPurchase;
import com.beadforge.model.entity.User;
import com.beadforge.model.enums.ListingStatus;
import com.beadforge.repository.PatternListingRepository;
import com.beadforge.repository.PatternPurchaseRepository;
import com.beadforge.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Tag(name = "图纸市场", description = "图纸（Pattern）：浏览 / 发布 / 购买（含免费下载）")
@RestController
@RequestMapping("/patterns")
@RequiredArgsConstructor
public class PatternController {

    private final PatternListingRepository listingRepo;
    private final PatternPurchaseRepository purchaseRepo;
    private final UserRepository userRepo;

    @Operation(summary = "图纸市场列表",
            description = "公开接口；sortBy: latest / hot / price_asc / free")
    @GetMapping("/list")
    public ApiResponse<Page<Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "latest") String sortBy) {

        Page<PatternListing> p = new Page<>(page, size);
        QueryWrapper<PatternListing> qw = new QueryWrapper<>();
        qw.eq("status", ListingStatus.ACTIVE.name());
        if (category != null && !category.isEmpty() && !"全部".equals(category)) {
            qw.eq("category", category);
        }
        if ("hot".equals(sortBy)) qw.orderByDesc("downloads");
        else if ("price_asc".equals(sortBy)) qw.orderByAsc("price");
        else if ("free".equals(sortBy)) qw.eq("is_free", 1).orderByDesc("downloads");
        else qw.orderByDesc("created_at");

        Page<PatternListing> result = listingRepo.selectPage(p, qw);

        // 附加作者名
        Set<Long> userIds = result.getRecords().stream().map(PatternListing::getUserId).collect(Collectors.toSet());
        Map<Long, String> nameMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            userRepo.selectBatchIds(userIds).forEach(u -> nameMap.put(u.getId(), u.getNickname() != null ? u.getNickname() : u.getUsername()));
        }

        Page<Map<String, Object>> mapped = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        mapped.setRecords(result.getRecords().stream().map(pl -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", pl.getId());
            m.put("title", pl.getTitle());
            m.put("author", nameMap.getOrDefault(pl.getUserId(), "未知"));
            m.put("authorId", pl.getUserId());
            m.put("description", pl.getDescription());
            m.put("category", pl.getCategory());
            m.put("price", pl.getPrice());
            m.put("free", Integer.valueOf(1).equals(pl.getIsFree()));
            m.put("cols", pl.getCols());
            m.put("rows", pl.getRows());
            m.put("downloads", pl.getDownloads());
            m.put("rating", pl.getRating());
            m.put("createdAt", pl.getCreatedAt());
            // grid 预览数据：发布时已存为 JSON 字符串，列表里直接透传供「开始制作」回填画布
            m.put("previewData", pl.getPreviewData());
            return m;
        }).collect(Collectors.toList()));

        return ApiResponse.success(mapped);
    }

    @Operation(summary = "发布图纸", description = "价格 ≤ 0 自动标记为免费图纸")
    @PostMapping("/publish")
    public ApiResponse<PatternListing> publish(@RequestBody PatternListing listing, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        listing.setUserId(userId);
        listing.setStatus(ListingStatus.ACTIVE.name());
        listing.setDownloads(0);
        listing.setRating(BigDecimal.valueOf(5.0));
        listing.setIsFree(listing.getPrice() == null || listing.getPrice().compareTo(BigDecimal.ZERO) <= 0 ? 1 : 0);
        listingRepo.insert(listing);
        return ApiResponse.success("发布成功", listing);
    }

    @Operation(summary = "购买/下载图纸",
            description = "免费图纸即下载、付费图纸需扣款；写购买记录与下载量在同一事务")
    @PostMapping("/{id}/buy")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Void> buy(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        // 检查是否已购
        QueryWrapper<PatternPurchase> qw = new QueryWrapper<>();
        qw.eq("user_id", userId).eq("listing_id", id);
        if (purchaseRepo.selectCount(qw) > 0) {
            return ApiResponse.error(400, "已经拥有此图纸");
        }

        PatternListing listing = listingRepo.selectById(id);
        if (listing == null) return ApiResponse.error(404, "图纸不存在");

        PatternPurchase purchase = new PatternPurchase();
        purchase.setUserId(userId);
        purchase.setListingId(id);
        boolean free = Integer.valueOf(1).equals(listing.getIsFree());
        purchase.setPrice(free ? BigDecimal.ZERO : listing.getPrice());
        purchaseRepo.insert(purchase);

        // 增加下载量
        listing.setDownloads(listing.getDownloads() + 1);
        listingRepo.updateById(listing);

        return ApiResponse.success(free ? "下载成功" : "购买成功", null);
    }

    @Operation(summary = "我的已购图纸 ID 列表")
    @GetMapping("/purchased")
    public ApiResponse<List<Long>> purchased(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        QueryWrapper<PatternPurchase> qw = new QueryWrapper<>();
        qw.eq("user_id", userId).select("listing_id");
        List<Long> ids = purchaseRepo.selectList(qw).stream().map(PatternPurchase::getListingId).collect(Collectors.toList());
        return ApiResponse.success(ids);
    }
}
