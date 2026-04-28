package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.dto.OrderCreateRequest;
import com.beadforge.model.dto.OrderDTO;
import com.beadforge.model.entity.Address;
import com.beadforge.model.entity.Order;
import com.beadforge.model.entity.OrderItem;
import com.beadforge.model.entity.Product;
import com.beadforge.model.enums.OrderStatus;
import com.beadforge.repository.AddressRepository;
import com.beadforge.repository.OrderItemRepository;
import com.beadforge.repository.OrderRepository;
import com.beadforge.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 订单流程：
 *   POST   /orders                 — 创建订单（PENDING）
 *   GET    /orders                 — 我的订单列表，支持 status 过滤（中文或英文）
 *   GET    /orders/{id}            — 详情含 items
 *   POST   /orders/{id}/pay        — 模拟支付：PENDING → PAID
 *   POST   /orders/{id}/ship       — 标记发货（管理员场景）：PAID → SHIPPED
 *   POST   /orders/{id}/receive    — 确认收货：SHIPPED → COMPLETED
 *   POST   /orders/{id}/cancel     — 取消（仅 PENDING / PAID 阶段允许）
 *   POST   /orders/{id}/refund     — 申请退款/售后
 */
@Tag(name = "订单",
        description = "材料商品订单：创建 → 支付 → 发货 → 收货 → 完成；含取消、申请售后")
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final AddressRepository addressRepo;

    @Operation(summary = "创建订单", description = "状态: PENDING；批量校验商品上架")
    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<OrderDTO> create(@Valid @RequestBody OrderCreateRequest req, HttpServletRequest request) {
        Long userId = requireUser(request);

        // 批量加载商品，拒绝不存在 / 已下架
        Set<Long> ids = req.getItems().stream().map(OrderCreateRequest.Item::getProductId).collect(Collectors.toSet());
        Map<Long, Product> pmap = productRepo.selectBatchIds(ids).stream()
            .collect(Collectors.toMap(Product::getId, p -> p));
        for (Long id : ids) {
            Product p = pmap.get(id);
            if (p == null) return ApiResponse.error(404, "商品不存在：" + id);
            if (p.getStatus() != null && !"ACTIVE".equalsIgnoreCase(p.getStatus())) {
                return ApiResponse.error(400, "商品已下架：" + p.getName());
            }
        }

        BigDecimal total = BigDecimal.ZERO;
        Order order = new Order();
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING.name());
        order.setTotalAmount(BigDecimal.ZERO);
        orderRepo.insert(order);

        List<OrderItem> items = new ArrayList<>();
        for (OrderCreateRequest.Item line : req.getItems()) {
            Product p = pmap.get(line.getProductId());
            BigDecimal lineAmount = p.getPrice().multiply(BigDecimal.valueOf(line.getQuantity()));
            total = total.add(lineAmount);

            OrderItem oi = new OrderItem();
            oi.setOrderId(order.getId());
            oi.setProductId(p.getId());
            oi.setQuantity(line.getQuantity());
            oi.setPrice(p.getPrice());
            itemRepo.insert(oi);
            items.add(oi);
        }
        order.setTotalAmount(total);
        orderRepo.updateById(order);

        OrderDTO dto = OrderDTO.detail(order, resolveTitle(pmap, items), resolveCover(pmap, items), items);
        return ApiResponse.success("创建成功", dto);
    }

    @Operation(summary = "我的订单列表",
            description = "status 支持中文（如「待付款」）或英文枚举名（PENDING / PAID / SHIPPED / COMPLETED / CANCELLED / REFUND）")
    @GetMapping
    public ApiResponse<Page<OrderDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        Long userId = requireUser(request);

        QueryWrapper<Order> qw = new QueryWrapper<>();
        qw.eq("user_id", userId);
        if (status != null && !status.isEmpty() && !"全部".equals(status)) {
            OrderStatus s = OrderStatus.fromLabel(status);
            if (s != null) qw.eq("status", s.name());
        }
        qw.orderByDesc("created_at");
        Page<Order> raw = orderRepo.selectPage(new Page<>(page, size), qw);

        // 批量加载所有订单的 items 和对应 products
        List<Long> orderIds = raw.getRecords().stream().map(Order::getId).collect(Collectors.toList());
        Map<Long, List<OrderItem>> itemsByOrder = orderIds.isEmpty()
            ? new HashMap<>()
            : itemRepo.selectList(new QueryWrapper<OrderItem>().in("order_id", orderIds))
                .stream().collect(Collectors.groupingBy(OrderItem::getOrderId));
        Set<Long> productIds = itemsByOrder.values().stream()
            .flatMap(List::stream).map(OrderItem::getProductId).collect(Collectors.toSet());
        Map<Long, Product> pmap = productIds.isEmpty()
            ? new HashMap<>()
            : productRepo.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        Address defaultAddr = loadDefaultAddress(userId);
        Page<OrderDTO> result = new Page<>(raw.getCurrent(), raw.getSize(), raw.getTotal());
        result.setRecords(raw.getRecords().stream().map(o -> {
            List<OrderItem> items = itemsByOrder.getOrDefault(o.getId(), Collections.emptyList());
            return applyAddress(
                OrderDTO.brief(o, resolveTitle(pmap, items), resolveCover(pmap, items)),
                defaultAddr);
        }).collect(Collectors.toList()));
        return ApiResponse.success(result);
    }

    @Operation(summary = "各状态订单数",
            description = "返回 { pending, paid, shipped, completed, cancelled, refund }，新用户全为 0；用于「我的」页订单卡片红点")
    @GetMapping("/stat-counts")
    public ApiResponse<Map<String, Long>> statCounts(HttpServletRequest request) {
        Long userId = requireUser(request);

        QueryWrapper<Order> qw = new QueryWrapper<>();
        qw.select("status", "COUNT(*) AS cnt").eq("user_id", userId).groupBy("status");
        List<Map<String, Object>> rows = orderRepo.selectMaps(qw);

        Map<String, Long> result = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            result.put(s.name().toLowerCase(), 0L);
        }
        for (Map<String, Object> row : rows) {
            Object statusObj = row.get("status");
            Object cntObj = row.get("cnt");
            if (statusObj == null || cntObj == null) continue;
            String key = statusObj.toString().toLowerCase();
            if (result.containsKey(key)) {
                result.put(key, ((Number) cntObj).longValue());
            }
        }
        return ApiResponse.success(result);
    }

    @Operation(summary = "订单详情", description = "含订单项与默认收货地址")
    @GetMapping("/{id}")
    public ApiResponse<OrderDTO> detail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Order o = orderRepo.selectById(id);
        if (o == null || !userId.equals(o.getUserId())) return ApiResponse.error(404, "订单不存在");
        List<OrderItem> items = itemRepo.selectList(new QueryWrapper<OrderItem>().eq("order_id", id));
        Set<Long> productIds = items.stream().map(OrderItem::getProductId).collect(Collectors.toSet());
        Map<Long, Product> pmap = productIds.isEmpty()
            ? new HashMap<>()
            : productRepo.selectBatchIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        return ApiResponse.success(applyAddress(
            OrderDTO.detail(o, resolveTitle(pmap, items), resolveCover(pmap, items), items),
            loadDefaultAddress(userId)));
    }

    @Operation(summary = "支付订单", description = "PENDING → PAID（当前为模拟支付）")
    @PostMapping("/{id}/pay")
    public ApiResponse<OrderDTO> pay(@PathVariable Long id, HttpServletRequest request) {
        return transition(id, request, OrderStatus.PENDING, OrderStatus.PAID, "支付成功");
    }

    @Operation(summary = "发货", description = "PAID → SHIPPED（管理员场景）")
    @PostMapping("/{id}/ship")
    public ApiResponse<OrderDTO> ship(@PathVariable Long id, HttpServletRequest request) {
        return transition(id, request, OrderStatus.PAID, OrderStatus.SHIPPED, "已发货");
    }

    @Operation(summary = "确认收货", description = "SHIPPED → COMPLETED")
    @PostMapping("/{id}/receive")
    public ApiResponse<OrderDTO> receive(@PathVariable Long id, HttpServletRequest request) {
        return transition(id, request, OrderStatus.SHIPPED, OrderStatus.COMPLETED, "已确认收货");
    }

    @Operation(summary = "取消订单", description = "仅 PENDING / PAID 阶段允许")
    @PostMapping("/{id}/cancel")
    public ApiResponse<OrderDTO> cancel(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Order o = orderRepo.selectById(id);
        if (o == null || !userId.equals(o.getUserId())) return ApiResponse.error(404, "订单不存在");
        OrderStatus cur = OrderStatus.fromLabel(o.getStatus());
        if (cur != OrderStatus.PENDING && cur != OrderStatus.PAID) {
            return ApiResponse.error(400, "当前状态无法取消");
        }
        o.setStatus(OrderStatus.CANCELLED.name());
        orderRepo.updateById(o);
        return ApiResponse.success("已取消", reloadDetail(o));
    }

    @Operation(summary = "申请售后/退款", description = "PENDING / CANCELLED 之外的状态可申请")
    @PostMapping("/{id}/refund")
    public ApiResponse<OrderDTO> refund(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Order o = orderRepo.selectById(id);
        if (o == null || !userId.equals(o.getUserId())) return ApiResponse.error(404, "订单不存在");
        OrderStatus cur = OrderStatus.fromLabel(o.getStatus());
        if (cur == OrderStatus.PENDING || cur == OrderStatus.CANCELLED) {
            return ApiResponse.error(400, "当前状态无法申请售后");
        }
        o.setStatus(OrderStatus.REFUND.name());
        orderRepo.updateById(o);
        return ApiResponse.success("已提交售后", reloadDetail(o));
    }

    /* ────── helpers ────── */

    private ApiResponse<OrderDTO> transition(Long id, HttpServletRequest request,
                                             OrderStatus from, OrderStatus to, String successMsg) {
        Long userId = requireUser(request);
        Order o = orderRepo.selectById(id);
        if (o == null || !userId.equals(o.getUserId())) return ApiResponse.error(404, "订单不存在");
        OrderStatus cur = OrderStatus.fromLabel(o.getStatus());
        if (cur != from) return ApiResponse.error(400, "当前状态不可执行此操作");
        o.setStatus(to.name());
        orderRepo.updateById(o);
        return ApiResponse.success(successMsg, reloadDetail(o));
    }

    private OrderDTO reloadDetail(Order o) {
        List<OrderItem> items = itemRepo.selectList(new QueryWrapper<OrderItem>().eq("order_id", o.getId()));
        Set<Long> pids = items.stream().map(OrderItem::getProductId).collect(Collectors.toSet());
        Map<Long, Product> pmap = pids.isEmpty()
            ? new HashMap<>()
            : productRepo.selectBatchIds(pids).stream().collect(Collectors.toMap(Product::getId, p -> p));
        return applyAddress(
            OrderDTO.detail(o, resolveTitle(pmap, items), resolveCover(pmap, items), items),
            loadDefaultAddress(o.getUserId()));
    }

    private Address loadDefaultAddress(Long userId) {
        QueryWrapper<Address> qw = new QueryWrapper<>();
        qw.eq("user_id", userId).orderByDesc("is_default").orderByDesc("updated_at").last("LIMIT 1");
        List<Address> list = addressRepo.selectList(qw);
        return list.isEmpty() ? null : list.get(0);
    }

    private OrderDTO applyAddress(OrderDTO dto, Address a) {
        if (a == null) return dto;
        String full = (a.getRegion() == null ? "" : a.getRegion()) + " " + (a.getDetail() == null ? "" : a.getDetail());
        dto.withReceiver(a.getReceiver(), a.getPhone(), full.trim());
        return dto;
    }

    private String resolveTitle(Map<Long, Product> pmap, List<OrderItem> items) {
        if (items.isEmpty()) return "订单";
        Product first = pmap.get(items.get(0).getProductId());
        String firstName = first == null ? "商品" : first.getName();
        if (items.size() == 1) return firstName;
        return firstName + " 等 " + items.size() + " 件";
    }

    private String resolveCover(Map<Long, Product> pmap, List<OrderItem> items) {
        if (items.isEmpty()) return null;
        Product first = pmap.get(items.get(0).getProductId());
        return first == null ? null : first.getCategory();
    }

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new BusinessException(401, "需要登录");
        return uid;
    }
}
