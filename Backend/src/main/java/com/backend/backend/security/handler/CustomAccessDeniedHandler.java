package com.backend.backend.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.backend.backend.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public CustomAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                      AccessDeniedException accessDeniedException) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        String timestamp = ZonedDateTime.now().format(DateTimeFormatter.ISO_INSTANT);

        ErrorResponse errorResponse = ErrorResponse.builder()
            .timestamp(timestamp)
            .status(HttpServletResponse.SC_FORBIDDEN)
            .error("Forbidden")
            .message("Access denied")
            .path(request.getServletPath())
            .build();

        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
} 