package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.Danmaku;
import com.beadforge.repository.DanmakuRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 设计/作品详情页弹幕。
 *   GET  /designs/{id}/danmaku       — 列表（最近 200 条；公开）
 *   POST /designs/{id}/danmaku       — 发送（登录态）
 */
@RestController
@RequestMapping("/designs/{designId}/danmaku")
@RequiredArgsConstructor
public class DanmakuController {

    private final DanmakuRepository danmakuRepo;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(@PathVariable Long designId) {
        List<Danmaku> rows = danmakuRepo.selectList(new QueryWrapper<Danmaku>()
            .eq("design_id", designId).orderByDesc("created_at").last("LIMIT 200"));
        List<Map<String, Object>> data = rows.stream().map(d -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", d.getId());
            m.put("text", d.getText());
            m.put("color", d.getColor() == null ? "#fff" : d.getColor());
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.success(data);
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> create(
            @PathVariable Long designId,
            @Valid @RequestBody CreateRequest req,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) throw new BusinessException(401, "需要登录");

        Danmaku d = new Danmaku();
        d.setDesignId(designId);
        d.setUserId(userId);
        d.setText(req.getText().trim());
        d.setColor(req.getColor() == null || req.getColor().isEmpty() ? "#fff" : req.getColor());
        danmakuRepo.insert(d);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("text", d.getText());
        m.put("color", d.getColor());
        return ApiResponse.success("发送成功", m);
    }

    @Data
    public static class CreateRequest {
        @NotBlank(message = "弹幕内容不能为空")
        @Size(max = 60, message = "弹幕最多 60 字")
        private String text;
        private String color;
    }
}
