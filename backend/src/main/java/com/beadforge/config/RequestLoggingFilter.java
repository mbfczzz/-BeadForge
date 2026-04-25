package com.beadforge.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * HTTP 请求日志 — 每个请求打一行：
 *   [GET ] /api/orders?page=1                 → 200 (12ms)  ip=172.16.2.x
 *
 * 排在最前面（Ordered.HIGHEST_PRECEDENCE），保证记录到所有请求（含 401/403）。
 * 通过 logging.level.com.beadforge.config=info 控制级别。
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            chain.doFilter(req, res);
        } finally {
            long cost = System.currentTimeMillis() - start;
            String qs = req.getQueryString();
            String path = req.getRequestURI() + (qs != null && !qs.isEmpty() ? "?" + qs : "");
            int status = res.getStatus();
            String tag = status >= 500 ? "ERR " : status >= 400 ? "WARN" : "OK  ";
            log.info("[{}] {} {} → {} ({}ms) ip={}",
                String.format("%-6s", req.getMethod()),
                tag,
                path,
                status,
                cost,
                clientIp(req));
        }
    }

    private String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) return xff.split(",")[0].trim();
        return req.getRemoteAddr();
    }
}
