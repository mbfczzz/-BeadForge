package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.ApiConfig;
import com.beadforge.repository.ApiConfigRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final ApiConfigRepository configRepo;
    private final RestTemplate restTemplate = new RestTemplate();

    /** 获取配置值 */
    private String getConfig(String key) {
        QueryWrapper<ApiConfig> qw = new QueryWrapper<>();
        qw.eq("config_key", key);
        ApiConfig config = configRepo.selectOne(qw);
        return config != null ? config.getConfigValue() : null;
    }

    /**
     * AI 文生图 — 前端调后端，后端代理调豆包API
     * POST /ai/generate-image
     * Body: { "prompt": "可爱的小猫咪" }
     */
    @PostMapping("/generate-image")
    public ApiResponse<Map<String, Object>> generateImage(@RequestBody GenerateRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        String prompt = req.getPrompt();
        if (prompt == null || prompt.trim().isEmpty()) {
            return ApiResponse.error(400, "请输入图案描述");
        }

        // 从数据库实时获取 API Key
        String apiKey = getConfig("doubao_api_key");
        String model = getConfig("doubao_model");
        String baseUrl = getConfig("doubao_base_url");

        if (apiKey == null || model == null || baseUrl == null) {
            return ApiResponse.error(500, "AI服务未配置");
        }

        try {
            // 构建请求
            String url = baseUrl + "/images/generations";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);
            body.put("prompt", "像素风格拼豆图案，简洁可爱，纯色背景，" + prompt.trim());
            body.put("response_format", "url");
            body.put("size", "2K");
            body.put("sequential_image_generation", "disabled");
            body.put("stream", false);
            body.put("watermark", false);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            log.info("AI生图请求: prompt={}, userId={}", prompt.trim(), userId);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map responseBody = response.getBody();
                List<Map> dataList = (List<Map>) responseBody.get("data");

                if (dataList != null && !dataList.isEmpty()) {
                    Map firstItem = dataList.get(0);
                    String imageUrl = (String) firstItem.get("url");

                    Map<String, Object> result = new HashMap<>();
                    result.put("imageUrl", imageUrl);
                    result.put("prompt", prompt.trim());

                    log.info("AI生图成功: userId={}, imageUrl={}", userId, imageUrl);
                    return ApiResponse.success("生成成功", result);
                }
            }

            return ApiResponse.error(500, "AI生成失败，请稍后重试");

        } catch (Exception e) {
            log.error("AI生图异常: {}", e.getMessage(), e);
            return ApiResponse.error(500, "AI服务异常: " + e.getMessage());
        }
    }

    @Data
    static class GenerateRequest {
        private String prompt;
    }
}
