package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.dto.DesignDTO;
import com.beadforge.model.entity.*;
import com.beadforge.model.enums.ListingStatus;
import com.beadforge.repository.*;
import com.beadforge.util.ConvertUtil;
import com.beadforge.util.SqlUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepo;
    private final DesignRepository designRepo;
    private final ProductRepository productRepo;
    private final PatternListingRepository patternRepo;
    private final FeedRepository feedRepo;
    private final ApiConfigRepository apiConfigRepo;

    // ═══════ 统计 ═══════

    @GetMapping("/stats")
    public ApiResponse<Map<String, Long>> stats() {
        Map<String, Long> m = new HashMap<>();
        m.put("users", userRepo.selectCount(null));
        m.put("designs", designRepo.selectCount(null));
        m.put("products", productRepo.selectCount(null));
        m.put("feeds", feedRepo.selectCount(null));
        m.put("patterns", patternRepo.selectCount(null));
        return ApiResponse.success(m);
    }

    // ═══════ 用户管理 ═══════

    @GetMapping("/users")
    public ApiResponse<Page<User>> users(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        QueryWrapper<User> qw = new QueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            String safe = SqlUtil.escapeLike(keyword);
            qw.and(w -> w.like("username", safe).or().like("nickname", safe));
        }
        qw.orderByDesc("created_at");
        Page<User> result = userRepo.selectPage(new Page<>(page, size), qw);
        result.getRecords().forEach(u -> u.setPassword(null));
        return ApiResponse.success(result);
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userRepo.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    // ═══════ 作品管理（带 authorName） ═══════

    @GetMapping("/designs")
    public ApiResponse<Page<DesignDTO>> designs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category) {
        QueryWrapper<Design> qw = new QueryWrapper<>();
        if (category != null && !category.isEmpty()) qw.eq("category", category);
        qw.orderByDesc("created_at");
        Page<Design> raw = designRepo.selectPage(new Page<>(page, size), qw);

        // 填充 authorName
        Set<Long> uids = raw.getRecords().stream().map(Design::getUserId).collect(Collectors.toSet());
        Map<Long, String> nameMap = new HashMap<>();
        if (!uids.isEmpty()) {
            userRepo.selectBatchIds(uids).forEach(u ->
                nameMap.put(u.getId(), u.getNickname() != null ? u.getNickname() : u.getUsername()));
        }

        Page<DesignDTO> result = new Page<>(raw.getCurrent(), raw.getSize(), raw.getTotal());
        result.setRecords(raw.getRecords().stream().map(d -> {
            DesignDTO dto = ConvertUtil.toDesignDTO(d);
            dto.setAuthorName(nameMap.getOrDefault(d.getUserId(), "未知"));
            return dto;
        }).collect(Collectors.toList()));

        return ApiResponse.success(result);
    }

    @DeleteMapping("/designs/{id}")
    public ApiResponse<Void> deleteDesign(@PathVariable Long id) {
        designRepo.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    // ═══════ 商品管理 ═══════

    @PostMapping("/products")
    public ApiResponse<Product> addProduct(@RequestBody Product product) {
        product.setStatus(ListingStatus.ACTIVE.name());
        if (product.getSales() == null) product.setSales(0);
        if (product.getRating() == null) product.setRating(java.math.BigDecimal.valueOf(5.0));
        productRepo.insert(product);
        return ApiResponse.success("添加成功", product);
    }

    @PutMapping("/products/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        productRepo.updateById(product);
        return ApiResponse.success("更新成功", product);
    }

    @DeleteMapping("/products/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productRepo.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    // ═══════ 图纸管理 ═══════

    @DeleteMapping("/patterns/{id}")
    public ApiResponse<Void> deletePattern(@PathVariable Long id) {
        patternRepo.deleteById(id);
        return ApiResponse.success("下架成功", null);
    }

    // ═══════ 动态管理 ═══════

    @DeleteMapping("/feeds/{id}")
    public ApiResponse<Void> deleteFeed(@PathVariable Long id) {
        feedRepo.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    // ═══════ API 配置 ═══════

    /** list 时 configValue 脱敏（只返回首4+尾4），避免密钥泄露；默认分页，防止表膨胀后一次拉全量 */
    @GetMapping("/api-config")
    public ApiResponse<Page<ApiConfig>> listApiConfig(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<ApiConfig> result = apiConfigRepo.selectPage(new Page<>(page, size),
                new QueryWrapper<ApiConfig>().orderByAsc("id"));
        result.getRecords().forEach(c -> c.setConfigValue(maskSecret(c.getConfigValue())));
        return ApiResponse.success(result);
    }

    /** 单条获取完整值：仅在管理员显式要求时才返回；可在此加审计日志 */
    @GetMapping("/api-config/{id}/reveal")
    public ApiResponse<ApiConfig> revealApiConfig(@PathVariable Long id) {
        ApiConfig c = apiConfigRepo.selectById(id);
        if (c == null) return ApiResponse.error(404, "配置不存在");
        log.warn("[SECURITY_AUDIT] reveal api-config id={} key={}", id, c.getConfigKey());
        return ApiResponse.success(c);
    }

    @PostMapping("/api-config")
    public ApiResponse<ApiConfig> addApiConfig(@RequestBody ApiConfig config) {
        apiConfigRepo.insert(config);
        // 返回时也脱敏，避免回显原文
        ApiConfig safe = new ApiConfig();
        safe.setId(config.getId());
        safe.setConfigKey(config.getConfigKey());
        safe.setConfigValue(maskSecret(config.getConfigValue()));
        safe.setDescription(config.getDescription());
        return ApiResponse.success("添加成功", safe);
    }

    @PutMapping("/api-config/{id}")
    public ApiResponse<ApiConfig> updateApiConfig(@PathVariable Long id, @RequestBody Map<String, String> body) {
        ApiConfig existing = apiConfigRepo.selectById(id);
        if (existing == null) return ApiResponse.error(404, "配置不存在");
        boolean changed = false;
        if (body.containsKey("configValue") && body.get("configValue") != null && !body.get("configValue").isEmpty()) {
            existing.setConfigValue(body.get("configValue"));
            changed = true;
        }
        if (body.containsKey("description") && body.get("description") != null) {
            existing.setDescription(body.get("description"));
            changed = true;
        }
        if (!changed) return ApiResponse.success("无需更新", existing);
        apiConfigRepo.updateById(existing);
        // 响应脱敏
        existing.setConfigValue(maskSecret(existing.getConfigValue()));
        return ApiResponse.success("更新成功", existing);
    }

    @DeleteMapping("/api-config/{id}")
    public ApiResponse<Void> deleteApiConfig(@PathVariable Long id) {
        apiConfigRepo.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    private static String maskSecret(String v) {
        if (v == null || v.isEmpty()) return "";
        if (v.length() <= 8) return "****";
        return v.substring(0, 4) + "****" + v.substring(v.length() - 4);
    }
}
