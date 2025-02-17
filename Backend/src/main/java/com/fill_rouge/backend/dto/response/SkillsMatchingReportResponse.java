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
public class SkillsMatchingReportResponse {
    private String id;
    private LocalDateTime generatedAt;
    private Map<String, Integer> skillDemand;
    private Map<String, Integer> skillSupply;
    private List<String> highDemandSkills;
    private List<String> emergingSkills;
    private Map<String, Double> matchingMetrics;
    private Map<String, List<String>> skillGaps;
    private Map<String, List<Map<String, Object>>> recommendations;
    private Map<String, Object> additionalMetrics;
} 