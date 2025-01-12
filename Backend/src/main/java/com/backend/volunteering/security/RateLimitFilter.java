package com.backend.volunteering.security;

import com.backend.volunteering.dto.response.ApiResponse;
import com.backend.volunteering.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private static final int MAX_REQUESTS_PER_HOUR = 100; // Increased for testing
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final LoadingCache<String, Integer> requestCountsPerIpAddress;

    public RateLimitFilter() {
        super();
        requestCountsPerIpAddress = CacheBuilder.newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS)
            .build(new CacheLoader<String, Integer>() {
                public Integer load(String key) {
                    return 0;
                }
            });
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            String clientIpAddress = getClientIP(request);
            if (isAuthenticationEndpoint(request) && isMaximumRequestsPerHourExceeded(clientIpAddress)) {
                ApiResponse.ErrorDetails errorDetails = new ApiResponse.ErrorDetails(
                    ErrorCode.RATE_LIMIT_EXCEEDED.getCode(),
                    "Too many requests. Please try again later."
                );
                
                ApiResponse<?> apiResponse = ApiResponse.error(
                    "Rate limit exceeded",
                    errorDetails
                );

                response.setStatus(ErrorCode.RATE_LIMIT_EXCEEDED.getStatus().value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                objectMapper.writeValue(response.getWriter(), apiResponse);
                return;
            }
            
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("Error in rate limit filter", e);
            throw e;
        }
    }

    private boolean isAuthenticationEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/");
    }

    private boolean isMaximumRequestsPerHourExceeded(String clientIpAddress) {
        try {
            int requests = requestCountsPerIpAddress.get(clientIpAddress);
            if (requests >= MAX_REQUESTS_PER_HOUR) {
                return true;
            }
            requestCountsPerIpAddress.put(clientIpAddress, requests + 1);
            return false;
        } catch (Exception e) {
            log.error("Error checking rate limit", e);
            return false;
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}