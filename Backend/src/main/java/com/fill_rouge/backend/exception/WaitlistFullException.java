package com.fill_rouge.backend.exception;

public class WaitlistFullException extends RuntimeException {
    public WaitlistFullException(String message) {
        super(message);
    }
} 