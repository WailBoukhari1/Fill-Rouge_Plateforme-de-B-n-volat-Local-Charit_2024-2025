package com.fill_rouge.backend.exception;

import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class CustomException extends RuntimeException {
    private final String errorCode;
    private final LocalDateTime timestamp;
    private final Object[] args;

    public CustomException(String message) {
        this(message, "INTERNAL_ERROR");
    }

    public CustomException(String message, String errorCode) {
        this(message, errorCode, null);
    }

    public CustomException(String message, String errorCode, Object[] args) {
        super(message);
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
        this.args = args;
    }
}
