package com.fill_rouge.backend.constant.error;

/**
 * Enumeration of authentication error codes and messages.
 * Format: AUTH_XXX where XXX is a three-digit number
 * Ranges:
 * - 001-003: Registration errors
 * - 004-008: Login errors
 * - 009-011: Token errors
 * - 012-014: Email verification errors
 * - 015-017: Password reset errors
 * - 018-020: General errors
 */
public enum AuthErrorCode implements ErrorCode {
    // Registration errors
    EMAIL_ALREADY_EXISTS("AUTH_001", "Email already exists"),
    INVALID_PASSWORD_FORMAT("AUTH_002", "Invalid password format"),
    REGISTRATION_FAILED("AUTH_003", "Registration failed"),

    // Login errors
    INVALID_CREDENTIALS("AUTH_004", "Invalid credentials"),
    ACCOUNT_DISABLED("AUTH_005", "Account is disabled"),
    ACCOUNT_LOCKED("AUTH_006", "Account is locked"),
    EMAIL_NOT_VERIFIED("AUTH_007", "Email not verified"),
    MAX_LOGIN_ATTEMPTS("AUTH_008", "Maximum login attempts exceeded"),

    // Token errors
    TOKEN_EXPIRED("AUTH_009", "Token has expired"),
    INVALID_TOKEN("AUTH_010", "Invalid token"),
    REFRESH_TOKEN_EXPIRED("AUTH_011", "Refresh token has expired"),

    // Email verification errors
    INVALID_VERIFICATION_CODE("AUTH_012", "Invalid verification code"),
    VERIFICATION_CODE_EXPIRED("AUTH_013", "Verification code has expired"),
    EMAIL_ALREADY_VERIFIED("AUTH_014", "Email already verified"),

    // Password reset errors
    PASSWORD_RESET_FAILED("AUTH_015", "Password reset failed"),
    PASSWORD_PREVIOUSLY_USED("AUTH_016", "Password has been used before"),
    INVALID_RESET_TOKEN("AUTH_017", "Invalid reset token"),

    // General errors
    USER_NOT_FOUND("AUTH_018", "User not found"),
    UNAUTHORIZED("AUTH_019", "Unauthorized access"),
    INTERNAL_ERROR("AUTH_020", "Internal server error");

    private final String code;
    private final String message;

    AuthErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
} 
