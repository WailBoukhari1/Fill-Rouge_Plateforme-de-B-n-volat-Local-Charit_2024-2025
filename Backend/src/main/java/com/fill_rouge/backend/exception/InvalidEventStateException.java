package com.fill_rouge.backend.exception;

public class InvalidEventStateException extends RuntimeException {
    public InvalidEventStateException(String message) {
        super(message);
    }
} 