package com.fill_rouge.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    private final String resourceType;
    private final String resourceId;
    private final String errorCode;
    private final LocalDateTime timestamp;

    public ResourceNotFoundException(String resourceType, String resourceId) {
        super(String.format("%s with id '%s' not found", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.errorCode = "RESOURCE_NOT_FOUND";
        this.timestamp = LocalDateTime.now();
    }

    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceType = "Resource";
        this.resourceId = "unknown";
        this.errorCode = "RESOURCE_NOT_FOUND";
        this.timestamp = LocalDateTime.now();
    }
}
