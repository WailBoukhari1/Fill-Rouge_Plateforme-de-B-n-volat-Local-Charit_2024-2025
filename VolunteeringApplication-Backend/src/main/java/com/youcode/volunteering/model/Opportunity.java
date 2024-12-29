package com.youcode.volunteering.model;

import com.youcode.volunteering.model.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@Document(collection = "opportunities")
public class Opportunity extends BaseEntity {
    private String organizationId;
    private String title;
    private String type;
    private String status;
    private String description;
    private Requirements requirements;
    private Schedule schedule;
    private Location location;
    private Impact impact;
    private ApplicationStats applications;

    @Data
    public static class Requirements {
        private List<String> skills;
        private Integer minimumAge;
        private Boolean backgroundCheckRequired;
    }

    @Data
    public static class Schedule {
        private String type;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String recurringPattern;
        private List<Shift> shifts;
    }

    @Data
    public static class Shift {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer capacity;
    }

    @Data
    public static class Impact {
        private String category;
        private Map<String, Object> metrics;
        private List<String> sdgGoals;
    }

    @Data
    public static class ApplicationStats {
        private Integer total;
        private Integer approved;
        private Integer pending;
    }
} 