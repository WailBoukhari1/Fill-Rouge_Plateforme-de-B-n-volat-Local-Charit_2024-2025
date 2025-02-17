package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private String errorCode;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    private String path;
    private int status;
    private String traceId;
    private Long totalElements;
    private Integer totalPages;
    private Integer currentPage;
    private Integer pageSize;
    private Meta meta;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Meta {
        private Integer page;
        private Integer size;
        private Long totalElements;
        private Integer totalPages;
    }

    // Success response builders
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .status(HttpStatus.OK.value())
                .message("Success")
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .status(HttpStatus.OK.value())
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, Meta meta) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .status(HttpStatus.OK.value())
                .message("Success")
                .meta(meta)
                .build();
    }

    // Error response builders
    public static <T> ApiResponse<T> error(String message, HttpStatus status) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .status(status.value())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errors(errors)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String errorCode, List<String> errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .errors(errors)
                .build();
    }

    // Pagination response builder
    public static <T> ApiResponse<T> paginated(T data, int currentPage, int pageSize, long totalElements, int totalPages) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .currentPage(currentPage)
                .pageSize(pageSize)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
    }

    // Add request path and status
    public ApiResponse<T> withPath(String path) {
        this.path = path;
        return this;
    }

    public ApiResponse<T> withStatus(int status) {
        this.status = status;
        return this;
    }

    public ApiResponse<T> withTraceId(String traceId) {
        this.traceId = traceId;
        return this;
    }
} 