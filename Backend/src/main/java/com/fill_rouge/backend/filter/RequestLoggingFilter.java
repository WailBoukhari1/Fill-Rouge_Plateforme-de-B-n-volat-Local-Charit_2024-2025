package com.fill_rouge.backend.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@WebFilter(urlPatterns = "/*")
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Generate unique request ID for tracing
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        
        // Log request details
        log.info("[REQ:{}] {} {} (Remote: {})", 
                requestId,
                httpRequest.getMethod(), 
                httpRequest.getRequestURI(),
                httpRequest.getRemoteAddr());
        
        log.debug("[REQ:{}] Context Path: {}", requestId, httpRequest.getContextPath());
        log.debug("[REQ:{}] Servlet Path: {}", requestId, httpRequest.getServletPath());
        log.debug("[REQ:{}] Path Info: {}", requestId, httpRequest.getPathInfo());
        log.debug("[REQ:{}] Query String: {}", requestId, httpRequest.getQueryString());
        
        // Set request ID in response header for debugging
        httpResponse.setHeader("X-Request-ID", requestId);
        
        // Calculate and log request processing time
        long startTime = System.currentTimeMillis();
        try {
            chain.doFilter(request, response);
        } finally {
            long endTime = System.currentTimeMillis();
            log.info("[REQ:{}] Completed: {} {} ({} ms)", 
                    requestId,
                    httpResponse.getStatus(),
                    httpRequest.getRequestURI(),
                    endTime - startTime);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) {
        log.info("RequestLoggingFilter initialized");
    }

    @Override
    public void destroy() {
        log.info("RequestLoggingFilter destroyed");
    }
} 