package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.DiscoverBanner;
import com.beadforge.model.entity.DiscoverSetting;
import com.beadforge.model.entity.DiscoverTab;
import com.beadforge.repository.DiscoverBannerRepository;
import com.beadforge.repository.DiscoverSettingRepository;
import com.beadforge.repository.DiscoverTabRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 发现页配置：banner / tab / 全局文案。全部从数据库查询，admin 后台可维护。
 *
 * 公开接口：
 *   GET    /discovery/home                  — 前端展示用 payload（合并 setting + banners + tabs）
 *
 * 管理接口（建议加 ADMIN 角色校验）：
 *   GET    /discovery/banners               — 全量 banner
 *   POST   /discovery/banners               — 新建
 *   PUT    /discovery/banners/{id}          — 更新
 *   DELETE /discovery/banners/{id}          — 软删
 *   GET    /discovery/tabs
 *   POST   /discovery/tabs
 *   PUT    /discovery/tabs/{id}
 *   DELETE /discovery/tabs/{id}
 *   GET    /discovery/settings
 *   PUT    /discovery/settings/{key}        — 更新全局文案
 */
@RestController
@RequestMapping("/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoverBannerRepository bannerRepo;
    private final DiscoverTabRepository tabRepo;
    private final DiscoverSettingRepository settingRepo;

    /** ────────── 公开 ────────── */

    @GetMapping("/home")
    public ApiResponse<Map<String, Object>> home() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("config", buildConfig());
        payload.put("banners", listEnabledBanners());
        return ApiResponse.success(payload);
    }

    /** ────────── 管理 — Banner ────────── */

    @GetMapping("/banners")
    public ApiResponse<List<DiscoverBanner>> listBanners() {
        return ApiResponse.success(bannerRepo.selectList(new QueryWrapper<DiscoverBanner>()
            .orderByAsc("sort_order").orderByDesc("id")));
    }

    @PostMapping("/banners")
    public ApiResponse<DiscoverBanner> createBanner(@RequestBody DiscoverBanner b) {
        if (b.getEnabled() == null) b.setEnabled(1);
        if (b.getSortOrder() == null) b.setSortOrder(99);
        if (b.getSortMode() == null || b.getSortMode().isEmpty()) b.setSortMode("hot");
        bannerRepo.insert(b);
        return ApiResponse.success("新建成功", b);
    }

    @PutMapping("/banners/{id}")
    public ApiResponse<DiscoverBanner> updateBanner(@PathVariable Long id, @RequestBody DiscoverBanner b) {
        DiscoverBanner exist = bannerRepo.selectById(id);
        if (exist == null) return ApiResponse.error(404, "Banner 不存在");
        b.setId(id);
        bannerRepo.updateById(b);
        return ApiResponse.success("更新成功", bannerRepo.selectById(id));
    }

    @DeleteMapping("/banners/{id}")
    public ApiResponse<Void> deleteBanner(@PathVariable Long id) {
        bannerRepo.deleteById(id);
        return ApiResponse.success("已删除", null);
    }

    /** ────────── 管理 — Tab ────────── */

    @GetMapping("/tabs")
    public ApiResponse<List<DiscoverTab>> listTabs() {
        return ApiResponse.success(tabRepo.selectList(new QueryWrapper<DiscoverTab>()
            .orderByAsc("sort_order").orderByDesc("id")));
    }

    @PostMapping("/tabs")
    public ApiResponse<DiscoverTab> createTab(@RequestBody DiscoverTab t) {
        if (t.getEnabled() == null) t.setEnabled(1);
        if (t.getIsDefault() == null) t.setIsDefault(0);
        if (t.getSortOrder() == null) t.setSortOrder(99);
        if (t.getSortMode() == null || t.getSortMode().isEmpty()) t.setSortMode("hot");
        if (Integer.valueOf(1).equals(t.getIsDefault())) clearDefaultExcept(null);
        tabRepo.insert(t);
        return ApiResponse.success("新建成功", t);
    }

    @PutMapping("/tabs/{id}")
    public ApiResponse<DiscoverTab> updateTab(@PathVariable Long id, @RequestBody DiscoverTab t) {
        DiscoverTab exist = tabRepo.selectById(id);
        if (exist == null) return ApiResponse.error(404, "Tab 不存在");
        if (Integer.valueOf(1).equals(t.getIsDefault())) clearDefaultExcept(id);
        t.setId(id);
        tabRepo.updateById(t);
        return ApiResponse.success("更新成功", tabRepo.selectById(id));
    }

    @DeleteMapping("/tabs/{id}")
    public ApiResponse<Void> deleteTab(@PathVariable Long id) {
        tabRepo.deleteById(id);
        return ApiResponse.success("已删除", null);
    }

    /** ────────── 管理 — Setting (K-V 全局文案) ────────── */

    @GetMapping("/settings")
    public ApiResponse<List<DiscoverSetting>> listSettings() {
        return ApiResponse.success(settingRepo.selectList(null));
    }

    @PutMapping("/settings/{key}")
    public ApiResponse<DiscoverSetting> upsertSetting(@PathVariable String key, @RequestBody Map<String, String> body) {
        String value = body.get("value");
        DiscoverSetting exist = settingRepo.selectOne(new QueryWrapper<DiscoverSetting>().eq("config_key", key));
        if (exist == null) {
            exist = new DiscoverSetting();
            exist.setConfigKey(key);
            exist.setConfigValue(value);
            settingRepo.insert(exist);
        } else {
            exist.setConfigValue(value);
            settingRepo.updateById(exist);
        }
        return ApiResponse.success("已保存", exist);
    }

    /** ────────── helpers ────────── */

    private Map<String, Object> buildConfig() {
        Map<String, String> kv = settingRepo.selectList(null).stream()
            .collect(Collectors.toMap(DiscoverSetting::getConfigKey, s -> s.getConfigValue() == null ? "" : s.getConfigValue(), (a, b) -> a));

        List<DiscoverTab> tabs = tabRepo.selectList(new QueryWrapper<DiscoverTab>()
            .eq("enabled", 1).orderByAsc("sort_order"));
        DiscoverTab def = tabs.stream().filter(t -> Integer.valueOf(1).equals(t.getIsDefault())).findFirst()
            .orElse(tabs.isEmpty() ? null : tabs.get(0));

        Map<String, Object> cfg = new LinkedHashMap<>();
        cfg.put("defaultTabKey", def == null ? "all" : def.getTabKey());
        cfg.put("searchPlaceholder", kv.getOrDefault("searchPlaceholder", "搜索"));
        cfg.put("resultTitle", kv.getOrDefault("resultTitle", "为你推荐"));
        cfg.put("emptyText", kv.getOrDefault("emptyText", "暂无内容"));
        cfg.put("tabs", tabs.stream().map(this::tabToMap).collect(Collectors.toList()));
        return cfg;
    }

    private List<Map<String, Object>> listEnabledBanners() {
        return bannerRepo.selectList(new QueryWrapper<DiscoverBanner>()
                .eq("enabled", 1).orderByAsc("sort_order"))
            .stream().map(this::bannerToMap).collect(Collectors.toList());
    }

    private Map<String, Object> tabToMap(DiscoverTab t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("key", t.getTabKey());
        m.put("label", t.getLabel());
        m.put("bannerIds", csvToIntList(t.getBannerIds()));
        m.put("categories", csvToStrList(t.getCategories()));
        m.put("accessModes", csvToStrList(t.getAccessModes()));
        m.put("sort", t.getSortMode() == null ? "hot" : t.getSortMode());
        m.put("enabled", Integer.valueOf(1).equals(t.getEnabled()));
        m.put("order", t.getSortOrder() == null ? 0 : t.getSortOrder());
        m.put("resultTitle", t.getResultTitle());
        m.put("emptyText", t.getEmptyText());
        if (t.getSearchPlaceholder() != null) m.put("searchPlaceholder", t.getSearchPlaceholder());
        return m;
    }

    private Map<String, Object> bannerToMap(DiscoverBanner b) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", b.getId());
        m.put("title", b.getTitle());
        m.put("sub", b.getSub());
        m.put("pi", b.getPi() == null ? 0 : b.getPi());
        m.put("bg", b.getBg());
        m.put("cat", b.getCat());
        m.put("sort", b.getSortMode() == null ? "hot" : b.getSortMode());
        m.put("enabled", Integer.valueOf(1).equals(b.getEnabled()));
        m.put("order", b.getSortOrder() == null ? 0 : b.getSortOrder());
        m.put("eyebrow", b.getEyebrow());
        m.put("buttonText", b.getButtonText());
        if (b.getTextColor() != null) m.put("textColor", b.getTextColor());
        return m;
    }

    private List<Integer> csvToIntList(String csv) {
        if (csv == null || csv.isEmpty()) return Collections.emptyList();
        List<Integer> out = new ArrayList<>();
        for (String s : csv.split(",")) {
            s = s.trim();
            if (!s.isEmpty()) try { out.add(Integer.parseInt(s)); } catch (NumberFormatException ignored) {}
        }
        return out;
    }

    private List<String> csvToStrList(String csv) {
        if (csv == null || csv.isEmpty()) return Collections.emptyList();
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
    }

    private void clearDefaultExcept(Long keepId) {
        UpdateWrapper<DiscoverTab> uw = new UpdateWrapper<>();
        uw.eq("is_default", 1).set("is_default", 0);
        if (keepId != null) uw.ne("id", keepId);
        tabRepo.update(null, uw);
    }
}
