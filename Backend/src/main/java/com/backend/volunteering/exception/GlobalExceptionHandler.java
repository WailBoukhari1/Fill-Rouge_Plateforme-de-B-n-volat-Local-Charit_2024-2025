package com.backend.volunteering.exception;

import com.backend.volunteering.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ApiResponse<?>> handleBaseException(BaseException ex) {
        log.error("Base exception occurred: {}", ex.getMessage());
        ApiResponse.ErrorDetails errorDetails = new ApiResponse.ErrorDetails(
            ex.getErrorCode().getCode(),
            ex.getMessage()
        );
        if (ex.getField() != null) {
            errorDetails.setField(ex.getField());
        }
        return ResponseEntity
            .status(ex.getErrorCode().getStatus())
            .body(ApiResponse.error(ex.getErrorCode().getMessage(), errorDetails));
    }

    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<ApiResponse<?>> handleAuthenticationException(Exception ex) {
        log.error("Authentication exception: {}", ex.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_CREDENTIALS;
        ApiResponse.ErrorDetails errorDetails = new ApiResponse.ErrorDetails(
            errorCode.getCode(),
            "Invalid email or password"
        );
        return ResponseEntity
            .status(errorCode.getStatus())
            .body(ApiResponse.error(errorCode.getMessage(), errorDetails));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(AccessDeniedException ex) {
        log.error("Access denied: {}", ex.getMessage());
        ErrorCode errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
        ApiResponse.ErrorDetails errorDetails = new ApiResponse.ErrorDetails(
            errorCode.getCode(),
            "You don't have permission to perform this action"
        );
        return ResponseEntity
            .status(errorCode.getStatus())
            .body(ApiResponse.error(errorCode.getMessage(), errorDetails));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });

        log.error("Validation error: {}", validationErrors);
        ErrorCode errorCode = ErrorCode.INVALID_INPUT;
        ApiResponse.ErrorDetails errorDetails = new ApiResponse.ErrorDetails(
            errorCode.getCode(),
            validationErrors.toString()
        );
        
        return ResponseEntity
            .status(errorCode.getStatus())
            .body(ApiResponse.error("Validation failed", errorDetails));
    }

    @ExceptionHandler({
        ConstraintViolationException.class,
        MethodArgumentTypeMismatchException.class,
        MissingServletRequestParameterException.class
    })
    public ResponseEntity<ApiResponse<?>> handleValidationExceptions(Exception ex) {
        log.error("Validation error: {}", ex.getMessage());
        ErrorCode errorCode = ErrorCode.INVALID_INPUT;
        ApiResponse.ErrorDetails errorDetails = new ApiResponse.ErrorDetails(
            errorCode.getCode(),
            ex.getMessage()
        );
        return ResponseEntity
            .status(errorCode.getStatus())
            .body(ApiResponse.error("Invalid input provided", errorDetails));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Data integrity violation: {}", ex.getMessage());
        ErrorCode errorCode = ErrorCode.RESOURCE_CONFLICT;
        ApiResponse.ErrorDetails errorDetails = new ApiResponse.ErrorDetails(
            errorCode.getCode(),
            "Database constraint violation"
        );
        return ResponseEntity
            .status(errorCode.getStatus())
            .body(ApiResponse.error(errorCode.getMessage(), errorDetails));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGlobalException(Exception ex) {
        log.error("Unexpected error occurred: ", ex);
        ErrorCode errorCode = ErrorCode.INTERNAL_ERROR;
        ApiResponse.ErrorDetails errorDetails = new ApiResponse.ErrorDetails(
            errorCode.getCode(),
            "An unexpected error occurred. Please try again later."
        );
        return ResponseEntity
            .status(errorCode.getStatus())
            .body(ApiResponse.error(errorCode.getMessage(), errorDetails));
    }
} 