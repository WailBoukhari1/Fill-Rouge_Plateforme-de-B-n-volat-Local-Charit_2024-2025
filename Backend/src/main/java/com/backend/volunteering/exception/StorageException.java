package com.backend.volunteering.exception;

public class StorageException extends BaseException {
    public StorageException(String message, Throwable cause) {
        super(ErrorCode.INTERNAL_ERROR, message);
    }
} 