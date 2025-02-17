package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
public class TrendReportResponse {
    private String id;
    private String metric;
    private LocalDateTime timestamp;
    private double value;
    private double changeFromPrevious;
    private String trend; // INCREASING, DECREASING, STABLE
    private Map<String, Object> breakdownByCategory;
    private List<Map<String, Object>> contributingFactors;
    private Map<String, Object> additionalMetrics;
} 