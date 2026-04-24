package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.AddressDTO;
import com.beadforge.model.dto.AddressRequest;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.Address;
import com.beadforge.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户收货地址。所有接口需登录。
 * 默认地址逻辑：同一 userId 下至多一个 is_default=1；切换默认时原默认会被置 0。
 */
@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressRepository addressRepo;

    /** GET /addresses — 当前用户所有地址，默认地址置顶 */
    @GetMapping
    public ApiResponse<List<AddressDTO>> list(HttpServletRequest request) {
        Long userId = requireUser(request);
        QueryWrapper<Address> qw = new QueryWrapper<>();
        qw.eq("user_id", userId)
          .orderByDesc("is_default")
          .orderByDesc("updated_at");
        List<AddressDTO> result = addressRepo.selectList(qw).stream()
            .map(AddressDTO::from)
            .collect(Collectors.toList());
        return ApiResponse.success(result);
    }

    /** GET /addresses/{id} — 单条，仅限本人 */
    @GetMapping("/{id}")
    public ApiResponse<AddressDTO> detail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Address a = addressRepo.selectById(id);
        if (a == null || !userId.equals(a.getUserId())) return ApiResponse.error(404, "地址不存在");
        return ApiResponse.success(AddressDTO.from(a));
    }

    /** POST /addresses — 新建 */
    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<AddressDTO> create(@Valid @RequestBody AddressRequest req, HttpServletRequest request) {
        Long userId = requireUser(request);
        Address a = new Address();
        a.setUserId(userId);
        apply(a, req);

        boolean wantDefault = Boolean.TRUE.equals(req.getIsDefault());
        // 第一条地址强制设为默认
        long count = addressRepo.selectCount(new QueryWrapper<Address>().eq("user_id", userId));
        if (wantDefault || count == 0) {
            clearDefault(userId);
            a.setIsDefault(1);
        } else {
            a.setIsDefault(0);
        }
        addressRepo.insert(a);
        return ApiResponse.success("新增成功", AddressDTO.from(a));
    }

    /** PUT /addresses/{id} — 编辑 */
    @PutMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<AddressDTO> update(@PathVariable Long id, @Valid @RequestBody AddressRequest req, HttpServletRequest request) {
        Long userId = requireUser(request);
        Address a = addressRepo.selectById(id);
        if (a == null || !userId.equals(a.getUserId())) return ApiResponse.error(404, "地址不存在");

        apply(a, req);
        if (Boolean.TRUE.equals(req.getIsDefault()) && !Integer.valueOf(1).equals(a.getIsDefault())) {
            clearDefault(userId);
            a.setIsDefault(1);
        }
        addressRepo.updateById(a);
        return ApiResponse.success("更新成功", AddressDTO.from(a));
    }

    /** DELETE /addresses/{id} — 删除（逻辑删） */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Address a = addressRepo.selectById(id);
        if (a == null || !userId.equals(a.getUserId())) return ApiResponse.error(404, "地址不存在");
        addressRepo.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }

    /** POST /addresses/{id}/default — 设为默认 */
    @PostMapping("/{id}/default")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<AddressDTO> setDefault(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Address a = addressRepo.selectById(id);
        if (a == null || !userId.equals(a.getUserId())) return ApiResponse.error(404, "地址不存在");

        clearDefault(userId);
        a.setIsDefault(1);
        addressRepo.updateById(a);
        return ApiResponse.success("已设为默认", AddressDTO.from(a));
    }

    /* ────── helpers ────── */

    private void apply(Address a, AddressRequest req) {
        a.setReceiver(req.getReceiver());
        a.setPhone(req.getPhone());
        a.setRegion(req.getRegion());
        a.setDetail(req.getDetail());
        a.setTag(req.getTag());
    }

    private void clearDefault(Long userId) {
        Address patch = new Address();
        patch.setIsDefault(0);
        addressRepo.update(patch, new QueryWrapper<Address>()
            .eq("user_id", userId)
            .eq("is_default", 1));
    }

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new com.beadforge.exception.BusinessException(401, "需要登录");
        return uid;
    }
}
