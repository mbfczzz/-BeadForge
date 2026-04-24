package com.beadforge.controller;

import com.beadforge.model.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 发现页首页配置：banner 列表 + 分类 tab 配置。
 *
 * 当前实现：硬编码默认配置，返回结构完全对齐前端 DiscoverHomePayload。
 * 将来可扩展：
 *   - 新增 t_discover_banner / t_discover_tab 表，允许管理后台动态增删
 *   - 按时段切换节日 banner（如春节用朱砂、端午用青绿等）
 *
 * 接口为公开（匿名可访问），需要在 SecurityConfig 白名单里放行。
 */
@RestController
@RequestMapping("/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    @GetMapping("/home")
    public ApiResponse<Map<String, Object>> home() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("config", buildConfig());
        payload.put("banners", buildBanners());
        return ApiResponse.success(payload);
    }

    private Map<String, Object> buildConfig() {
        Map<String, Object> cfg = new LinkedHashMap<>();
        cfg.put("defaultTabKey", "all");
        cfg.put("searchPlaceholder", "搜索图纸、作者或分类");
        cfg.put("resultTitle", "为你推荐");
        cfg.put("emptyText", "暂无匹配的图纸资源");
        cfg.put("tabs", Arrays.asList(
            tab("all",    "全部", Arrays.asList(1, 2, 3, 4), null,                          "hot",    1, "为你推荐",   "暂无推荐图纸"),
            tab("animal", "动物", Collections.singletonList(2), Collections.singletonList("动物"), "hot",    2, "动物推荐",   "暂无动物主题图纸"),
            tab("flower", "花草", Collections.singletonList(3), Collections.singletonList("花草"), "latest", 3, "花草推荐",   "暂无花草主题图纸"),
            tab("food",   "美食", Collections.singletonList(4), Collections.singletonList("美食"), "hot",    4, "美食推荐",   "暂无美食主题图纸")
        ));
        return cfg;
    }

    private Map<String, Object> tab(String key, String label, List<Integer> bannerIds,
                                    List<String> categories, String sort, int order,
                                    String resultTitle, String emptyText) {
        Map<String, Object> t = new LinkedHashMap<>();
        t.put("key", key);
        t.put("label", label);
        if (bannerIds != null) t.put("bannerIds", bannerIds);
        if (categories != null) t.put("categories", categories);
        t.put("sort", sort);
        t.put("enabled", true);
        t.put("order", order);
        t.put("resultTitle", resultTitle);
        t.put("emptyText", emptyText);
        return t;
    }

    private List<Map<String, Object>> buildBanners() {
        return Arrays.asList(
            banner(1, "热门精选", "近期收藏和浏览都很高的图案", 0, "#4B78FF", "",    "hot",    1, "发现图纸", "立即查看"),
            banner(2, "动物主题", "适合挂件和卡片的小尺寸作品", 1, "#D6B161", "动物", "hot",    2, "发现图纸", "热门动物"),
            banner(3, "花草系列", "贺卡和礼物封面常用花卉主题", 3, "#E986B5", "花草", "latest", 3, "春季灵感", "最新上架"),
            banner(4, "美食图纸", "杯垫、冰箱贴和摆台都很适合", 5, "#63A88B", "美食", "hot",    4, "厨房灵感", "看看新品")
        );
    }

    private Map<String, Object> banner(int id, String title, String sub, int pi, String bg,
                                       String cat, String sort, int order, String eyebrow, String buttonText) {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("id", id);
        b.put("title", title);
        b.put("sub", sub);
        b.put("pi", pi);
        b.put("bg", bg);
        b.put("cat", cat);
        b.put("sort", sort);
        b.put("enabled", true);
        b.put("order", order);
        b.put("eyebrow", eyebrow);
        b.put("buttonText", buttonText);
        return b;
    }
}
