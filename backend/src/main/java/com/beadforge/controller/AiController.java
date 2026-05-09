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
    // dall-e-2 ~5-10s / dall-e-3 ~15-30s / gpt-image-1 ~10-30s，给 60s 读超时覆盖最慢档；连接握手 10s
    private final RestTemplate restTemplate = buildRestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(60_000);
        return new RestTemplate(factory);
    }

    // 拼豆调色板预设。"default" 是 36 色（包含肖像必备的肤色 / 发色 / 唇色 / 高光暖白）；
    // "classic" 是原 24 色（不含人像色，适合卡通 / 抽象图）。两套都是 hex 数组。
    private static final String[] PALETTE_DEFAULT_36 = {
        // 行 1：红 / 粉
        "#EF4444","#F87171","#FCA5A5","#FDA4AF","#F9A8D4","#EC4899",
        // 行 2：橙 / 黄
        "#F97316","#FB923C","#FBBF24","#FCD34D","#FDE68A","#FEF3C7",
        // 行 3：绿 / 蓝
        "#22C55E","#16A34A","#86EFAC","#0EA5E9","#7DD3FC","#3B82F6",
        // 行 4：紫 / 中性
        "#8B5CF6","#A78BFA","#C4B5FD","#1E1B2E","#6B7280","#FAFAFA",
        // 行 5：肤色阶（亮 → 暗）
        "#FDD9B4","#F8C399","#F4B68F","#DDA67D","#C68863","#8B5A2B",
        // 行 6：头发 / 唇 / 高光
        "#2C1810","#5D4037","#A0784A","#DEB887","#B8534F","#F8F0E5"
    };
    private static final String[] PALETTE_CLASSIC_24 = {
        "#EF4444","#F87171","#FCA5A5","#FDA4AF","#F9A8D4","#EC4899",
        "#F97316","#FB923C","#FBBF24","#FCD34D","#FDE68A","#FEF3C7",
        "#22C55E","#16A34A","#86EFAC","#0EA5E9","#7DD3FC","#3B82F6",
        "#8B5CF6","#A78BFA","#C4B5FD","#1E1B2E","#6B7280","#FAFAFA"
    };

    // 调色板的 RGB 与 LAB 表示。类加载时为每套预设各算一份，请求时按 key 查表。
    // LAB 用于 ΔE 最近色匹配（比 RGB 欧氏更贴近人眼）；RGB 用于 Floyd-Steinberg 误差扩散。
    private static final Map<String, String[]> PALETTES = new HashMap<>();
    private static final Map<String, int[][]> PALETTE_RGB_MAP = new HashMap<>();
    private static final Map<String, double[][]> PALETTE_LAB_MAP = new HashMap<>();
    static {
        registerPalette("default", PALETTE_DEFAULT_36);
        registerPalette("classic", PALETTE_CLASSIC_24);
    }

    private static void registerPalette(String key, String[] hexes) {
        int[][] rgbs = new int[hexes.length][3];
        double[][] labs = new double[hexes.length][3];
        for (int i = 0; i < hexes.length; i++) {
            String hex = hexes[i];
            int r = Integer.parseInt(hex.substring(1, 3), 16);
            int g = Integer.parseInt(hex.substring(3, 5), 16);
            int b = Integer.parseInt(hex.substring(5, 7), 16);
            rgbs[i] = new int[]{r, g, b};
            labs[i] = rgbToLab(r, g, b);
        }
        PALETTES.put(key, hexes);
        PALETTE_RGB_MAP.put(key, rgbs);
        PALETTE_LAB_MAP.put(key, labs);
    }

    /** 解析 palette key，找不到则回 default。返回 {hex[], rgb[][], lab[][]} 三件套 */
    private static Object[] resolvePalette(String key) {
        String k = (key != null && PALETTES.containsKey(key)) ? key : "default";
        return new Object[]{PALETTES.get(k), PALETTE_RGB_MAP.get(k), PALETTE_LAB_MAP.get(k)};
    }

    private String getConfig(String key) {
        QueryWrapper<ApiConfig> qw = new QueryWrapper<>();
        qw.eq("config_key", key);
        ApiConfig config = configRepo.selectOne(qw);
        return config != null ? config.getConfigValue() : null;
    }

    @Operation(summary = "AI 文生图",
            description = "调 OpenAI 兼容生图 → 双线性缩放 → 拼豆调色板匹配，返回 cols×rows 的 hex 颜色 grid")
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

            // 显式要 b64_json：避免再发一次 HTTP 下载图（默认 url 模式 1-2s round-trip）。
            // 下方仍保留 url 解析路径——个别代理会忽略此参数继续返回 url 字段
            // gpt-image-1 不接受 response_format（官方 API 直接 400），且默认就返 b64_json
            boolean isGptImage = model.toLowerCase().contains("gpt-image");
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);
            body.put("prompt", "像素风格拼豆图案，简洁可爱，纯色背景，" + prompt.trim());
            body.put("size", "1024x1024");
            body.put("n", 1);
            if (!isGptImage) body.put("response_format", "b64_json");

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
            // AI 文生图路径：图本来就是 AI 出的（已卡通化），跳 k-means
            String[][] grid = pixelizeToGrid(original, cols, rows, req.getPalette(), false, "fs", 1.0f);

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
            description = "上传 jpg/png/webp/gif 图片 → 可选 AI 卡通化 → k-means 量化 → 拼豆调色板匹配，返回 cols×rows 的 hex 颜色 grid")
    @PostMapping("/image-to-grid")
    public ApiResponse<Map<String, Object>> imageToGrid(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cols", defaultValue = "16") int cols,
            @RequestParam(value = "rows", defaultValue = "16") int rows,
            @RequestParam(value = "palette", defaultValue = "default") String palette,
            @RequestParam(value = "aiEnhance", defaultValue = "false") boolean aiEnhance,
            @RequestParam(value = "style", defaultValue = "auto") String style,
            // 抖动算法："fs"（Floyd-Steinberg，渐变细腻）/ "atkinson"（颗粒复古）/ "none"（色块）
            @RequestParam(value = "dither", defaultValue = "fs") String dither,
            // 抖动强度 0.0-1.0，越低越像色块。block 模式忽略此参数
            @RequestParam(value = "ditherStrength", defaultValue = "1.0") float ditherStrength,
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

            log.info("图片转拼豆: filename={}, size={}, sourcePx={}x{}, target={}x{}, palette={}, aiEnhance={}, style={}, dither={}, strength={}, userId={}",
                    file.getOriginalFilename(), file.getSize(),
                    original.getWidth(), original.getHeight(), c, r, palette, aiEnhance, style, dither, ditherStrength, userId);

            // AI 增强：把照片喂给配置中的图像模型让它重绘成"简化卡通色块"风格。
            // 关键 trick：把调色板 hex 列表直接拼进 prompt，AI 会偏向用这些色出图，
            // 出来的图本身就是"调色板预匹配"，下游 pixelize 几乎恒等映射，
            // 颜色 1:1 还原 AI 的创作意图。
            BufferedImage processed = original;
            boolean aiUsed = false;
            if (aiEnhance) {
                BufferedImage stylized = aiStylize(original, style, c, r, palette);
                if (stylized != null) {
                    processed = stylized;
                    aiUsed = true;
                    log.info("AI 增强成功: stylizedPx={}x{}", stylized.getWidth(), stylized.getHeight());
                } else {
                    log.warn("AI 增强失败，降级到本地算法（仍按原图走管线）");
                }
            }

            // AI 增强时跳过 k-means（AI 已经把图卡通化成有限色块，再 k-means 是冗余 +
            // 可能反而把 AI 仔细安排的色块边界给"再聚合"模糊掉）。本地算法路径保留 k-means。
            String[][] grid = pixelizeToGrid(processed, c, r, palette, !aiUsed, dither, ditherStrength);
            Map<String, Object> result = new HashMap<>();
            result.put("grid", grid);
            result.put("cols", c);
            result.put("rows", r);
            result.put("palette", palette);
            result.put("aiUsed", aiUsed);
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
     * AI 卡通化（两步法 / 2025-05 版）：
     *
     * 之前直接用 /images/edits（图生图）的方案在很多 OpenAI 兼容代理（含 oaipro）
     * 上不可用——代理路由表没注册"images/edits + gpt-image-1"这条组合，请求被拒
     * 503 "无可用渠道"。换成全代理都支持的两步组合：
     *
     *   Step 1  POST /chat/completions  with  gpt-4o-mini (vision)
     *           "看这张图，简练描述主体 / 主要特征 / 主色"
     *           ↓
     *           description: "Young woman with brown shoulder-length hair, ..."
     *
     *   Step 2  POST /images/generations  with  ai_image_model（dall-e-2 / dall-e-3）
     *           prompt = 风格指令 + 上述描述 + 调色板 hex 列表
     *           ↓
     *           AI 卡通图（按描述生成，会偏向调色板色）
     *
     * 损失：失去"逐像素 likeness"——AI 看到的是文字描述不是图本身，所以"看起来像
     * 我"会变成"看起来像描述里那种人"。换来的是任何 OpenAI 代理都能跑通。
     * 至于 48×48 拼豆本来也表达不出精确人脸，所以这个损失可接受。
     */
    private BufferedImage aiStylize(BufferedImage original, String style, int targetCols, int targetRows, String paletteKey) {
        String apiKey = getConfig("ai_image_api_key");
        String imageModel = getConfig("ai_image_model");
        String visionModel = getConfig("ai_vision_model");
        String baseUrl = getConfig("ai_image_base_url");
        if (apiKey == null || imageModel == null || baseUrl == null) return null;

        // vision 模型是可选配置，没配就默认 gpt-4o-mini（最便宜的 vision 模型）
        if (visionModel == null || visionModel.trim().isEmpty()) {
            visionModel = "gpt-4o-mini";
        }

        apiKey = apiKey.trim();
        imageModel = imageModel.trim();
        visionModel = visionModel.trim();
        baseUrl = baseUrl.trim().replaceAll("/+$", "");
        if (apiKey.isEmpty() || imageModel.isEmpty() || baseUrl.isEmpty()) return null;

        try {
            // Step 1: 让 vision 模型看图写描述（512px 给它看就够，省 token）
            String description = aiVisionDescribe(original, apiKey, baseUrl, visionModel);
            if (description == null || description.trim().isEmpty()) {
                log.warn("AI vision 描述失败 → 降级");
                return null;
            }
            log.info("AI vision 描述({}字): {}",
                    description.length(),
                    description.length() > 120 ? description.substring(0, 120) + "..." : description);

            // Step 2: 把 description 喂给 /images/generations 出卡通图
            // dall-e-2 prompt 上限 1000 字，dall-e-3 是 4000 字 — 给 builder 一个 budget 约束
            boolean isDallE3 = imageModel.toLowerCase().contains("dall-e-3");
            int promptBudget = isDallE3 ? 4000 : 1000;
            String fullPrompt = buildStylePromptWithDescription(description, style, paletteKey, promptBudget);
            String outputSize = pickOutputSize(targetCols, targetRows, imageModel);
            return aiGenerateFromText(fullPrompt, imageModel, apiKey, baseUrl, outputSize);
        } catch (HttpStatusCodeException e) {
            String msg = extractApiError(e.getResponseBodyAsString());
            log.warn("AI 风格化被拒({}): {}", e.getRawStatusCode(), msg);
            return null;
        } catch (ResourceAccessException e) {
            log.warn("AI 风格化网络异常: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.warn("AI 风格化异常: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Vision 描述：调 /chat/completions 让 vision 模型看图写一段简练的视觉描述。
     * 下一步用这段描述驱动 /images/generations 出卡通图。
     */
    private String aiVisionDescribe(BufferedImage img, String apiKey, String baseUrl, String visionModel) throws Exception {
        // 给 vision 看的图压到 512px，detail:low 模式下 OpenAI 也只看缩略，再大没意义
        byte[] pngBytes = resizeToPng(img, 512);
        String dataUrl = "data:image/png;base64,"
                + java.util.Base64.getEncoder().encodeToString(pngBytes);

        String url = baseUrl + "/chat/completions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        // OpenAI vision messages 格式：content 是一个数组，含 text + image_url 两段
        Map<String, Object> textPart = new LinkedHashMap<>();
        textPart.put("type", "text");
        textPart.put("text",
                "Describe the main subject of this image briefly for a cartoon recreation. "
              + "Include: subject type (person/animal/object), key visual features (hair color, "
              + "eye color, clothing, expression for portraits; species/pose for animals; shape/"
              + "material for objects), dominant colors, background. 60 words max, concrete.");

        Map<String, Object> imageUrl = new LinkedHashMap<>();
        imageUrl.put("url", dataUrl);
        imageUrl.put("detail", "low");
        Map<String, Object> imagePart = new LinkedHashMap<>();
        imagePart.put("type", "image_url");
        imagePart.put("image_url", imageUrl);

        Map<String, Object> userMsg = new LinkedHashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", Arrays.asList(textPart, imagePart));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", visionModel);
        body.put("messages", Arrays.asList(userMsg));
        body.put("max_tokens", 200);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST,
                new HttpEntity<>(body, headers), Map.class);
        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) return null;

        List<Map> choices = (List<Map>) response.getBody().get("choices");
        if (choices == null || choices.isEmpty()) return null;
        Map firstChoice = choices.get(0);
        Map message = (Map) firstChoice.get("message");
        if (message == null) return null;
        Object content = message.get("content");
        return content instanceof String ? ((String) content).trim() : null;
    }

    /** 调 /images/generations 用 prompt 出图；同 generateImage 端点的核心逻辑，抽出来给两步法复用 */
    private BufferedImage aiGenerateFromText(String prompt, String model, String apiKey, String baseUrl, String size) throws Exception {
        String url = baseUrl + "/images/generations";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        boolean isGptImage = model != null && model.toLowerCase().contains("gpt-image");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("prompt", prompt);
        body.put("size", size);
        body.put("n", 1);
        // 同 generateImage：要 b64_json 省一次下载 round-trip。但 gpt-image-1 不接受
        // response_format（默认就返 b64_json），传了会 400
        if (!isGptImage) body.put("response_format", "b64_json");

        log.info("AI 文生图(两步法 step2): promptLen={}, size={}", prompt.length(), size);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST,
                new HttpEntity<>(body, headers), Map.class);
        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) return null;

        List<Map> dataList = (List<Map>) response.getBody().get("data");
        if (dataList == null || dataList.isEmpty()) return null;
        Map first = dataList.get(0);
        if (first == null) return null;

        String imageUrl = (String) first.get("url");
        String b64 = (String) first.get("b64_json");
        if (imageUrl != null && !imageUrl.isEmpty()) return downloadImage(imageUrl);
        if (b64 != null && !b64.isEmpty()) {
            byte[] bytes = Base64.getMimeDecoder().decode(b64);
            try (ByteArrayInputStream bis = new ByteArrayInputStream(bytes)) {
                return ImageIO.read(bis);
            }
        }
        return null;
    }

    /**
     * 两步法 step2 的 prompt 拼装：
     *   stylePart  + " Subject: " + description + " " + base + " " + palettePart
     *
     * stylePart  按风格定制（由 step1 的 description 提供主体细节，stylePart 控制"怎么画"）
     * description vision 模型刚写的"主体描述"——这是替代 /images/edits 看图的核心
     * base        共同约束（色块化、纯色背景、无渐变）
     * palettePart 调色板 hex 列表——让 AI 偏向用我们的色出图，下游匹配近恒等
     *
     * budget = 模型可接受的 prompt 字符上限（dall-e-2 = 1000，dall-e-3 = 4000）。
     * 拼好后若超 budget，按"截 description → 减少调色板色数 → 截尾兜底"顺序压缩。
     */
    private String buildStylePromptWithDescription(String description, String style, String paletteKey, int budget) {
        String stylePart;
        if (style == null) style = "auto";
        switch (style.toLowerCase()) {
            case "portrait":
                stylePart = "Create a simplified realistic cartoon portrait illustration "
                          + "with 2-3 solid skin tones, hair as flat color blocks, clear large "
                          + "facial features (eyes, nose, mouth).";
                break;
            case "chibi":
                stylePart = "Create an adorable chibi (Q-version) character illustration with "
                          + "big round eyes, simple highlights, small nose, simple mouth, "
                          + "oversized head and simplified body, pastel solid skin tones, smooth "
                          + "hair color shapes. Sanrio-like cute aesthetic.";
                break;
            case "anime":
                stylePart = "Create an anime / manga character illustration with large "
                          + "expressive eyes, clean simplified line art as color blocks, smooth "
                          + "skin in 2-3 tones, cel-shaded animation quality.";
                break;
            case "scene":
                stylePart = "Create a simplified flat illustration with bold solid color "
                          + "shapes, clear boundaries, cartoon-style scene rendering.";
                break;
            case "auto":
            default:
                stylePart = "Create a simplified cartoon illustration suitable for a fuse-bead "
                          + "craft pattern.";
        }

        String base = "Use bold flat color blocks, no gradients, no fine details, replace the "
                    + "background with a single plain solid color.";

        String[] palette = (String[]) resolvePalette(paletteKey)[0];

        // 优先级：stylePart / base 必保留（它们决定"怎么画"），description 可截，palette 可减色
        // 先用全色板拼一次，超 budget 再降级
        String desc = description.trim();
        String prompt = assemblePrompt(stylePart, desc, base, palette);
        if (prompt.length() <= budget) return prompt;

        // 超了：先把调色板减到 24 色（默认 36 色截前 24 / 等步采样保色相分布）
        if (palette.length > 24) {
            String[] sampled = sampleEvenly(palette, 24);
            prompt = assemblePrompt(stylePart, desc, base, sampled);
            if (prompt.length() <= budget) return prompt;
        }

        // 还超：再砍 description 到 200 字
        if (desc.length() > 200) {
            desc = desc.substring(0, 200);
            String[] sampled = palette.length > 24 ? sampleEvenly(palette, 24) : palette;
            prompt = assemblePrompt(stylePart, desc, base, sampled);
            if (prompt.length() <= budget) return prompt;
        }

        // 兜底：硬截。极少触发（chibi stylePart 245 + base 132 + 200 desc + 12 色 palette ≈ 750）
        return prompt.length() > budget ? prompt.substring(0, budget) : prompt;
    }

    private String assemblePrompt(String stylePart, String description, String base, String[] palette) {
        String palettePart = "Limit the output colors to a palette close to: "
                + String.join(", ", palette) + ".";
        return stylePart + " Subject: " + description + " " + base + " " + palettePart;
    }

    /** 等步采样：从 source 均匀取 k 个，保留色相分布（不是简单取前 k 个偏色） */
    private String[] sampleEvenly(String[] source, int k) {
        if (source.length <= k) return source;
        String[] out = new String[k];
        double step = (double) source.length / k;
        for (int i = 0; i < k; i++) out[i] = source[(int) (i * step)];
        return out;
    }

    /**
     * 按 target 长宽比 + 模型类型映射到合法输出尺寸。
     *   dall-e-3：支持 1024×1024 / 1024×1792 / 1792×1024（可按 target 比例选矩形）
     *   dall-e-2：只支持 256² / 512² / 1024²（**纯方形**），矩形 target 会被均匀拉伸
     *            下采样后差异会被 mode 滤波吃掉一部分，但极端比例（如 32×16 书签）会失真
     *   其它未识别模型：保守按 dall-e-2 处理（最大公约数）
     * 让输出尽量接近 target 比例，下游 mode 滤波缩到 target 时不会拉伸。
     */
    private String pickOutputSize(int cols, int rows, String model) {
        if (model == null) return "1024x1024";
        String m = model.toLowerCase();
        double ratio = (double) cols / rows;
        if (m.contains("dall-e-3")) {
            if (ratio > 1.3) return "1792x1024";
            if (ratio < 0.77) return "1024x1792";
            return "1024x1024";
        }
        if (m.contains("gpt-image")) {
            // gpt-image-1 支持的非方形档位：1024x1536（竖）/ 1536x1024（横）
            if (ratio > 1.3) return "1536x1024";
            if (ratio < 0.77) return "1024x1536";
            return "1024x1024";
        }
        // dall-e-2 / 未知：只能方形
        return "1024x1024";
    }

    /** 缩到 maxDim 内（保持比例），编码为 PNG bytes。送 AI 前的压缩 + 格式归一。 */
    private byte[] resizeToPng(BufferedImage src, int maxDim) throws java.io.IOException {
        int w = src.getWidth(), h = src.getHeight();
        BufferedImage out;
        if (w <= maxDim && h <= maxDim) {
            out = src;
        } else {
            double scale = Math.min((double) maxDim / w, (double) maxDim / h);
            int newW = Math.max(1, (int) Math.round(w * scale));
            int newH = Math.max(1, (int) Math.round(h * scale));
            out = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = out.createGraphics();
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, newW, newH);
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.drawImage(src, 0, 0, newW, newH, null);
            g.dispose();
        }
        java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
        ImageIO.write(out, "PNG", bos);
        return bos.toByteArray();
    }

    /**
     * 共享的像素化逻辑：BufferedImage → cols×rows 的拼豆 grid。
     *
     * Pipeline（v3）：
     *   1) 缩到中间分辨率（max(64, min(4×target, 128))）：给 k-means 留足样本
     *   2) (可选) k-means 量化（k=12，LAB 空间）：把渐变压成 12 个主色块
     *      AI 增强已经把图卡通化时跳过此步，避免对 AI 仔细安排的色块二次聚合
     *   3) Mode 滤波缩到 target：每个格子取源区域内的众数色
     *   4) 饱和度 ×1.6：k-means 的 centroid 偏灰，恢复鲜艳；AI 路径也兼容
     *   5) 边缘像素聚类找背景色
     *   6) transparent 标记
     *   7) Floyd-Steinberg + LAB ΔE 调色板匹配
     */
    private String[][] pixelizeToGrid(BufferedImage original, int cols, int rows, String paletteKey, boolean useKMeans, String dither, float ditherStrength) {
        // 解析 palette：拿到对应的 hex / rgb / lab 三件套
        Object[] resolved = resolvePalette(paletteKey);
        String[] palette = (String[]) resolved[0];
        int[][] paletteRgb = (int[][]) resolved[1];
        double[][] paletteLab = (double[][]) resolved[2];

        // 1) 缩到中间分辨率：保证 k-means 至少有 64×64=4096 像素可聚，封顶 128×128
        //    防止变慢；与 target 等大时退化成 1:1 不再做第二次缩放
        int interW = Math.max(64, Math.min(cols * 4, 128));
        int interH = Math.max(64, Math.min(rows * 4, 128));
        if (interW < cols) interW = cols;
        if (interH < rows) interH = rows;

        BufferedImage intermediate = new BufferedImage(interW, interH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g0 = intermediate.createGraphics();
        g0.setColor(Color.WHITE);
        g0.fillRect(0, 0, interW, interH);
        g0.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g0.drawImage(original, 0, 0, interW, interH, null);
        g0.dispose();

        // 2) K-means 量化（可跳过）：本地算法路径需要它把渐变压成色块；
        //    AI 增强路径可跳过，避免对 AI 已安排好的色块再次聚合模糊
        if (useKMeans) {
            quantizeKMeans(intermediate, 12, 8);
        }

        // 3) Mode 滤波缩到 target。intermediate 已经是 12 色色块，nearest 会随机
        //    采样导致边界抖动；bilinear 会把色块边界平均出新颜色破坏量化成果。
        //    Mode：每个目标格子在 intermediate 中对应的源区域里找众数色，稳。
        BufferedImage scaled = (interW == cols && interH == rows)
                ? intermediate
                : downsampleMode(intermediate, cols, rows);

        // 4) 饱和度增强（k-means centroid 是均值偏灰，要补色彩）
        boostSaturation(scaled, 1.6f);

        // 5) 检测背景色（边缘像素方差小才认为有背景；null 表示放弃自动透明化）
        int[] bg = detectBackground(scaled);
        // 阈值：与 bg 的 RGB 欧氏距离平方 < 35² × 3 视为同色背景
        final int BG_THRESHOLD_SQ = 35 * 35 * 3;

        // 6) 一遍扫：标记 transparent / 不 transparent。先确定再 dither，
        //    避免误差扩散把背景边界的像素拉出杂色斑块
        boolean[][] isTransparent = new boolean[rows][cols];
        for (int y = 0; y < rows; y++) {
            for (int x = 0; x < cols; x++) {
                int rgb = scaled.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF, gv = (rgb >> 8) & 0xFF, b = rgb & 0xFF;
                boolean t = false;
                if (bg != null) {
                    int dr = r - bg[0], dg = gv - bg[1], db = b - bg[2];
                    if (dr*dr + dg*dg + db*db < BG_THRESHOLD_SQ) t = true;
                }
                // bg 检测失败时仍保留传统的"近白 → transparent"兜底
                if (!t && r > 245 && gv > 245 && b > 245) t = true;
                isTransparent[y][x] = t;
            }
        }

        // 7) 装 float 缓冲做 Floyd-Steinberg。误差是浮点，逐行向后/向下扩散
        float[][] rs = new float[rows][cols];
        float[][] gs = new float[rows][cols];
        float[][] bs = new float[rows][cols];
        for (int y = 0; y < rows; y++) {
            for (int x = 0; x < cols; x++) {
                int rgb = scaled.getRGB(x, y);
                rs[y][x] = (rgb >> 16) & 0xFF;
                gs[y][x] = (rgb >> 8) & 0xFF;
                bs[y][x] = rgb & 0xFF;
            }
        }

        String[][] grid = new String[rows][cols];
        for (int y = 0; y < rows; y++) {
            for (int x = 0; x < cols; x++) {
                if (isTransparent[y][x]) {
                    grid[y][x] = "transparent";
                    continue; // 透明像素不参与误差扩散
                }
                float r = clamp(rs[y][x]);
                float gv = clamp(gs[y][x]);
                float b = clamp(bs[y][x]);
                int idx = nearestPaletteIdx(r, gv, b, paletteLab);
                grid[y][x] = palette[idx];

                // 量化误差：源像素 - 实际选中的调色板色，乘强度系数让用户调节抖动力度
                float scale = "none".equalsIgnoreCase(dither) ? 0f : Math.max(0f, Math.min(1f, ditherStrength));
                float er = (r - paletteRgb[idx][0]) * scale;
                float eg = (gv - paletteRgb[idx][1]) * scale;
                float eb = (b - paletteRgb[idx][2]) * scale;
                if (scale == 0f) continue; // none 模式：纯最近色，不扩散

                if ("atkinson".equalsIgnoreCase(dither)) {
                    // Atkinson：误差按 1/8 分散到 6 个邻居，丢失 2/8（最早出现在 Mac 早期画图程序）
                    // 比 FS 颗粒感更强、色块更干净，更像复古像素艺术
                    spreadError(rs, gs, bs, er, eg, eb, 1f / 8f, x + 1, y, cols, rows, isTransparent);
                    spreadError(rs, gs, bs, er, eg, eb, 1f / 8f, x + 2, y, cols, rows, isTransparent);
                    spreadError(rs, gs, bs, er, eg, eb, 1f / 8f, x - 1, y + 1, cols, rows, isTransparent);
                    spreadError(rs, gs, bs, er, eg, eb, 1f / 8f, x, y + 1, cols, rows, isTransparent);
                    spreadError(rs, gs, bs, er, eg, eb, 1f / 8f, x + 1, y + 1, cols, rows, isTransparent);
                    spreadError(rs, gs, bs, er, eg, eb, 1f / 8f, x, y + 2, cols, rows, isTransparent);
                } else {
                    // Floyd-Steinberg 7/16 3/16 5/16 1/16；只往非透明邻居扩散，
                    // 否则会把误差泄进背景把"被透明化的像素"染成花斑
                    spreadError(rs, gs, bs, er, eg, eb, 7f / 16f, x + 1, y, cols, rows, isTransparent);
                    spreadError(rs, gs, bs, er, eg, eb, 3f / 16f, x - 1, y + 1, cols, rows, isTransparent);
                    spreadError(rs, gs, bs, er, eg, eb, 5f / 16f, x, y + 1, cols, rows, isTransparent);
                    spreadError(rs, gs, bs, er, eg, eb, 1f / 16f, x + 1, y + 1, cols, rows, isTransparent);
                }
            }
        }
        return grid;
    }

    /** 把量化误差按权重 w 散到 (tx, ty)。越界 / 透明像素跳过（避免给背景染杂色） */
    private static void spreadError(float[][] rs, float[][] gs, float[][] bs,
                                    float er, float eg, float eb, float w,
                                    int tx, int ty, int cols, int rows,
                                    boolean[][] isTransparent) {
        if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) return;
        if (isTransparent[ty][tx]) return;
        rs[ty][tx] += er * w;
        gs[ty][tx] += eg * w;
        bs[ty][tx] += eb * w;
    }

    /**
     * K-means 颜色量化：在 LAB 空间把 image 像素聚成 k 类，每个像素重写成它所属类的均值。
     * 让原本几万种渐变颜色压成 k 个色块，照片就有了"卡通海报"的感觉，下采样后特征更鲜明。
     *
     * 参数：k = 主色数（10-16 是常见区间），maxIter = 最大迭代次数（一般 5-10 收敛）
     */
    private void quantizeKMeans(BufferedImage img, int k, int maxIter) {
        int w = img.getWidth(), h = img.getHeight();
        int n = w * h;
        if (n <= k) return; // 像素比 cluster 还少没有意义

        // 1) 把所有像素转 LAB 一次
        double[][] points = new double[n][3];
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int rgb = img.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF, g = (rgb >> 8) & 0xFF, b = rgb & 0xFF;
                points[y * w + x] = rgbToLab(r, g, b);
            }
        }

        // 2) 用确定性种子初始化 k 个 centroid（避免请求间随机抖动出不同结果）
        Random rng = new Random(42);
        double[][] centroids = new double[k][3];
        for (int i = 0; i < k; i++) {
            centroids[i] = points[rng.nextInt(n)].clone();
        }
        int[] assign = new int[n];
        Arrays.fill(assign, -1);

        // 3) 迭代：assign → update centroid，收敛即 break
        for (int iter = 0; iter < maxIter; iter++) {
            boolean changed = false;
            for (int p = 0; p < n; p++) {
                int best = 0;
                double bestD = Double.MAX_VALUE;
                for (int c = 0; c < k; c++) {
                    double dl = points[p][0] - centroids[c][0];
                    double da = points[p][1] - centroids[c][1];
                    double db = points[p][2] - centroids[c][2];
                    double d = dl * dl + da * da + db * db;
                    if (d < bestD) { bestD = d; best = c; }
                }
                if (assign[p] != best) { assign[p] = best; changed = true; }
            }
            if (!changed) break;

            double[][] newC = new double[k][3];
            int[] counts = new int[k];
            for (int p = 0; p < n; p++) {
                int c = assign[p];
                newC[c][0] += points[p][0]; newC[c][1] += points[p][1]; newC[c][2] += points[p][2];
                counts[c]++;
            }
            for (int c = 0; c < k; c++) {
                if (counts[c] > 0) {
                    newC[c][0] /= counts[c]; newC[c][1] /= counts[c]; newC[c][2] /= counts[c];
                } else {
                    // 空 cluster：随机重选一个像素当种子，避免下次还是空
                    newC[c] = points[rng.nextInt(n)].clone();
                }
            }
            centroids = newC;
        }

        // 4) 把 centroid 转回 RGB，再把每个像素覆盖成它的 centroid 颜色
        int[][] centroidRgb = new int[k][3];
        for (int c = 0; c < k; c++) {
            centroidRgb[c] = labToRgb(centroids[c][0], centroids[c][1], centroids[c][2]);
        }
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int p = y * w + x;
                int[] rgb = centroidRgb[assign[p]];
                int origAlpha = img.getRGB(x, y) & 0xFF000000;
                img.setRGB(x, y, origAlpha | (rgb[0] << 16) | (rgb[1] << 8) | rgb[2]);
            }
        }
    }

    /**
     * Mode 滤波下采样：每个目标像素取源图对应区域内的众数颜色。
     *
     * 设计 rationale：源图刚走完 k-means 后只剩 12 个独立颜色（色块清晰）。
     * 这时候用：
     *   - bilinear：会把相邻色块边界平均出第 13、14 个新颜色，破坏 k-means 成果
     *   - nearest：每格随机采样源像素，色块边界会"抖"出锯齿
     *   - mode：找区域里出现最多的色，色块边界稳定保留
     *
     * 复杂度：O(targetW × targetH × cellArea)。intermediate 128×128 → 16×16
     * 时每格 cellArea=64，总 ~16K ops，毫秒级。
     */
    private BufferedImage downsampleMode(BufferedImage src, int targetW, int targetH) {
        int srcW = src.getWidth(), srcH = src.getHeight();
        BufferedImage out = new BufferedImage(targetW, targetH, BufferedImage.TYPE_INT_RGB);
        Map<Integer, Integer> counter = new HashMap<>();
        for (int y = 0; y < targetH; y++) {
            int y0 = (int) ((long) y * srcH / targetH);
            int y1 = (int) ((long) (y + 1) * srcH / targetH);
            if (y1 == y0) y1 = y0 + 1;
            for (int x = 0; x < targetW; x++) {
                int x0 = (int) ((long) x * srcW / targetW);
                int x1 = (int) ((long) (x + 1) * srcW / targetW);
                if (x1 == x0) x1 = x0 + 1;

                counter.clear();
                int bestCount = 0;
                int bestColor = src.getRGB(x0, y0) & 0xFFFFFF;
                for (int yy = y0; yy < y1; yy++) {
                    for (int xx = x0; xx < x1; xx++) {
                        int c = src.getRGB(xx, yy) & 0xFFFFFF;
                        int cnt = counter.getOrDefault(c, 0) + 1;
                        counter.put(c, cnt);
                        if (cnt > bestCount) { bestCount = cnt; bestColor = c; }
                    }
                }
                out.setRGB(x, y, 0xFF000000 | bestColor);
            }
        }
        return out;
    }

    /** HSB 通道把 S ×factor 后回写，用来抵消下采样把饱和色稀释成灰色调的效果 */
    private void boostSaturation(BufferedImage img, float factor) {
        int w = img.getWidth(), h = img.getHeight();
        float[] hsb = new float[3];
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int rgb = img.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF, gv = (rgb >> 8) & 0xFF, b = rgb & 0xFF;
                Color.RGBtoHSB(r, gv, b, hsb);
                hsb[1] = Math.min(1f, hsb[1] * factor);
                int newRgb = Color.HSBtoRGB(hsb[0], hsb[1], hsb[2]);
                img.setRGB(x, y, (rgb & 0xFF000000) | (newRgb & 0xFFFFFF));
            }
        }
    }

    /**
     * 用边缘像素的均值估计背景色；若边缘像素颜色方差太大（avgDist > 50），认为图像
     * 没有清晰背景（铺满主体的抽象画 / 风景拼图等），返回 null 让上层放弃自动透明化。
     */
    private int[] detectBackground(BufferedImage img) {
        int w = img.getWidth(), h = img.getHeight();
        if (w < 2 || h < 2) return null;
        int n = w * 2 + (h - 2) * 2;
        int[] rs = new int[n], gs = new int[n], bs = new int[n];
        int idx = 0;
        // 顶 / 底两整行
        for (int x = 0; x < w; x++) {
            int top = img.getRGB(x, 0);
            rs[idx] = (top >> 16) & 0xFF; gs[idx] = (top >> 8) & 0xFF; bs[idx] = top & 0xFF; idx++;
            int bot = img.getRGB(x, h - 1);
            rs[idx] = (bot >> 16) & 0xFF; gs[idx] = (bot >> 8) & 0xFF; bs[idx] = bot & 0xFF; idx++;
        }
        // 左 / 右两列（去掉已统计的角点）
        for (int y = 1; y < h - 1; y++) {
            int left = img.getRGB(0, y);
            rs[idx] = (left >> 16) & 0xFF; gs[idx] = (left >> 8) & 0xFF; bs[idx] = left & 0xFF; idx++;
            int right = img.getRGB(w - 1, y);
            rs[idx] = (right >> 16) & 0xFF; gs[idx] = (right >> 8) & 0xFF; bs[idx] = right & 0xFF; idx++;
        }
        long sumR = 0, sumG = 0, sumB = 0;
        for (int i = 0; i < n; i++) { sumR += rs[i]; sumG += gs[i]; sumB += bs[i]; }
        int meanR = (int) (sumR / n), meanG = (int) (sumG / n), meanB = (int) (sumB / n);
        double varSum = 0;
        for (int i = 0; i < n; i++) {
            int dr = rs[i] - meanR, dg = gs[i] - meanG, db = bs[i] - meanB;
            varSum += dr * dr + dg * dg + db * db;
        }
        double avgDist = Math.sqrt(varSum / n);
        if (avgDist > 50) return null;
        return new int[]{meanR, meanG, meanB};
    }

    /** RGB → 调色板索引（LAB ΔE 最近邻）。比直接 RGB 欧氏更接近人眼判断。 */
    private int nearestPaletteIdx(float r, float g, float b, double[][] paletteLab) {
        double[] lab = rgbToLab(Math.round(r), Math.round(g), Math.round(b));
        int bestIdx = 0;
        double bestDist = Double.MAX_VALUE;
        for (int i = 0; i < paletteLab.length; i++) {
            double dl = lab[0] - paletteLab[i][0];
            double da = lab[1] - paletteLab[i][1];
            double db = lab[2] - paletteLab[i][2];
            double dist = dl * dl + da * da + db * db;
            if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        }
        return bestIdx;
    }

    /** sRGB → CIE L*a*b*，D65 标准光源 */
    private static double[] rgbToLab(int r, int g, int b) {
        double rl = srgbToLinear(r / 255.0);
        double gl = srgbToLinear(g / 255.0);
        double bl = srgbToLinear(b / 255.0);
        // sRGB → XYZ (D65)
        double x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
        double y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750;
        double z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041;
        // 归一化到 D65 参考白
        x /= 0.95047; y /= 1.00000; z /= 1.08883;
        x = labF(x); y = labF(y); z = labF(z);
        return new double[]{116 * y - 16, 500 * (x - y), 200 * (y - z)};
    }

    /** CIE L*a*b* → sRGB，反向变换。给 k-means 把 centroid 转回像素颜色用。 */
    private static int[] labToRgb(double L, double a, double b) {
        double y = (L + 16) / 116;
        double x = a / 500 + y;
        double z = y - b / 200;
        x = labFInv(x) * 0.95047;
        y = labFInv(y) * 1.00000;
        z = labFInv(z) * 1.08883;
        // XYZ → linear RGB
        double rl =  3.2404542 * x + -1.5371385 * y + -0.4985314 * z;
        double gl = -0.9692660 * x +  1.8760108 * y +  0.0415560 * z;
        double bl =  0.0556434 * x + -0.2040259 * y +  1.0572252 * z;
        return new int[]{
            clamp255(linearToSrgb(rl) * 255),
            clamp255(linearToSrgb(gl) * 255),
            clamp255(linearToSrgb(bl) * 255)
        };
    }

    private static double srgbToLinear(double c) {
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }

    private static double linearToSrgb(double c) {
        if (c <= 0) return 0;
        if (c >= 1) return 1;
        return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1.0 / 2.4) - 0.055;
    }

    private static double labF(double t) {
        return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16.0 / 116;
    }

    private static double labFInv(double t) {
        double t3 = t * t * t;
        return t3 > 0.008856 ? t3 : (t - 16.0 / 116) / 7.787;
    }

    private static float clamp(float v) {
        return v < 0 ? 0 : (v > 255 ? 255 : v);
    }

    private static int clamp255(double v) {
        if (v < 0) return 0;
        if (v > 255) return 255;
        return (int) Math.round(v);
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

    @Data
    static class GenerateRequest {
        private String prompt;
        private int cols;
        private int rows;
        // 可选：拼豆调色板预设 key（"default" / "classic"），不传走 default
        private String palette;
    }
}
