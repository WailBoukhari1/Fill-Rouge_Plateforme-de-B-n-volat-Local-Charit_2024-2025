package com.fill_rouge.backend.domain;

import com.fill_rouge.backend.constant.EventParticipationStatus;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Data
@Document(collection = "event_participations")
public class EventParticipation {
    @Id
    private String id;
    private String volunteerId;
    private String organizationId;
    @DBRef
    private Event event;
    private EventParticipationStatus status;
    private Integer hours;
    private Double rating;
    private String feedback;
    private LocalDateTime registeredDate;
    private LocalDateTime completedDate;
    private LocalDateTime updatedAt;
} 