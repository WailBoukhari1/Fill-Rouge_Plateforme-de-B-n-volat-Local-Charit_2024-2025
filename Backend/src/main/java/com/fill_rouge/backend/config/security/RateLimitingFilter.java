package com.fill_rouge.backend.config.security;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    private static final int MAX_REQUESTS_PER_HOUR = 100;
    private static final int MAX_REQUESTS_PER_MINUTE = 20;

    private final LoadingCache<String, Integer> hourRequestsCache;
    private final LoadingCache<String, Integer> minuteRequestsCache;

    public RateLimitingFilter() {
        super();
        hourRequestsCache = CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build(new CacheLoader<>() {
                    @Override
                    public Integer load(String key) {
                        return 0;
                    }
                });

        minuteRequestsCache = CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .build(new CacheLoader<>() {
                    @Override
                    public Integer load(String key) {
                        return 0;
                    }
                });
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        String clientIp = getClientIP(request);
        
        try {
            // Check hour limit
            int hourRequests = hourRequestsCache.get(clientIp);
            if (hourRequests >= MAX_REQUESTS_PER_HOUR) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Please try again in an hour.");
                return;
            }
            hourRequestsCache.put(clientIp, hourRequests + 1);

            // Check minute limit
            int minuteRequests = minuteRequestsCache.get(clientIp);
            if (minuteRequests >= MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Please try again in a minute.");
                return;
            }
            minuteRequestsCache.put(clientIp, minuteRequests + 1);

            filterChain.doFilter(request, response);
        } catch (ExecutionException e) {
            throw new ServletException("Error in rate limiting", e);
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/public/") || 
               path.equals("/api/auth/verify-email") ||
               path.equals("/actuator/health");
    }
} 