package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.Dict;
import com.beadforge.repository.DictRepository;
import com.beadforge.service.DictService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 字典管理（订单状态文案 / 工单类型 / 工单状态 / 钱包流水类型 等）。
 *
 * 公开：无（字典通过其他业务接口间接对外暴露）
 * 管理（建议加 ADMIN 校验）：
 *   GET    /dict?type=ORDER_STATUS_NOTE   — 列表（按 sort_order）
 *   POST   /dict                          — 新建
 *   PUT    /dict/{id}                     — 更新
 *   DELETE /dict/{id}                     — 删除
 *   POST   /dict/reload                   — 手动刷新内存缓存
 *
 * 任何写操作后会自动 reload。
 */
@Tag(name = "字典",
        description = "全局字典（订单状态文案 / 工单类型 / 钱包流水类型 等）；写操作后自动 reload 内存缓存")
@RestController
@RequestMapping("/dict")
@RequiredArgsConstructor
public class DictController {

    private final DictRepository dictRepo;
    private final DictService dictService;

    @Operation(summary = "字典列表", description = "可按 type 过滤，例：ORDER_STATUS_NOTE / WALLET_LOG_TYPE")
    @GetMapping
    public ApiResponse<List<Dict>> list(@RequestParam(required = false) String type) {
        QueryWrapper<Dict> qw = new QueryWrapper<>();
        if (type != null && !type.isEmpty()) qw.eq("dict_type", type);
        qw.orderByAsc("dict_type").orderByAsc("sort_order").orderByDesc("id");
        return ApiResponse.success(dictRepo.selectList(qw));
    }

    @Operation(summary = "新建字典项")
    @PostMapping
    public ApiResponse<Dict> create(@RequestBody Dict d) {
        if (d.getDictType() == null || d.getDictKey() == null) {
            return ApiResponse.error(400, "dictType / dictKey 不能为空");
        }
        if (d.getEnabled() == null) d.setEnabled(1);
        if (d.getSortOrder() == null) d.setSortOrder(99);
        dictRepo.insert(d);
        dictService.reload();
        return ApiResponse.success("新建成功", d);
    }

    @Operation(summary = "更新字典项")
    @PutMapping("/{id}")
    public ApiResponse<Dict> update(@PathVariable Long id, @RequestBody Dict d) {
        Dict exist = dictRepo.selectById(id);
        if (exist == null) return ApiResponse.error(404, "字典项不存在");
        d.setId(id);
        dictRepo.updateById(d);
        dictService.reload();
        return ApiResponse.success("更新成功", dictRepo.selectById(id));
    }

    @Operation(summary = "删除字典项")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        dictRepo.deleteById(id);
        dictService.reload();
        return ApiResponse.success("已删除", null);
    }

    @Operation(summary = "手动 reload 字典缓存")
    @PostMapping("/reload")
    public ApiResponse<Void> reload() {
        dictService.reload();
        return ApiResponse.success("已刷新", null);
    }
}
