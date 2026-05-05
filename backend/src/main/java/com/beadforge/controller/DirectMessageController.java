package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.entity.DmMessage;
import com.beadforge.model.entity.DmSession;
import com.beadforge.model.entity.User;
import com.beadforge.repository.DmMessageRepository;
import com.beadforge.repository.DmSessionRepository;
import com.beadforge.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 私信。
 *   GET  /direct-messages/sessions                    — 我的会话列表
 *   GET  /direct-messages/sessions/by-name/{userName} — 与指定用户的会话内容
 *   POST /direct-messages/sessions/by-name/{userName} — 发送消息（自动建会话）
 *   POST /direct-messages/sessions/{id}/read          — 标记会话已读
 */
@RestController
@RequestMapping("/direct-messages")
@RequiredArgsConstructor
public class DirectMessageController {

    private final DmSessionRepository sessionRepo;
    private final DmMessageRepository messageRepo;
    private final UserRepository userRepo;

    @GetMapping("/sessions")
    public ApiResponse<List<Map<String, Object>>> sessions(HttpServletRequest request) {
        Long userId = requireUser(request);
        List<DmSession> rows = sessionRepo.selectList(new QueryWrapper<DmSession>()
            .and(w -> w.eq("user_a_id", userId).or().eq("user_b_id", userId))
            .orderByDesc("last_at"));
        if (rows.isEmpty()) return ApiResponse.success(Collections.emptyList());

        Set<Long> peerIds = rows.stream()
            .map(s -> userId.equals(s.getUserAId()) ? s.getUserBId() : s.getUserAId())
            .collect(Collectors.toSet());
        Map<Long, User> users = userRepo.selectBatchIds(peerIds).stream()
            .collect(Collectors.toMap(User::getId, u -> u));

        List<Map<String, Object>> data = rows.stream().map(s -> {
            boolean iAmA = userId.equals(s.getUserAId());
            Long peerId = iAmA ? s.getUserBId() : s.getUserAId();
            int unread = iAmA
                ? (s.getUnreadA() == null ? 0 : s.getUnreadA())
                : (s.getUnreadB() == null ? 0 : s.getUnreadB());
            User peer = users.get(peerId);
            String name = peer != null ? (peer.getNickname() != null ? peer.getNickname() : peer.getUsername()) : "已注销";

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", "chat-" + s.getId());
            m.put("sessionId", s.getId());
            m.put("name", name);
            m.put("role", "创作者");
            m.put("preview", s.getLastContent() == null ? "" : s.getLastContent());
            m.put("time", formatShortTime(s.getLastAt()));
            m.put("unread", unread);
            return m;
        }).collect(Collectors.toList());
        return ApiResponse.success(data);
    }

    @GetMapping("/sessions/by-name/{userName}")
    public ApiResponse<Map<String, Object>> messagesByName(@PathVariable String userName, HttpServletRequest request) {
        Long userId = requireUser(request);
        User peer = findUserByName(userName);
        if (peer == null) throw new BusinessException(404, "对方用户不存在");
        Long peerId = peer.getId();
        if (peerId.equals(userId)) throw new BusinessException(400, "不能给自己发私信");

        DmSession session = findOrInitSession(userId, peerId, false);

        List<DmMessage> msgs = session.getId() == null
            ? Collections.emptyList()
            : messageRepo.selectList(new QueryWrapper<DmMessage>()
                .eq("session_id", session.getId()).orderByAsc("created_at"));

        List<Map<String, Object>> data = msgs.stream().map(msg -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", "m" + msg.getId());
            m.put("fromMe", userId.equals(msg.getFromUserId()));
            m.put("text", msg.getContent());
            m.put("time", formatShortTime(msg.getCreatedAt()));
            if (msg.getAttachment() != null) m.put("attachment", msg.getAttachment());
            return m;
        }).collect(Collectors.toList());

        // 进入会话即把对方发我的未读数清零
        if (session.getId() != null) {
            UpdateWrapper<DmSession> uw = new UpdateWrapper<>();
            uw.eq("id", session.getId());
            if (userId.equals(session.getUserAId())) uw.set("unread_a", 0);
            else uw.set("unread_b", 0);
            sessionRepo.update(null, uw);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("peer", peerSummary(peer));
        result.put("messages", data);
        return ApiResponse.success(result);
    }

    @PostMapping("/sessions/by-name/{userName}")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Map<String, Object>> send(
            @PathVariable String userName,
            @Valid @RequestBody SendRequest req,
            HttpServletRequest request) {
        Long userId = requireUser(request);
        User peer = findUserByName(userName);
        if (peer == null) throw new BusinessException(404, "对方用户不存在");
        if (peer.getId().equals(userId)) throw new BusinessException(400, "不能给自己发私信");

        DmSession session = findOrInitSession(userId, peer.getId(), true);

        DmMessage msg = new DmMessage();
        msg.setSessionId(session.getId());
        msg.setFromUserId(userId);
        msg.setToUserId(peer.getId());
        msg.setContent(req.getContent().trim());
        msg.setAttachment(req.getAttachment());
        messageRepo.insert(msg);

        // 更新会话摘要 + 对方未读数 +1
        UpdateWrapper<DmSession> uw = new UpdateWrapper<>();
        uw.eq("id", session.getId())
            .set("last_content", msg.getContent())
            .set("last_at", LocalDateTime.now());
        if (userId.equals(session.getUserAId())) {
            uw.setSql("unread_b = IFNULL(unread_b, 0) + 1");
        } else {
            uw.setSql("unread_a = IFNULL(unread_a, 0) + 1");
        }
        sessionRepo.update(null, uw);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", "m" + msg.getId());
        m.put("fromMe", true);
        m.put("text", msg.getContent());
        m.put("time", "刚刚");
        if (msg.getAttachment() != null) m.put("attachment", msg.getAttachment());
        return ApiResponse.success("已发送", m);
    }

    @PostMapping("/sessions/{id}/read")
    public ApiResponse<Void> markRead(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        DmSession s = sessionRepo.selectById(id);
        if (s == null) return ApiResponse.success(null);
        if (!userId.equals(s.getUserAId()) && !userId.equals(s.getUserBId())) {
            throw new BusinessException(403, "无权访问该会话");
        }
        UpdateWrapper<DmSession> uw = new UpdateWrapper<>();
        uw.eq("id", id);
        if (userId.equals(s.getUserAId())) uw.set("unread_a", 0);
        else uw.set("unread_b", 0);
        sessionRepo.update(null, uw);
        return ApiResponse.success(null);
    }

    /* ────── helpers ────── */

    private DmSession findOrInitSession(Long meId, Long peerId, boolean create) {
        Long aId = meId.compareTo(peerId) < 0 ? meId : peerId;
        Long bId = meId.compareTo(peerId) < 0 ? peerId : meId;
        DmSession s = sessionRepo.selectOne(new QueryWrapper<DmSession>()
            .eq("user_a_id", aId).eq("user_b_id", bId));
        if (s != null) return s;
        if (!create) {
            DmSession blank = new DmSession();
            blank.setUserAId(aId);
            blank.setUserBId(bId);
            return blank;
        }
        DmSession ns = new DmSession();
        ns.setUserAId(aId);
        ns.setUserBId(bId);
        ns.setUnreadA(0);
        ns.setUnreadB(0);
        ns.setLastAt(LocalDateTime.now());
        sessionRepo.insert(ns);
        return ns;
    }

    private User findUserByName(String userName) {
        if (userName == null || userName.isEmpty()) return null;
        User byNick = userRepo.selectOne(new QueryWrapper<User>()
            .eq("nickname", userName).last("LIMIT 1"));
        if (byNick != null) return byNick;
        return userRepo.selectOne(new QueryWrapper<User>()
            .eq("username", userName).last("LIMIT 1"));
    }

    private Map<String, Object> peerSummary(User peer) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", peer.getId());
        m.put("name", peer.getNickname() != null ? peer.getNickname() : peer.getUsername());
        m.put("title", "创作者");
        m.put("avatar", peer.getAvatar());
        return m;
    }

    private String formatShortTime(LocalDateTime t) {
        if (t == null) return "";
        long minutes = ChronoUnit.MINUTES.between(t, LocalDateTime.now());
        if (minutes < 1) return "刚刚";
        if (minutes < 60) return minutes + "分钟前";
        long hours = minutes / 60;
        if (hours < 24) return String.format("%02d:%02d", t.getHour(), t.getMinute());
        long days = hours / 24;
        if (days == 1) return "昨天";
        if (days < 7) return days + "天前";
        return t.toLocalDate().toString();
    }

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new BusinessException(401, "需要登录");
        return uid;
    }

    @Data
    public static class SendRequest {
        @NotBlank(message = "内容不能为空")
        @Size(max = 2000, message = "内容最多 2000 字")
        private String content;
        /** photo / gif / null */
        private String attachment;
    }
}
