package com.beadforge.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beadforge.exception.BusinessException;
import com.beadforge.model.dto.ApiResponse;
import com.beadforge.model.dto.FeedbackCreateRequest;
import com.beadforge.model.dto.FeedbackDTO;
import com.beadforge.model.dto.FeedbackReplyRequest;
import com.beadforge.model.entity.Feedback;
import com.beadforge.model.entity.FeedbackReply;
import com.beadforge.repository.FeedbackReplyRepository;
import com.beadforge.repository.FeedbackRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 反馈工单：用户创建、查询、追加回复。
 * 路径：
 *   GET    /feedback/tickets            — 当前用户工单列表（分页）
 *   GET    /feedback/tickets/{id}       — 单个工单 + 所有回复
 *   POST   /feedback/tickets            — 创建工单，首条 content 自动作为 USER 首回复
 *   POST   /feedback/tickets/{id}/reply — 追加用户回复，状态置 PROCESSING
 */
@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackRepository feedbackRepo;
    private final FeedbackReplyRepository replyRepo;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @GetMapping("/tickets")
    public ApiResponse<Page<FeedbackDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        Long userId = requireUser(request);
        QueryWrapper<Feedback> qw = new QueryWrapper<>();
        qw.eq("user_id", userId).orderByDesc("created_at");
        Page<Feedback> raw = feedbackRepo.selectPage(new Page<>(page, size), qw);

        // 一次批量查所有回复，避免 N+1
        List<Long> ids = raw.getRecords().stream().map(Feedback::getId).collect(Collectors.toList());
        Map<Long, List<FeedbackReply>> repliesByTicket = ids.isEmpty()
            ? new HashMap<>()
            : replyRepo.selectList(new QueryWrapper<FeedbackReply>().in("feedback_id", ids).orderByAsc("created_at"))
                .stream().collect(Collectors.groupingBy(FeedbackReply::getFeedbackId));

        Page<FeedbackDTO> result = new Page<>(raw.getCurrent(), raw.getSize(), raw.getTotal());
        result.setRecords(raw.getRecords().stream()
            .map(f -> FeedbackDTO.from(f, repliesByTicket.getOrDefault(f.getId(), java.util.Collections.emptyList())))
            .collect(Collectors.toList()));
        return ApiResponse.success(result);
    }

    @GetMapping("/tickets/{id}")
    public ApiResponse<FeedbackDTO> detail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUser(request);
        Feedback f = feedbackRepo.selectById(id);
        if (f == null || !userId.equals(f.getUserId())) return ApiResponse.error(404, "工单不存在");
        List<FeedbackReply> replies = replyRepo.selectList(
            new QueryWrapper<FeedbackReply>().eq("feedback_id", id).orderByAsc("created_at"));
        return ApiResponse.success(FeedbackDTO.from(f, replies));
    }

    @PostMapping("/tickets")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<FeedbackDTO> create(@Valid @RequestBody FeedbackCreateRequest req, HttpServletRequest request) {
        Long userId = requireUser(request);
        Feedback f = new Feedback();
        f.setUserId(userId);
        f.setType(FeedbackDTO.typeToEn(req.getType()));
        f.setTitle(req.getTitle());
        f.setContent(req.getContent());
        f.setStatus("WAITING");
        f.setScreenshots(toJson(req.getScreenshots()));
        feedbackRepo.insert(f);

        // 把 content 作为首条用户回复，和前端展示形式（工单=对话）一致
        FeedbackReply first = new FeedbackReply();
        first.setFeedbackId(f.getId());
        first.setFromRole("USER");
        first.setContent(req.getContent());
        replyRepo.insert(first);

        return ApiResponse.success("提交成功", FeedbackDTO.from(f, java.util.Collections.singletonList(first)));
    }

    @PostMapping("/tickets/{id}/reply")
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<FeedbackDTO> reply(@PathVariable Long id, @Valid @RequestBody FeedbackReplyRequest req, HttpServletRequest request) {
        Long userId = requireUser(request);
        Feedback f = feedbackRepo.selectById(id);
        if (f == null || !userId.equals(f.getUserId())) return ApiResponse.error(404, "工单不存在");

        FeedbackReply r = new FeedbackReply();
        r.setFeedbackId(id);
        r.setFromRole("USER");
        r.setContent(req.getContent());
        replyRepo.insert(r);

        // 用户补充后状态回到处理中
        f.setStatus("PROCESSING");
        feedbackRepo.updateById(f);

        List<FeedbackReply> all = replyRepo.selectList(
            new QueryWrapper<FeedbackReply>().eq("feedback_id", id).orderByAsc("created_at"));
        return ApiResponse.success("已提交", FeedbackDTO.from(f, all));
    }

    /* ────── helpers ────── */

    private String toJson(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try { return MAPPER.writeValueAsString(list); } catch (Exception e) { return null; }
    }

    private Long requireUser(HttpServletRequest req) {
        Long uid = (Long) req.getAttribute("userId");
        if (uid == null) throw new BusinessException(401, "需要登录");
        return uid;
    }
}
