package com.fill_rouge.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomReportRequest {
    @NotEmpty
    private List<String> metrics;
    private List<String> dimensions;
    private Map<String, Object> filters;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String format;
    private Map<String, Object> additionalParameters;
} 