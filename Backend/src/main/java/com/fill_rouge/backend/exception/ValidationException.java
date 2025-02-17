package com.fill_rouge.backend.exception;

import lombok.Getter;
import java.util.Map;
import java.util.HashMap;

@Getter
public class ValidationException extends CustomException {
    private final Map<String, String> fieldErrors;

    public ValidationException(String message) {
        this(message, new HashMap<>());
    }

    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message, "VALIDATION_ERROR");
        this.fieldErrors = fieldErrors;
    }

    public void addFieldError(String field, String message) {
        this.fieldErrors.put(field, message);
    }

    public boolean hasFieldErrors() {
        return !fieldErrors.isEmpty();
    }
}
