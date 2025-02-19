package com.fill_rouge.backend.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.fill_rouge.backend.dto.response.ApiResponse;
import com.fill_rouge.backend.dto.response.ErrorResponse;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private final HttpServletRequest request;

    public GlobalExceptionHandler(HttpServletRequest request) {
        this.request = request;
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException ex) {
        String traceId = generateTraceId();
        logger.error("Custom error occurred - TraceId: {} - ErrorCode: {}", traceId, ex.getErrorCode(), ex);
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST.value())
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .errorCode(ex.getErrorCode())
                        .path(request.getRequestURI())
                        .traceId(traceId)
                        .timestamp(ex.getTimestamp())
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
        String traceId = generateTraceId();
        logger.error("Validation error - TraceId: {}", traceId, ex);

        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .error("Validation Error")
                .validationErrors(convertToValidationErrors(ex.getFieldErrors()))
                .traceId(traceId)
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> validationErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value"
            ));

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("message", "Invalid request parameters");
        body.put("details", validationErrors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        String traceId = generateTraceId();
        logger.error("Constraint violation - TraceId: {}", traceId, ex);

        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse response = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Constraint violation")
                .timestamp(LocalDateTime.now())
                .error("Validation Error")
                .validationErrors(convertToValidationErrors(errors))
                .traceId(traceId)
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler({
            AuthenticationException.class,
            BadCredentialsException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(Exception ex) {
        String traceId = generateTraceId();
        logger.error("Authentication error - TraceId: {}", traceId, ex);
        
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED.value())
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .errorCode("INVALID_CREDENTIALS")
                        .path(request.getRequestURI())
                        .traceId(traceId)
                        .build());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Forbidden");
        body.put("message", "Access Denied");
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabledAccount(DisabledException ex) {
        String traceId = generateTraceId();
        logger.error("Account disabled - TraceId: {}", traceId, ex);
        
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN.value())
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.FORBIDDEN.value())
                        .errorCode("ACCOUNT_DISABLED")
                        .path(request.getRequestURI())
                        .traceId(traceId)
                        .build());
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiResponse<Void>> handleLockedAccount(LockedException ex) {
        String traceId = generateTraceId();
        logger.error("Account locked - TraceId: {}", traceId, ex);
        
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN.value())
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.FORBIDDEN.value())
                        .errorCode("ACCOUNT_LOCKED")
                        .path(request.getRequestURI())
                        .traceId(traceId)
                        .build());
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ApiResponse<Void>> handleExpiredJwt(ExpiredJwtException ex) {
        String traceId = generateTraceId();
        logger.error("Token expired - TraceId: {}", traceId, ex);
        
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED.value())
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .errorCode("TOKEN_EXPIRED")
                        .path(request.getRequestURI())
                        .traceId(traceId)
                        .build());
    }

    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidJwt(SignatureException ex) {
        String traceId = generateTraceId();
        logger.error("Invalid token - TraceId: {}", traceId, ex);
        
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED.value())
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .errorCode("INVALID_TOKEN")
                        .path(request.getRequestURI())
                        .traceId(traceId)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", "An unexpected error occurred");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private String generateTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private List<ErrorResponse.ValidationError> convertToValidationErrors(Map<String, String> errors) {
        return errors.entrySet().stream()
                .map(entry -> ErrorResponse.ValidationError.builder()
                        .field(entry.getKey())
                        .message(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }
}
