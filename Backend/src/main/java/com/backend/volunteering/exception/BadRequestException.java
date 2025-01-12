package com.backend.volunteering.exception;

public class BadRequestException extends BaseException {
    public BadRequestException(String message) {
        super(ErrorCode.INVALID_INPUT, message);
    }
} 