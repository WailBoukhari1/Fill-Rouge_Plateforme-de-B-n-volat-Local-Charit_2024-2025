package com.backend.volunteering.exception;

public class ResourceNotFoundException extends BaseException {
    public ResourceNotFoundException(String resource, String field, String value) {
        super(ErrorCode.RESOURCE_NOT_FOUND, 
              String.format("%s not found with %s: %s", resource, field, value));
    }
} 