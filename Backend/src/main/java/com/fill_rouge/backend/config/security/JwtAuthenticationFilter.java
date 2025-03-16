package com.fill_rouge.backend.config.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");
            final String jwt;
            final String userEmail;

            // Skip token processing for non-secured endpoints
            if (shouldSkipTokenProcessing(request)) {
                filterChain.doFilter(request, response);
                return;
            }

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.debug("No valid Authorization header found for request to: {}", request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            jwt = authHeader.substring(7);
            try {
                userEmail = jwtService.extractUsername(jwt);
            } catch (ExpiredJwtException e) {
                logger.warn("JWT token has expired: {}", e.getMessage());
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token has expired");
                return;
            } catch (MalformedJwtException | SignatureException e) {
                logger.warn("Invalid JWT token: {}", e.getMessage());
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Successfully authenticated user: {}", userEmail);
                } else {
                    logger.warn("Token validation failed for user: {}", userEmail);
                    sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token validation failed");
                    return;
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Error processing JWT token: {}", e.getMessage(), e);
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error during authentication");
        }
    }

    private boolean shouldSkipTokenProcessing(HttpServletRequest request) {
        String path = request.getServletPath();
        logger.debug("Checking path for token processing: {}", path);
        return path.startsWith("/auth/") ||
               path.startsWith("/api/auth/") ||
               path.startsWith("/api/public/") ||
               path.startsWith("/api/files/") ||
               path.startsWith("/files/") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/swagger-ui/");
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        String jsonResponse = String.format("{\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}", 
            status, 
            HttpStatus.valueOf(status).getReasonPhrase(), 
            message);
        response.getWriter().write(jsonResponse);
    }
} 