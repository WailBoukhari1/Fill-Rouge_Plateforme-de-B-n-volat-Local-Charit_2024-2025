package com.backend.volunteering.exception;

public class TokenException extends BaseException {
    public TokenException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
} 