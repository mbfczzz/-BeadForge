package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.PatternListing;
import com.beadforge.model.entity.PatternPurchase;
import com.beadforge.model.entity.Wallet;
import com.beadforge.model.entity.WalletLog;
import com.beadforge.repository.PatternListingRepository;
import com.beadforge.repository.PatternPurchaseRepository;
import com.beadforge.repository.WalletLogRepository;
import com.beadforge.repository.WalletRepository;
import com.beadforge.service.DictService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "钱包",
        description = "拼豆币：余额 / 签到 / 充值 / 购买图纸 / 流水")
@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletRepository walletRepo;
    private final WalletLogRepository logRepo;
    private final PatternListingRepository patternRepo;
    private final PatternPurchaseRepository purchaseRepo;

    /** 获取/创建钱包 */
    private Wallet getOrCreate(Long userId) {
        QueryWrapper<Wallet> qw = new QueryWrapper<>();
        qw.eq("user_id", userId);
        Wallet w = walletRepo.selectOne(qw);
        if (w == null) {
            w = new Wallet();
            w.setUserId(userId);
            w.setBalance(0);
            w.setTotalCharged(0);
            w.setTotalSpent(0);
            walletRepo.insert(w);
        }
        return w;
    }

    /** 记录流水 */
    private void addLog(Long userId, int amount, int balanceAfter, String type, String desc) {
        WalletLog log = new WalletLog();
        log.setUserId(userId);
        log.setAmount(amount);
        log.setBalanceAfter(balanceAfter);
        log.setType(type);
        log.setDescription(desc);
        logRepo.insert(log);
    }

    @Operation(summary = "查询钱包余额",
            description = "返回 balance / totalCharged / totalSpent / signedToday / lastSignInDate")
    @GetMapping("/balance")
    public ApiResponse<Map<String, Object>> balance(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        Wallet w = getOrCreate(userId);
        Map<String, Object> m = new HashMap<>();
        m.put("balance", w.getBalance());
        m.put("totalCharged", w.getTotalCharged());
        m.put("totalSpent", w.getTotalSpent());
        boolean signed = hasSignedToday(userId);
        m.put("signedToday", signed);
        m.put("lastSignInDate", signed ? LocalDate.now().toString() : null);
        return ApiResponse.success(m);
    }

    @Operation(summary = "每日签到", description = "每日 1 次，奖励 20 拼豆币；按 SIGN_IN 流水类型判断当天是否已签")
    @PostMapping("/sign-in")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Map<String, Object>> signIn(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        if (hasSignedToday(userId)) {
            return ApiResponse.error(400, "今日已签到");
        }

        int reward = 20;
        Wallet w = getOrCreate(userId);
        w.setBalance(w.getBalance() + reward);
        w.setTotalCharged(w.getTotalCharged() + reward);
        walletRepo.updateById(w);

        addLog(userId, reward, w.getBalance(), "SIGN_IN", "每日签到奖励");

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("balance", w.getBalance());
        m.put("reward", reward);
        m.put("signedToday", true);
        m.put("lastSignInDate", LocalDate.now().toString());
        return ApiResponse.success("签到成功", m);
    }

    private boolean hasSignedToday(Long userId) {
        LocalDate today = LocalDate.now();
        QueryWrapper<WalletLog> qw = new QueryWrapper<>();
        qw.eq("user_id", userId)
          .eq("type", "SIGN_IN")
          .ge("created_at", today.atStartOfDay())
          .lt("created_at", today.plusDays(1).atStartOfDay());
        return logRepo.selectCount(qw) > 0;
    }

    @Operation(summary = "充值（模拟）",
            description = "纯模拟充值；正式走 /payment/create-order + /payment/confirm 流程")
    @PostMapping("/charge")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Map<String, Object>> charge(@RequestBody ChargeRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        if (req.getAmount() <= 0) return ApiResponse.error(400, "充值金额必须大于0");

        Wallet w = getOrCreate(userId);
        w.setBalance(w.getBalance() + req.getAmount());
        w.setTotalCharged(w.getTotalCharged() + req.getAmount());
        walletRepo.updateById(w);

        addLog(userId, req.getAmount(), w.getBalance(), "CHARGE",
            "充值 " + req.getAmount() + " 拼豆币（" + req.getMethod() + "）");

        Map<String, Object> m = new HashMap<>();
        m.put("balance", w.getBalance());
        m.put("charged", req.getAmount());
        return ApiResponse.success("充值成功", m);
    }

    @Operation(summary = "用拼豆币购买图纸",
            description = "免费图纸直接获取；付费扣余额（1 元 = 1 拼豆币）；同步写购买记录与下载量")
    @PostMapping("/buy-pattern/{id}")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Map<String, Object>> buyPattern(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");

        // 检查已购
        QueryWrapper<PatternPurchase> pqw = new QueryWrapper<>();
        pqw.eq("user_id", userId).eq("listing_id", id);
        if (purchaseRepo.selectCount(pqw) > 0) return ApiResponse.error(400, "已拥有此图纸");

        PatternListing listing = patternRepo.selectById(id);
        if (listing == null) return ApiResponse.error(404, "图纸不存在");

        // 免费直接获取
        if (Integer.valueOf(1).equals(listing.getIsFree())) {
            PatternPurchase pp = new PatternPurchase();
            pp.setUserId(userId);
            pp.setListingId(id);
            pp.setPrice(BigDecimal.ZERO);
            purchaseRepo.insert(pp);
            listing.setDownloads(listing.getDownloads() + 1);
            patternRepo.updateById(listing);
            return ApiResponse.success("免费获取成功", null);
        }

        // 扣拼豆币
        int cost = listing.getPrice().intValue(); // 1元 = 1拼豆币
        Wallet w = getOrCreate(userId);
        if (w.getBalance() < cost) return ApiResponse.error(400, "拼豆币不足，请先充值");

        w.setBalance(w.getBalance() - cost);
        w.setTotalSpent(w.getTotalSpent() + cost);
        walletRepo.updateById(w);

        addLog(userId, -cost, w.getBalance(), "BUY_PATTERN", "购买图纸「" + listing.getTitle() + "」");

        PatternPurchase pp = new PatternPurchase();
        pp.setUserId(userId);
        pp.setListingId(id);
        pp.setPrice(listing.getPrice());
        purchaseRepo.insert(pp);
        listing.setDownloads(listing.getDownloads() + 1);
        patternRepo.updateById(listing);

        Map<String, Object> m = new HashMap<>();
        m.put("balance", w.getBalance());
        m.put("cost", cost);
        return ApiResponse.success("购买成功", m);
    }

    @Operation(summary = "钱包流水",
            description = "近 50 条；返回字段对齐前端 ProfileWalletLog；type 通过字典 WALLET_LOG_TYPE 翻译为中文")
    @GetMapping("/logs")
    public ApiResponse<List<Map<String, Object>>> logs(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        QueryWrapper<WalletLog> qw = new QueryWrapper<>();
        qw.eq("user_id", userId).orderByDesc("created_at");
        qw.last("LIMIT 50");
        List<WalletLog> raws = logRepo.selectList(qw);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        List<Map<String, Object>> result = raws.stream().map(l -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", l.getId());
            m.put("title", typeToCn(l.getType()));
            m.put("description", l.getDescription() != null ? l.getDescription() : "");
            m.put("amount", l.getAmount());
            m.put("createdAt", l.getCreatedAt() == null ? null : l.getCreatedAt().format(fmt));
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.success(result);
    }

    private static String typeToCn(String type) {
        return type == null ? "" : DictService.labelOf("WALLET_LOG_TYPE", type);
    }

    @Data
    static class ChargeRequest {
        private int amount;
        private String method; // wechat / alipay
    }
}
