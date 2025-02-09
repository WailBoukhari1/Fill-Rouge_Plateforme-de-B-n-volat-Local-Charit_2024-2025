package com.backend.backend.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "events")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    private String id;

    private String title;

    private String description;

    private LocalDateTime dateTime;

    private String location;

    private Double latitude;

    private Double longitude;

    private List<String> requiredSkills;

    private Integer volunteersNeeded;

    @Builder.Default
    private Integer registeredVolunteers = 0;

    @Builder.Default
    private EventStatus status = EventStatus.UPCOMING;

    private String organizationId;

    private String organizationName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 