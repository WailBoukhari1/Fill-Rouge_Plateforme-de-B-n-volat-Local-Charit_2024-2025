package com.fill_rouge.backend.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
        // Content Security Policy
        response.setHeader("Content-Security-Policy",
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: blob: *; " +
                "font-src 'self' data: https:; " +
                "connect-src 'self' *;");

        // XSS Protection
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // Content Type Options
        response.setHeader("X-Content-Type-Options", "nosniff");

        // Frame Options
        response.setHeader("X-Frame-Options", "DENY");

        // Referrer Policy
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Permissions Policy
        response.setHeader("Permissions-Policy", 
                "camera=(), microphone=(), geolocation=(), payment=()");

        // HSTS (only in production)
        if (request.isSecure()) {
            response.setHeader("Strict-Transport-Security", 
                    "max-age=31536000; includeSubDomains; preload");
        }

        // Clear Site Data (for logout endpoints)
        if (request.getServletPath().equals("/api/auth/logout")) {
            response.setHeader("Clear-Site-Data", "\"cache\",\"cookies\",\"storage\"");
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/files/");  // Skip security headers for file requests
    }
} 