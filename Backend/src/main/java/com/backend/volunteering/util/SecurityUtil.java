package com.backend.volunteering.util;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

public class SecurityUtil {
    public static String getCurrentUserIp() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            return xForwardedFor != null ? xForwardedFor.split(",")[0].trim() : request.getRemoteAddr();
        }
        return "unknown";
    }
} 