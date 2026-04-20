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

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.net.URL;
import java.util.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final ApiConfigRepository configRepo;
    private final RestTemplate restTemplate = new RestTemplate();

    // 拼豆调色板
    private static final String[] PALETTE = {
        "#EF4444","#F87171","#FCA5A5","#FDA4AF","#F9A8D4","#EC4899",
        "#F97316","#FB923C","#FBBF24","#FCD34D","#FDE68A","#FEF3C7",
        "#22C55E","#16A34A","#86EFAC","#0EA5E9","#7DD3FC","#3B82F6",
        "#8B5CF6","#A78BFA","#C4B5FD","#1E1B2E","#6B7280","#FAFAFA"
    };

    private String getConfig(String key) {
        QueryWrapper<ApiConfig> qw = new QueryWrapper<>();
        qw.eq("config_key", key);
        ApiConfig config = configRepo.selectOne(qw);
        return config != null ? config.getConfigValue() : null;
    }

    /**
     * AI 文生图 → 像素化 → 返回 grid 数组
     * POST /ai/generate-image
     * Body: { "prompt": "可爱的小猫咪", "cols": 16, "rows": 16 }
     */
    @PostMapping("/generate-image")
    public ApiResponse<Map<String, Object>> generateImage(@RequestBody GenerateRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        String prompt = req.getPrompt();
        if (prompt == null || prompt.trim().isEmpty()) return ApiResponse.error(400, "请输入图案描述");

        int cols = req.getCols() > 0 ? req.getCols() : 16;
        int rows = req.getRows() > 0 ? req.getRows() : 16;

        String apiKey = getConfig("doubao_api_key");
        String model = getConfig("doubao_model");
        String baseUrl = getConfig("doubao_base_url");
        if (apiKey == null || model == null || baseUrl == null) return ApiResponse.error(500, "AI服务未配置");

        try {
            // 1. 调豆包生图
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

            log.info("AI生图: prompt={}, cols={}, rows={}, userId={}", prompt.trim(), cols, rows, userId);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null)
                return ApiResponse.error(500, "AI生成失败");

            List<Map> dataList = (List<Map>) response.getBody().get("data");
            if (dataList == null || dataList.isEmpty()) return ApiResponse.error(500, "AI未返回图片");

            String imageUrl = (String) dataList.get(0).get("url");
            log.info("AI生图成功: imageUrl={}", imageUrl);

            // 2. 下载图片 → 像素化为 grid
            BufferedImage original = ImageIO.read(new URL(imageUrl));
            BufferedImage scaled = new BufferedImage(cols, rows, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = scaled.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(original, 0, 0, cols, rows, null);
            g.dispose();

            // 3. 提取颜色 → 匹配调色板
            String[][] grid = new String[rows][cols];
            for (int y = 0; y < rows; y++) {
                for (int x = 0; x < cols; x++) {
                    int rgb = scaled.getRGB(x, y);
                    int r = (rgb >> 16) & 0xFF;
                    int gv = (rgb >> 8) & 0xFF;
                    int b = rgb & 0xFF;
                    if (r > 245 && gv > 245 && b > 245) {
                        grid[y][x] = "transparent";
                    } else {
                        grid[y][x] = nearestColor(r, gv, b);
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("grid", grid);
            result.put("imageUrl", imageUrl);
            result.put("prompt", prompt.trim());
            return ApiResponse.success("生成成功", result);

        } catch (Exception e) {
            log.error("AI生图异常: {}", e.getMessage(), e);
            return ApiResponse.error(500, "AI服务异常，请稍后重试");
        }
    }

    /** RGB → 最近调色板颜色 */
    private String nearestColor(int r, int g, int b) {
        String best = PALETTE[0];
        int minDist = Integer.MAX_VALUE;
        for (String hex : PALETTE) {
            int pr = Integer.parseInt(hex.substring(1, 3), 16);
            int pg = Integer.parseInt(hex.substring(3, 5), 16);
            int pb = Integer.parseInt(hex.substring(5, 7), 16);
            int dist = (r - pr) * (r - pr) + (g - pg) * (g - pg) + (b - pb) * (b - pb);
            if (dist < minDist) { minDist = dist; best = hex; }
        }
        return best;
    }

    @Data
    static class GenerateRequest {
        private String prompt;
        private int cols;
        private int rows;
    }
}
