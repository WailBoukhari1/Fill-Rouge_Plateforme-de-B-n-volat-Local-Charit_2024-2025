package com.fill_rouge.backend.constant.error;

/**
 * Base interface for all error codes in the application.
 * All error code enums should implement this interface.
 */
public interface ErrorCode {
    String getCode();
    String getMessage();
} 