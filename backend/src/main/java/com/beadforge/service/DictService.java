package com.beadforge.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.entity.Dict;
import com.beadforge.repository.DictRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 字典服务 — 启动加载到内存 Map，运行期 O(1) 查询。
 *
 * 使用：
 *   dictService.label("ORDER_STATUS_NOTE", "PENDING")        → "待支付"
 *   dictService.description("ORDER_STATUS_NOTE", "PENDING")  → "订单已创建，请尽快完成支付。"
 *   dictService.keyByLabel("FEEDBACK_TYPE", "功能问题")       → "FEATURE"
 *
 * 修改后调用 reload() 刷缓存（admin 接口在更新数据后会触发）。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DictService {

    private final DictRepository dictRepo;

    /** type → key → Dict */
    private final Map<String, Map<String, Dict>> byKey = new ConcurrentHashMap<>();
    /** type → label → key（反查） */
    private final Map<String, Map<String, String>> byLabel = new ConcurrentHashMap<>();

    /** 静态入口供 DTO 等静态上下文调用 */
    private static volatile DictService INSTANCE;
    public static DictService instance() { return INSTANCE; }

    @PostConstruct
    void register() { INSTANCE = this; }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        reload();
    }

    /* ────────── 静态便捷方法（DTO 转换用） ────────── */

    public static String labelOf(String type, String key) {
        return INSTANCE == null ? key : INSTANCE.label(type, key);
    }

    public static String descriptionOf(String type, String key) {
        return INSTANCE == null ? "" : INSTANCE.description(type, key);
    }

    public static String keyOf(String type, String label) {
        return INSTANCE == null ? label : INSTANCE.keyByLabel(type, label);
    }

    public synchronized void reload() {
        byKey.clear();
        byLabel.clear();
        List<Dict> all = dictRepo.selectList(new QueryWrapper<Dict>().eq("enabled", 1));
        for (Dict d : all) {
            byKey.computeIfAbsent(d.getDictType(), k -> new HashMap<>()).put(d.getDictKey(), d);
            if (d.getLabel() != null) {
                byLabel.computeIfAbsent(d.getDictType(), k -> new HashMap<>()).put(d.getLabel(), d.getDictKey());
            }
        }
        log.info("DictService reloaded, types={}, total={}", byKey.size(), all.size());
    }

    /** 取中文显示名 */
    public String label(String type, String key) {
        if (key == null) return "";
        Map<String, Dict> m = byKey.get(type);
        if (m == null) return key;
        Dict d = m.get(key);
        return d == null || d.getLabel() == null ? key : d.getLabel();
    }

    /** 取长文案 */
    public String description(String type, String key) {
        if (key == null) return "";
        Map<String, Dict> m = byKey.get(type);
        if (m == null) return "";
        Dict d = m.get(key);
        return d == null || d.getDescription() == null ? "" : d.getDescription();
    }

    /** 反查：中文 → 英文 key */
    public String keyByLabel(String type, String label) {
        if (label == null) return null;
        Map<String, String> m = byLabel.get(type);
        if (m == null) return null;
        String k = m.get(label);
        return k == null ? label : k;
    }

    /** 取该类型下所有项（按 sort_order 排序），用于前端选项列表 */
    public List<Dict> listByType(String type) {
        Map<String, Dict> m = byKey.get(type);
        if (m == null) return Collections.emptyList();
        List<Dict> list = new ArrayList<>(m.values());
        list.sort(Comparator.comparing(d -> d.getSortOrder() == null ? Integer.MAX_VALUE : d.getSortOrder()));
        return list;
    }
}
