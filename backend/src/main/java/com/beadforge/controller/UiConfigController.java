package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.UiConfig;
import com.beadforge.repository.UiConfigRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 前端 UI 配置（启动时拉一次缓存到 Zustand）。
 *   GET /ui-config              — 全部启用项 { key: parsedValue }
 */
@Slf4j
@RestController
@RequestMapping("/ui-config")
@RequiredArgsConstructor
public class UiConfigController {

    private final UiConfigRepository repo;
    private final ObjectMapper json = new ObjectMapper();

    @GetMapping
    public ApiResponse<Map<String, Object>> all() {
        List<UiConfig> rows = repo.selectList(new QueryWrapper<UiConfig>()
            .eq("enabled", 1).orderByAsc("sort_order"));
        Map<String, Object> out = new LinkedHashMap<>();
        for (UiConfig c : rows) {
            out.put(c.getConfigKey(), parseValue(c.getConfigValue()));
        }
        return ApiResponse.success(out);
    }

    private Object parseValue(String raw) {
        if (raw == null || raw.isEmpty()) return null;
        try {
            return json.readValue(raw, Object.class);
        } catch (JsonProcessingException e) {
            log.warn("ui_config 解析失败，原样返回字符串：{}", e.getMessage());
            return raw;
        }
    }
}
