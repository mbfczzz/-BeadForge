package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.*;
import com.beadforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepo;
    private final DesignRepository designRepo;
    private final ProductRepository productRepo;
    private final PatternListingRepository patternRepo;
    private final FeedRepository feedRepo;
    private final FollowRepository followRepo;
    private final ApiConfigRepository apiConfigRepo;

    // ═══════ 统计 ═══════

    @GetMapping("/stats")
    public ApiResponse<Map<String, Long>> stats() {
        Map<String, Long> m = new HashMap<>();
        m.put("users", userRepo.selectCount(new QueryWrapper<User>().eq("deleted", 0)));
        m.put("designs", designRepo.selectCount(new QueryWrapper<Design>().eq("deleted", 0)));
        m.put("products", productRepo.selectCount(new QueryWrapper<Product>().eq("deleted", 0)));
        m.put("feeds", feedRepo.selectCount(new QueryWrapper<Feed>().eq("deleted", 0)));
        m.put("patterns", patternRepo.selectCount(new QueryWrapper<PatternListing>().eq("deleted", 0)));
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
            qw.like("username", keyword).or().like("nickname", keyword);
        }
        qw.orderByDesc("created_at");
        Page<User> result = userRepo.selectPage(new Page<>(page, size), qw);
        // 清除密码
        result.getRecords().forEach(u -> u.setPassword(null));
        return ApiResponse.success(result);
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userRepo.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    // ═══════ 作品管理 ═══════

    @GetMapping("/designs")
    public ApiResponse<Page<Design>> designs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category) {
        QueryWrapper<Design> qw = new QueryWrapper<>();
        if (category != null && !category.isEmpty()) qw.eq("category", category);
        qw.orderByDesc("created_at");
        return ApiResponse.success(designRepo.selectPage(new Page<>(page, size), qw));
    }

    @DeleteMapping("/designs/{id}")
    public ApiResponse<Void> deleteDesign(@PathVariable Long id) {
        designRepo.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    // ═══════ 商品管理 ═══════

    @PostMapping("/products")
    public ApiResponse<Product> addProduct(@RequestBody Product product) {
        product.setStatus("ACTIVE");
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

    @GetMapping("/api-config")
    public ApiResponse<List<ApiConfig>> listApiConfig() {
        return ApiResponse.success(apiConfigRepo.selectList(null));
    }

    @PostMapping("/api-config")
    public ApiResponse<ApiConfig> addApiConfig(@RequestBody ApiConfig config) {
        apiConfigRepo.insert(config);
        return ApiResponse.success("添加成功", config);
    }

    @PutMapping("/api-config/{id}")
    public ApiResponse<ApiConfig> updateApiConfig(@PathVariable Long id, @RequestBody ApiConfig config) {
        config.setId(id);
        apiConfigRepo.updateById(config);
        return ApiResponse.success("更新成功", config);
    }

    @DeleteMapping("/api-config/{id}")
    public ApiResponse<Void> deleteApiConfig(@PathVariable Long id) {
        apiConfigRepo.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }
}
