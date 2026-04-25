package com.beadforge.controller;

import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 文件上传：保存到本地 ./uploads/<yyyy-MM>/<uuid>.<ext>
 *   POST /upload/image    — 单文件，限制图片/视频
 *   返回 { url: "/uploads/2026-04/xxx.jpg" }（前端拼 baseURL 的 origin）
 */
@Slf4j
@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class UploadController {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_EXT = new HashSet<>(Arrays.asList(
        "jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "webm"
    ));
    private static final long MAX_SIZE = 20L * 1024 * 1024; // 20MB

    @PostMapping("/image")
    public ApiResponse<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) throws IOException {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) throw new BusinessException(401, "需要登录");

        if (file == null || file.isEmpty()) throw new BusinessException(400, "文件为空");
        if (file.getSize() > MAX_SIZE) throw new BusinessException(400, "文件超过 20MB 限制");

        String original = file.getOriginalFilename();
        String ext = getExt(original);
        if (!ALLOWED_EXT.contains(ext)) {
            throw new BusinessException(400, "不支持的文件类型：" + ext);
        }

        String monthDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        Path dir = Paths.get(uploadDir, monthDir);
        Files.createDirectories(dir);

        String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        Path dest = dir.resolve(filename);
        file.transferTo(dest.toFile());

        String url = "/uploads/" + monthDir + "/" + filename;
        log.info("upload by user={}, file={}, size={}, url={}", userId, original, file.getSize(), url);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("url", url);
        m.put("size", file.getSize());
        m.put("type", isVideoExt(ext) ? "video" : ("gif".equals(ext) ? "gif" : "image"));
        return ApiResponse.success("上传成功", m);
    }

    private String getExt(String name) {
        if (name == null) return "";
        int idx = name.lastIndexOf('.');
        return idx >= 0 ? name.substring(idx + 1).toLowerCase() : "";
    }

    private boolean isVideoExt(String ext) {
        return "mp4".equals(ext) || "mov".equals(ext) || "webm".equals(ext);
    }
}
