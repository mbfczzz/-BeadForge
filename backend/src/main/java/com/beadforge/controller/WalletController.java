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
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    /** 查余额 */
    @GetMapping("/balance")
    public ApiResponse<Map<String, Object>> balance(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        Wallet w = getOrCreate(userId);
        Map<String, Object> m = new HashMap<>();
        m.put("balance", w.getBalance());
        m.put("totalCharged", w.getTotalCharged());
        m.put("totalSpent", w.getTotalSpent());
        return ApiResponse.success(m);
    }

    /** 充值（模拟，实际对接微信/支付宝） */
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

    /** 拼豆币购买图纸 */
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

    /** 流水记录 */
    @GetMapping("/logs")
    public ApiResponse<List<WalletLog>> logs(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.error(401, "需要登录");
        QueryWrapper<WalletLog> qw = new QueryWrapper<>();
        qw.eq("user_id", userId).orderByDesc("created_at");
        qw.last("LIMIT 50");
        return ApiResponse.success(logRepo.selectList(qw));
    }

    @Data
    static class ChargeRequest {
        private int amount;
        private String method; // wechat / alipay
    }
}
