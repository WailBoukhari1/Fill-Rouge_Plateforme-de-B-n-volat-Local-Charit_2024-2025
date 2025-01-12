package com.backend.volunteering.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // Authentication & Authorization
    INVALID_CREDENTIALS("AUTH_001", "Invalid login credentials", HttpStatus.UNAUTHORIZED),
    ACCOUNT_DISABLED("AUTH_002", "Account is disabled", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN("AUTH_003", "Invalid or expired token", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("AUTH_004", "Token has expired", HttpStatus.UNAUTHORIZED),
    INSUFFICIENT_PERMISSIONS("AUTH_005", "Insufficient permissions", HttpStatus.FORBIDDEN),
    EMAIL_NOT_VERIFIED("AUTH_006", "Email not verified", HttpStatus.FORBIDDEN),

    // Resource errors
    RESOURCE_NOT_FOUND("RES_001", "Resource not found", HttpStatus.NOT_FOUND),
    RESOURCE_ALREADY_EXISTS("RES_002", "Resource already exists", HttpStatus.CONFLICT),
    RESOURCE_CONFLICT("RES_003", "Resource conflict", HttpStatus.CONFLICT),

    // Validation errors
    INVALID_INPUT("VAL_001", "Invalid input provided", HttpStatus.BAD_REQUEST),
    MISSING_FIELD("VAL_002", "Required field is missing", HttpStatus.BAD_REQUEST),
    INVALID_FORMAT("VAL_003", "Invalid format", HttpStatus.BAD_REQUEST),
    PASSWORD_POLICY_VIOLATION("VAL_004", "Password does not meet security requirements", HttpStatus.BAD_REQUEST),
    EMAIL_FORMAT_INVALID("VAL_005", "Invalid email format", HttpStatus.BAD_REQUEST),

    // Security
    RATE_LIMIT_EXCEEDED("SEC_001", "Too many requests", HttpStatus.TOO_MANY_REQUESTS),
    INVALID_IP("SEC_002", "Invalid IP address", HttpStatus.FORBIDDEN),
    SUSPICIOUS_ACTIVITY("SEC_003", "Suspicious activity detected", HttpStatus.FORBIDDEN),

    // Server errors
    INTERNAL_ERROR("SRV_001", "An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE("SRV_002", "Service temporarily unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    DATABASE_ERROR("SRV_003", "Database error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_SERVICE_ERROR("SRV_004", "Failed to send email", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
} 