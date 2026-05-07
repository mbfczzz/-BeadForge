package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.ApiConfig;
import com.beadforge.repository.ApiConfigRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;
import java.util.List;

@Tag(name = "AI 生图", description = "OpenAI 兼容协议文生图 → 像素化为拼豆 grid")
@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final ApiConfigRepository configRepo;
    // gpt-image-1 单次合成 10–30s 是常态，给 60s 读超时；连接握手 10s
    private final RestTemplate restTemplate = buildRestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(60_000);
        return new RestTemplate(factory);
    }

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

    @Operation(summary = "AI 文生图",
            description = "调 OpenAI 兼容生图 → 双线性缩放 → 24 色拼豆调色板匹配，返回 cols×rows 的 hex 颜色 grid")
    @PostMapping("/generate-image")
    public ApiResponse<Map<String, Object>> generateImage(@RequestBody GenerateRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        String prompt = req.getPrompt();
        if (prompt == null || prompt.trim().isEmpty()) return ApiResponse.error(400, "请输入图案描述");

        // 上限 128：拼豆单板最大约 58×58，128 留足头空间；防止恶意请求传超大值导致
        // BufferedImage 分配 + O(cols*rows*PALETTE) 调色板匹配吃光内存/CPU
        int cols = Math.min(req.getCols() > 0 ? req.getCols() : 16, 128);
        int rows = Math.min(req.getRows() > 0 ? req.getRows() : 16, 128);

        String apiKey = getConfig("ai_image_api_key");
        String model = getConfig("ai_image_model");
        String baseUrl = getConfig("ai_image_base_url");
        if (apiKey == null || model == null || baseUrl == null) return ApiResponse.error(500, "AI服务未配置");
        // admin 表单可能让用户粘贴时混入首尾空白 / 换行；零成本 trim 一下
        apiKey = apiKey.trim();
        model = model.trim();
        // 同时去掉 baseUrl 的尾斜杠，避免拼出 "//images/generations"
        baseUrl = baseUrl.trim().replaceAll("/+$", "");
        if (apiKey.isEmpty() || model.isEmpty() || baseUrl.isEmpty()) return ApiResponse.error(500, "AI服务未配置");

        try {
            // 1. 调 OpenAI 兼容生图接口
            String url = baseUrl + "/images/generations";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            // 不写 response_format：dall-e 默认 url，gpt-image-1 默认 b64_json，下方都兼容
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);
            body.put("prompt", "像素风格拼豆图案，简洁可爱，纯色背景，" + prompt.trim());
            body.put("size", "1024x1024");
            body.put("n", 1);

            log.info("AI生图: prompt={}, cols={}, rows={}, userId={}", prompt.trim(), cols, rows, userId);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null)
                return ApiResponse.error(500, "AI生成失败");

            List<Map> dataList = (List<Map>) response.getBody().get("data");
            if (dataList == null || dataList.isEmpty()) return ApiResponse.error(500, "AI未返回图片");

            // 2. 兼容 url / b64_json 两种返回，解码为 BufferedImage
            Map first = dataList.get(0);
            if (first == null) return ApiResponse.error(500, "AI返回数据格式异常");
            String imageUrl = (String) first.get("url");
            String b64 = (String) first.get("b64_json");
            BufferedImage original;
            if (imageUrl != null && !imageUrl.isEmpty()) {
                log.info("AI生图成功(url): imageUrl={}", imageUrl);
                original = downloadImage(imageUrl);
            } else if (b64 != null && !b64.isEmpty()) {
                log.info("AI生图成功(b64): {} bytes", b64.length());
                // MimeDecoder 兼容含换行 / 空白的 base64（部分上游会按 76 字符折行）；
                // 对无空白的纯 base64 也能正确解码，所以无副作用。
                byte[] bytes = Base64.getMimeDecoder().decode(b64);
                try (ByteArrayInputStream bis = new ByteArrayInputStream(bytes)) {
                    original = ImageIO.read(bis);
                }
            } else {
                return ApiResponse.error(500, "AI未返回图片");
            }
            if (original == null) return ApiResponse.error(500, "AI图片解码失败");
            String[][] grid = pixelizeToGrid(original, cols, rows);

            Map<String, Object> result = new HashMap<>();
            result.put("grid", grid);
            if (imageUrl != null) result.put("imageUrl", imageUrl);
            result.put("prompt", prompt.trim());
            return ApiResponse.success("生成成功", result);

        } catch (HttpStatusCodeException e) {
            // OpenAI 兼容协议错误：响应体一般是 {error: {message, code, ...}}
            // 4xx 通常是 prompt 触发审核 / 模型名不存在 / 余额不足，要把 message 透回前端
            String msg = extractApiError(e.getResponseBodyAsString());
            int status = e.getRawStatusCode();
            log.warn("AI生图被拒({}): {}", status, msg);
            return ApiResponse.error(status >= 400 && status < 500 ? 400 : 500,
                    msg != null ? msg : "AI生成失败");
        } catch (ResourceAccessException e) {
            // 连接 / 读超时 / DNS 失败
            log.error("AI生图网络异常: {}", e.getMessage());
            return ApiResponse.error(504, "AI服务网络超时，请稍后重试");
        } catch (Exception e) {
            log.error("AI生图异常: {}", e.getMessage(), e);
            return ApiResponse.error(500, "AI服务异常，请稍后重试");
        }
    }

    @Operation(summary = "图片转拼豆图",
            description = "上传 jpg/png/webp/gif 图片 → 双线性缩放 → 24 色拼豆调色板匹配，返回 cols×rows 的 hex 颜色 grid")
    @PostMapping("/image-to-grid")
    public ApiResponse<Map<String, Object>> imageToGrid(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cols", defaultValue = "16") int cols,
            @RequestParam(value = "rows", defaultValue = "16") int rows,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        if (file == null || file.isEmpty()) return ApiResponse.error(400, "请选择图片");
        if (file.getSize() > 20L * 1024 * 1024) return ApiResponse.error(400, "图片超过 20MB 限制");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ApiResponse.error(400, "仅支持图片格式");
        }

        // 同 AI 路径上限：保护 BufferedImage 分配 + 像素循环
        int c = Math.min(cols > 0 ? cols : 16, 128);
        int r = Math.min(rows > 0 ? rows : 16, 128);

        try (InputStream is = file.getInputStream()) {
            BufferedImage original = ImageIO.read(is);
            if (original == null) return ApiResponse.error(400, "图片解码失败，请换一张");

            // 防压缩炸弹：20MB 限制只挡得住"大文件"，挡不住"小文件解压成超大像素阵"
            // （恶意 PNG 能从几 KB 膨胀到几 GB BufferedImage）。这里 50MP 是个常见相机
            // 全尺寸的两倍上限，正常用户图片不会超。
            long pixels = (long) original.getWidth() * original.getHeight();
            if (pixels > 50_000_000L) {
                return ApiResponse.error(400, "图片分辨率过高，请换一张（建议 50MP 以内）");
            }

            log.info("图片转拼豆: filename={}, size={}, sourcePx={}x{}, target={}x{}, userId={}",
                    file.getOriginalFilename(), file.getSize(),
                    original.getWidth(), original.getHeight(), c, r, userId);

            String[][] grid = pixelizeToGrid(original, c, r);
            Map<String, Object> result = new HashMap<>();
            result.put("grid", grid);
            result.put("cols", c);
            result.put("rows", r);
            return ApiResponse.success("转换成功", result);
        } catch (OutOfMemoryError e) {
            // ImageIO.read 中途 OOM 也可能发生（解码超大像素阵时）；OOMError 不是 Exception，
            // 单独捕获并返回 400 而不是让 servlet 线程死掉
            log.error("图片转拼豆 OOM: {}", e.getMessage());
            return ApiResponse.error(400, "图片过大，请换一张较小的图片");
        } catch (Exception e) {
            log.error("图片转拼豆异常: {}", e.getMessage(), e);
            return ApiResponse.error(500, "图片处理异常，请稍后重试");
        }
    }

    /**
     * 共享的像素化逻辑：BufferedImage → cols×rows 的拼豆 grid。
     * 透明背景的 PNG 在 TYPE_INT_RGB 上 SrcOver 会留下黑像素，先用白填底统一掉，
     * 后续 "近白 → transparent" 判定才稳定。
     */
    private String[][] pixelizeToGrid(BufferedImage original, int cols, int rows) {
        BufferedImage scaled = new BufferedImage(cols, rows, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = scaled.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, cols, rows);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(original, 0, 0, cols, rows, null);
        g.dispose();

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
        return grid;
    }

    /**
     * 带超时的 URL 取图。dall-e 返回的是 Azure CDN 短期签名 URL，正常很快；
     * 但默认 URLConnection 不带超时，若 CDN 异常会无限挂住 servlet 线程，
     * 跟我们刚加的 RestTemplate 60s 超时绕开。这里显式设上限。
     */
    private BufferedImage downloadImage(String imageUrl) throws java.io.IOException {
        URLConnection conn = new URL(imageUrl).openConnection();
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(60_000);
        try (InputStream is = conn.getInputStream()) {
            return ImageIO.read(is);
        }
    }

    private String extractApiError(String body) {
        if (body == null || body.isEmpty()) return null;
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode error = root.get("error");
            if (error != null) {
                JsonNode message = error.get("message");
                if (message != null && !message.isNull()) return message.asText();
            }
        } catch (Exception ignore) {
            // 非 JSON 响应，直接返回原文（截断防止过长）
            return body.length() > 200 ? body.substring(0, 200) + "..." : body;
        }
        return null;
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
