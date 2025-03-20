package com.fill_rouge.backend.exception;

public class WaitlistDisabledException extends RuntimeException {
    public WaitlistDisabledException(String message) {
        super(message);
    }
} 