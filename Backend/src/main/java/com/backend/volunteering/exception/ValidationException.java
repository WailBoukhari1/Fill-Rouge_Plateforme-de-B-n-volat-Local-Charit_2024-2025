package com.backend.volunteering.exception;

public class ValidationException extends BaseException {
    public ValidationException(ErrorCode errorCode, String message, String field) {
        super(errorCode, message, field);
    }
} 