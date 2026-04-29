package com.beadforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 把 Design.designData（hex 颜色二维数组 JSON 字符串）渲染成 PNG，
 * 用于动态时间线、图纸卡片缩略图等场景。
 */
@Slf4j
@Service
public class GridImageService {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final int CELL_SIZE = 18;   // 单格直径，px
    private static final int GAP = 1;          // 格子间隙

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * 把 designData JSON（二维 hex 数组）渲染为 PNG 文件，返回相对 URL（"/uploads/..."）。
     * designData 不合法或为空时返回 null（调用方决定降级策略）。
     */
    public String renderToPng(String designDataJson, String filenameSeed) {
        String[][] grid = parseGrid(designDataJson);
        if (grid == null) return null;

        int rows = grid.length;
        int cols = grid[0].length;
        int width = cols * CELL_SIZE + (cols - 1) * GAP;
        int height = rows * CELL_SIZE + (rows - 1) * GAP;

        BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            // 透明底
            g.setComposite(AlphaComposite.Clear);
            g.fillRect(0, 0, width, height);
            g.setComposite(AlphaComposite.SrcOver);

            for (int r = 0; r < rows; r++) {
                for (int c = 0; c < cols; c++) {
                    String hex = grid[r][c];
                    if (hex == null || "transparent".equalsIgnoreCase(hex)) continue;
                    Color color = parseHex(hex);
                    if (color == null) continue;
                    int x = c * (CELL_SIZE + GAP);
                    int y = r * (CELL_SIZE + GAP);
                    // 圆形格子，带豆子的"釉光"暗示
                    g.setColor(color);
                    g.fillOval(x, y, CELL_SIZE, CELL_SIZE);
                }
            }
        } finally {
            g.dispose();
        }

        try {
            String monthDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            Path dir = Paths.get(uploadDir, monthDir);
            Files.createDirectories(dir);
            String filename = (filenameSeed == null ? "grid" : filenameSeed) + "-"
                    + UUID.randomUUID().toString().replace("-", "").substring(0, 8) + ".png";
            Path dest = dir.resolve(filename);
            ImageIO.write(img, "PNG", dest.toFile());
            return "/uploads/" + monthDir + "/" + filename;
        } catch (IOException e) {
            log.warn("renderToPng 写入失败: {}", e.getMessage());
            return null;
        }
    }

    private String[][] parseGrid(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            JsonNode root = MAPPER.readTree(json);
            // 兼容两种存储约定：① 直接是二维数组 ② 含 grid 字段的对象
            JsonNode gridNode = root.isArray() ? root : root.path("grid");
            if (!gridNode.isArray() || gridNode.size() == 0) return null;
            int rows = gridNode.size();
            int cols = gridNode.get(0).size();
            if (cols == 0) return null;
            String[][] grid = new String[rows][cols];
            for (int r = 0; r < rows; r++) {
                JsonNode row = gridNode.get(r);
                if (!row.isArray() || row.size() != cols) return null;
                for (int c = 0; c < cols; c++) {
                    grid[r][c] = row.get(c).asText(null);
                }
            }
            return grid;
        } catch (Exception e) {
            log.debug("parseGrid 解析失败: {}", e.getMessage());
            return null;
        }
    }

    private Color parseHex(String hex) {
        try {
            String s = hex.startsWith("#") ? hex.substring(1) : hex;
            if (s.length() == 6) {
                int rgb = Integer.parseInt(s, 16);
                return new Color((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF);
            }
        } catch (NumberFormatException ignored) {
        }
        return null;
    }
}
