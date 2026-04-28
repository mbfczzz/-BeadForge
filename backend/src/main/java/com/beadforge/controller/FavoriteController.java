package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.Design;
import com.beadforge.model.entity.Favorite;
import com.beadforge.model.entity.User;
import com.beadforge.repository.DesignRepository;
import com.beadforge.repository.FavoriteRepository;
import com.beadforge.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

@Tag(name = "收藏", description = "对作品 / 图纸的收藏")
@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteRepository favRepo;
    private final DesignRepository designRepo;
    private final UserRepository userRepo;

    @Operation(summary = "添加收藏", description = "type: design / pattern；幂等")
    @PostMapping("/{type}/{id}")
    public ApiResponse<Void> add(@PathVariable String type, @PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        String t = normalize(type);
        long exists = favRepo.selectCount(new QueryWrapper<Favorite>()
            .eq("user_id", userId).eq("target_type", t).eq("target_id", id));
        if (exists > 0) return ApiResponse.success("已收藏", null);
        Favorite f = new Favorite();
        f.setUserId(userId);
        f.setTargetType(t);
        f.setTargetId(id);
        favRepo.insert(f);
        return ApiResponse.success("收藏成功", null);
    }

    @Operation(summary = "取消收藏")
    @DeleteMapping("/{type}/{id}")
    public ApiResponse<Void> remove(@PathVariable String type, @PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        favRepo.delete(new QueryWrapper<Favorite>()
            .eq("user_id", userId).eq("target_type", normalize(type)).eq("target_id", id));
        return ApiResponse.success("已取消收藏", null);
    }

    @Operation(summary = "查询是否已收藏")
    @GetMapping("/check/{type}/{id}")
    public ApiResponse<Map<String, Boolean>> check(@PathVariable String type, @PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        long exists = favRepo.selectCount(new QueryWrapper<Favorite>()
            .eq("user_id", userId).eq("target_type", normalize(type)).eq("target_id", id));
        Map<String, Boolean> m = new HashMap<>();
        m.put("favorited", exists > 0);
        return ApiResponse.success(m);
    }

    @Operation(summary = "我的收藏列表",
            description = "默认 type=design；返回字段对齐前端 ProfileFavoriteItem")
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(
            @RequestParam(defaultValue = "design") String type,
            HttpServletRequest request) {
        Long userId = requireUser(request);
        String t = normalize(type);

        List<Favorite> favs = favRepo.selectList(new QueryWrapper<Favorite>()
            .eq("user_id", userId).eq("target_type", t).orderByDesc("created_at"));
        if (favs.isEmpty()) return ApiResponse.success(Collections.emptyList());

        Set<Long> designIds = favs.stream().map(Favorite::getTargetId).collect(Collectors.toSet());
        Map<Long, Design> dmap = "DESIGN".equals(t)
            ? designRepo.selectBatchIds(designIds).stream().collect(Collectors.toMap(Design::getId, d -> d))
            : new HashMap<>();
        Set<Long> userIds = dmap.values().stream().map(Design::getUserId).collect(Collectors.toSet());
        Map<Long, String> authorMap = userIds.isEmpty()
            ? new HashMap<>()
            : userRepo.selectBatchIds(userIds).stream().collect(Collectors.toMap(
                User::getId,
                u -> u.getNickname() != null ? u.getNickname() : u.getUsername()));

        List<Map<String, Object>> result = favs.stream().map(f -> {
            Design d = dmap.get(f.getTargetId());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", f.getTargetId());
            m.put("title", d != null ? d.getTitle() : "(已删除)");
            m.put("author", d != null ? authorMap.getOrDefault(d.getUserId(), "未知") : "");
            // patternIndex 稳定映射（前端显示用，取 id 的模）
            m.put("patternIndex", (int) (f.getTargetId() % 8));
            m.put("likeCount", d != null && d.getLikeCount() != null ? d.getLikeCount() : 0);
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.success(result);
    }

    private String normalize(String type) {
        if (type == null) return "DESIGN";
        switch (type.toLowerCase()) {
            case "design":  return "DESIGN";
            case "pattern": return "PATTERN";
            default: return type.toUpperCase();
        }
    }

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new BusinessException(401, "需要登录");
        return uid;
    }
}
