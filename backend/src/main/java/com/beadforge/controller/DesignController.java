package com.beadforge.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.dto.DesignDTO;
import com.beadforge.service.DesignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "作品", description = "拼豆作品（Design）：创建 / 列表 / 详情 / 编辑 / 删除 / 复制")
@RestController
@RequestMapping("/designs")
@RequiredArgsConstructor
public class DesignController {

    private final DesignService designService;

    @Operation(summary = "创建作品")
    @PostMapping
    public ApiResponse<DesignDTO> create(HttpServletRequest request, @RequestBody DesignDTO dto) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(designService.createDesign(userId, dto.getTitle(), dto.getDescription(), dto.getCategory()));
    }

    @Operation(summary = "公开作品列表",
            description = "sortBy 支持 latest / hot / liked；category 可空")
    @GetMapping("/public/list")
    public ApiResponse<Page<DesignDTO>> publicList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "latest") String sortBy,
            @RequestParam(required = false) String category) {
        return ApiResponse.success(designService.listDesigns(page, size, sortBy, category));
    }

    @Operation(summary = "作品详情（公开）")
    @GetMapping("/public/{id}")
    public ApiResponse<DesignDTO> getPublicDesign(@PathVariable Long id) {
        return ApiResponse.success(designService.getDesignById(id));
    }

    @Operation(summary = "某用户的公开作品", description = "他人主页「作品」tab 用")
    @GetMapping("/public/by-user/{userId}")
    public ApiResponse<Page<DesignDTO>> publicByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(designService.listPublicDesignsByUser(userId, page, size));
    }

    @Operation(summary = "我的作品列表",
            description = "可选 status 过滤：DRAFT / PUBLISHED / ARCHIVED；不传返回全部")
    @GetMapping("/my")
    public ApiResponse<Page<DesignDTO>> myDesigns(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(designService.listUserDesigns(userId, page, size, status));
    }

    @Operation(summary = "编辑作品", description = "仅作者本人")
    @PutMapping("/{id}")
    public ApiResponse<DesignDTO> update(HttpServletRequest request,
                                          @PathVariable Long id,
                                          @RequestBody DesignDTO dto) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(designService.updateDesign(userId, id, dto));
    }

    @Operation(summary = "删除作品", description = "仅作者本人；逻辑删")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        designService.deleteDesign(userId, id);
        return ApiResponse.success("删除成功", null);
    }

    @Operation(summary = "复制作品", description = "把任意公开作品复制到我的作品里继续编辑")
    @PostMapping("/{id}/duplicate")
    public ApiResponse<DesignDTO> duplicate(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(designService.duplicateDesign(userId, id));
    }
}
