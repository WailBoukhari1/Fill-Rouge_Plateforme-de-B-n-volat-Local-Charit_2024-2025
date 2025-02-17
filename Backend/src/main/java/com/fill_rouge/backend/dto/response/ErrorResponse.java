package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private String errorCode;
    private List<ValidationError> validationErrors;
    private String traceId;
    private Object additionalData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationError {
        private String field;
        private String message;
        private String code;
        private Object rejectedValue;
    }

    // Static factory methods for common error scenarios
    public static ErrorResponse of(HttpStatus status, String message) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .build();
    }

    public static ErrorResponse of(HttpStatus status, String message, String path) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();
    }

    public static ErrorResponse of(HttpStatus status, String message, String errorCode, String path) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .errorCode(errorCode)
                .path(path)
                .build();
    }

    public static ErrorResponse validationError(String message, List<ValidationError> validationErrors) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .validationErrors(validationErrors)
                .build();
    }

    // Builder methods for adding additional information
    public ErrorResponse withTraceId(String traceId) {
        this.traceId = traceId;
        return this;
    }

    public ErrorResponse withAdditionalData(Object data) {
        this.additionalData = data;
        return this;
    }

    public ErrorResponse addValidationError(String field, String message) {
        if (validationErrors == null) {
            validationErrors = new ArrayList<>();
        }
        validationErrors.add(ValidationError.builder()
                .field(field)
                .message(message)
                .build());
        return this;
    }

    public ErrorResponse addValidationError(String field, String message, String code, Object rejectedValue) {
        if (validationErrors == null) {
            validationErrors = new ArrayList<>();
        }
        validationErrors.add(ValidationError.builder()
                .field(field)
                .message(message)
                .code(code)
                .rejectedValue(rejectedValue)
                .build());
        return this;
    }
} 