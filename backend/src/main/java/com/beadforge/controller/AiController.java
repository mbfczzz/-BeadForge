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
            String[][] grid = pixelizeToGrid(original, cols, rows, req.getPalette());

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
            description = "上传 jpg/png/webp/gif 图片 → k-means 量化 → 拼豆调色板匹配，返回 cols×rows 的 hex 颜色 grid")
    @PostMapping("/image-to-grid")
    public ApiResponse<Map<String, Object>> imageToGrid(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cols", defaultValue = "16") int cols,
            @RequestParam(value = "rows", defaultValue = "16") int rows,
            @RequestParam(value = "palette", defaultValue = "default") String palette,
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

            log.info("图片转拼豆: filename={}, size={}, sourcePx={}x{}, target={}x{}, palette={}, userId={}",
                    file.getOriginalFilename(), file.getSize(),
                    original.getWidth(), original.getHeight(), c, r, palette, userId);

            String[][] grid = pixelizeToGrid(original, c, r, palette);
            Map<String, Object> result = new HashMap<>();
            result.put("grid", grid);
            result.put("cols", c);
            result.put("rows", r);
            result.put("palette", palette);
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
     *
     * Pipeline：
     *   1) 双线性缩放到 cols×rows（白底预填，处理源图含透明通道的情形）
     *   2) k-means 颜色量化（k=12，LAB 空间）：把渐变像素压成 k 个主色块，
     *      让真人照片"卡通海报化"——这是单次最关键的视觉提升。
     *   3) 饱和度 ×1.5：抵消缩放 + 量化对色彩的稀释
     *   4) 边缘像素聚类找背景色，差异大于阈值视为无清晰背景
     *   5) 一遍扫：标记每个像素是 transparent 还是要参与调色板匹配
     *   6) 二遍扫：Floyd-Steinberg 误差扩散 + LAB ΔE 最近色匹配
     */
    private String[][] pixelizeToGrid(BufferedImage original, int cols, int rows, String paletteKey) {
        // 解析 palette：拿到对应的 hex / rgb / lab 三件套
        Object[] resolved = resolvePalette(paletteKey);
        String[] palette = (String[]) resolved[0];
        int[][] paletteRgb = (int[][]) resolved[1];
        double[][] paletteLab = (double[][]) resolved[2];

        // 1) 双线性缩放，先白底再画（避开 TYPE_INT_RGB 把透明像素留成黑色）
        BufferedImage scaled = new BufferedImage(cols, rows, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = scaled.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, cols, rows);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(original, 0, 0, cols, rows, null);
        g.dispose();

        // 2) k-means 量化：自适应找 k 个主色，把每个像素重写成最近主色。
        //    k=12 是肖像 / 一般物体的经验值，足以保留主体特征又不显杂乱
        quantizeKMeans(scaled, 12, 8);

        // 3) 饱和度增强（抵消平均化 + 量化的稀释）
        boostSaturation(scaled, 1.5f);

        // 4) 检测背景色（边缘像素方差小才认为有背景；null 表示放弃自动透明化）
        int[] bg = detectBackground(scaled);
        // 阈值：与 bg 的 RGB 欧氏距离平方 < 35² × 3 视为同色背景
        final int BG_THRESHOLD_SQ = 35 * 35 * 3;

        // 5) 一遍扫：标记 transparent / 不 transparent。先确定再 dither，
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

        // 6) 装 float 缓冲做 Floyd-Steinberg。误差是浮点，逐行向后/向下扩散
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

                // 量化误差：源像素 - 实际选中的调色板色
                float er = r - paletteRgb[idx][0];
                float eg = gv - paletteRgb[idx][1];
                float eb = b - paletteRgb[idx][2];

                // Floyd-Steinberg 7/16 3/16 5/16 1/16；只往非透明邻居扩散，
                // 否则会把误差泄进背景把"被透明化的像素"染成花斑
                if (x + 1 < cols && !isTransparent[y][x + 1]) {
                    rs[y][x + 1] += er * 7f / 16; gs[y][x + 1] += eg * 7f / 16; bs[y][x + 1] += eb * 7f / 16;
                }
                if (y + 1 < rows) {
                    if (x - 1 >= 0 && !isTransparent[y + 1][x - 1]) {
                        rs[y + 1][x - 1] += er * 3f / 16; gs[y + 1][x - 1] += eg * 3f / 16; bs[y + 1][x - 1] += eb * 3f / 16;
                    }
                    if (!isTransparent[y + 1][x]) {
                        rs[y + 1][x] += er * 5f / 16; gs[y + 1][x] += eg * 5f / 16; bs[y + 1][x] += eb * 5f / 16;
                    }
                    if (x + 1 < cols && !isTransparent[y + 1][x + 1]) {
                        rs[y + 1][x + 1] += er * 1f / 16; gs[y + 1][x + 1] += eg * 1f / 16; bs[y + 1][x + 1] += eb * 1f / 16;
                    }
                }
            }
        }
        return grid;
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
