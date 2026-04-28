package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.ApiConfig;
import com.beadforge.model.entity.Wallet;
import com.beadforge.model.entity.WalletLog;
import com.beadforge.repository.ApiConfigRepository;
import com.beadforge.repository.WalletLogRepository;
import com.beadforge.repository.WalletRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Tag(name = "充值支付",
        description = "拼豆币充值（微信/支付宝下单 + 回调确认）；payment_enabled=true 时走真实支付，否则模拟到账")
@Slf4j
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final WalletRepository walletRepo;
    private final WalletLogRepository logRepo;
    private final ApiConfigRepository configRepo;

    private String getConfig(String key) {
        QueryWrapper<ApiConfig> qw = new QueryWrapper<>();
        qw.eq("config_key", key);
        ApiConfig c = configRepo.selectOne(qw);
        return c != null ? c.getConfigValue() : "";
    }

    @Operation(summary = "创建充值订单",
            description = "method: wechat / alipay；返回支付参数（开启真实支付时含 prepayId / payUrl）")
    @PostMapping("/create-order")
    public ApiResponse<Map<String, Object>> createOrder(@RequestBody OrderRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        if (req.getAmount() <= 0) return ApiResponse.error(400, "金额必须大于0");

        boolean paymentEnabled = "true".equals(getConfig("payment_enabled"));
        int coinRate = 1;
        try { coinRate = Integer.parseInt(getConfig("coin_rate")); } catch (Exception ignored) {}
        int coins = req.getAmount() * coinRate;

        String orderId = "BF" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("amount", req.getAmount());
        result.put("coins", coins);
        result.put("method", req.getMethod());
        result.put("paymentEnabled", paymentEnabled);

        if (paymentEnabled) {
            // 真实支付：生成支付参数
            if ("wechat".equals(req.getMethod())) {
                String appId = getConfig("wechat_app_id");
                String mchId = getConfig("wechat_mch_id");
                result.put("appId", appId);
                result.put("mchId", mchId);
                // TODO: 调微信统一下单API生成prepay_id
                result.put("prepayId", "wx_prepay_" + orderId);
                result.put("payUrl", "weixin://wap/pay?prepayid=" + orderId);
            } else {
                String appId = getConfig("alipay_app_id");
                result.put("appId", appId);
                // TODO: 调支付宝创建交易API
                result.put("tradeNo", "ali_trade_" + orderId);
                result.put("payUrl", "alipays://platformapi/startapp?appId=" + appId);
            }
            return ApiResponse.success("订单创建成功，请完成支付", result);
        } else {
            // 模拟支付：直接到账
            return ApiResponse.success("模拟支付模式", result);
        }
    }

    @Operation(summary = "确认支付",
            description = "模拟模式下前端直接调用即到账；真实支付由微信/支付宝回调触发，会写钱包余额并产生 CHARGE 流水")
    @PostMapping("/confirm")
    @Transactional
    public ApiResponse<Map<String, Object>> confirmPayment(@RequestBody ConfirmRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        int coinRate = 1;
        try { coinRate = Integer.parseInt(getConfig("coin_rate")); } catch (Exception ignored) {}
        int coins = req.getAmount() * coinRate;

        // 充值到钱包
        QueryWrapper<Wallet> wqw = new QueryWrapper<>();
        wqw.eq("user_id", userId);
        Wallet w = walletRepo.selectOne(wqw);
        if (w == null) {
            w = new Wallet();
            w.setUserId(userId);
            w.setBalance(0);
            w.setTotalCharged(0);
            w.setTotalSpent(0);
            walletRepo.insert(w);
        }

        w.setBalance(w.getBalance() + coins);
        w.setTotalCharged(w.getTotalCharged() + coins);
        walletRepo.updateById(w);

        // 记录流水
        String methodName = "wechat".equals(req.getMethod()) ? "微信支付" : "支付宝";
        WalletLog walletLog = new WalletLog();
        walletLog.setUserId(userId);
        walletLog.setAmount(coins);
        walletLog.setBalanceAfter(w.getBalance());
        walletLog.setType("CHARGE");
        walletLog.setDescription("充值 " + coins + " 拼豆币（" + methodName + " ¥" + req.getAmount() + "）");
        logRepo.insert(walletLog);

        log.info("支付确认: userId={}, amount=¥{}, coins={}, method={}, orderId={}",
                userId, req.getAmount(), coins, req.getMethod(), req.getOrderId());

        Map<String, Object> result = new HashMap<>();
        result.put("balance", w.getBalance());
        result.put("coins", coins);
        result.put("orderId", req.getOrderId());
        return ApiResponse.success("充值成功", result);
    }

    @Operation(summary = "查询支付配置", description = "返回 paymentEnabled 与 coinRate；前端用于切换支付按钮文案")
    @GetMapping("/config")
    public ApiResponse<Map<String, Object>> payConfig(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        Map<String, Object> m = new HashMap<>();
        m.put("paymentEnabled", "true".equals(getConfig("payment_enabled")));
        int coinRate = 1;
        try { coinRate = Integer.parseInt(getConfig("coin_rate")); } catch (Exception ignored) {}
        m.put("coinRate", coinRate);
        return ApiResponse.success(m);
    }

    @Data
    static class OrderRequest {
        private int amount;
        private String method;
    }

    @Data
    static class ConfirmRequest {
        private String orderId;
        private int amount;
        private String method;
    }
}
