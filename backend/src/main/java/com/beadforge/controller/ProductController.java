package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.Product;
import com.beadforge.model.enums.ListingStatus;
import com.beadforge.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    @GetMapping("/list")
    public ApiResponse<Page<Product>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "default") String sortBy) {

        Page<Product> p = new Page<>(page, size);
        QueryWrapper<Product> qw = new QueryWrapper<>();
        qw.eq("status", ListingStatus.ACTIVE.name());
        if (category != null && !category.isEmpty() && !"全部".equals(category)) {
            qw.eq("category", category);
        }
        if ("sales".equals(sortBy)) qw.orderByDesc("sales");
        else if ("price_asc".equals(sortBy)) qw.orderByAsc("price");
        else if ("price_desc".equals(sortBy)) qw.orderByDesc("price");
        else qw.orderByDesc("sales");

        return ApiResponse.success(productRepository.selectPage(p, qw));
    }

    @GetMapping("/{id}")
    public ApiResponse<Product> detail(@PathVariable Long id) {
        Product product = productRepository.selectById(id);
        if (product == null) return ApiResponse.error(404, "商品不存在");
        return ApiResponse.success(product);
    }
}
