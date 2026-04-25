package com.beadforge.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.dto.DesignDTO;
import com.beadforge.service.DesignService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/designs")
@RequiredArgsConstructor
public class DesignController {

    private final DesignService designService;

    @PostMapping
    public ApiResponse<DesignDTO> create(HttpServletRequest request, @RequestBody DesignDTO dto) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(designService.createDesign(userId, dto.getTitle(), dto.getDescription(), dto.getCategory()));
    }

    @GetMapping("/public/list")
    public ApiResponse<Page<DesignDTO>> publicList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "latest") String sortBy,
            @RequestParam(required = false) String category) {
        return ApiResponse.success(designService.listDesigns(page, size, sortBy, category));
    }

    @GetMapping("/public/{id}")
    public ApiResponse<DesignDTO> getPublicDesign(@PathVariable Long id) {
        return ApiResponse.success(designService.getDesignById(id));
    }

    /** 公开 — 某用户的发布作品（用于他人主页"作品" tab） */
    @GetMapping("/public/by-user/{userId}")
    public ApiResponse<Page<DesignDTO>> publicByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(designService.listPublicDesignsByUser(userId, page, size));
    }

    @GetMapping("/my")
    public ApiResponse<Page<DesignDTO>> myDesigns(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(designService.listUserDesigns(userId, page, size));
    }

    @PutMapping("/{id}")
    public ApiResponse<DesignDTO> update(HttpServletRequest request,
                                          @PathVariable Long id,
                                          @RequestBody DesignDTO dto) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(designService.updateDesign(userId, id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        designService.deleteDesign(userId, id);
        return ApiResponse.success("删除成功", null);
    }

    @PostMapping("/{id}/duplicate")
    public ApiResponse<DesignDTO> duplicate(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(designService.duplicateDesign(userId, id));
    }
}
