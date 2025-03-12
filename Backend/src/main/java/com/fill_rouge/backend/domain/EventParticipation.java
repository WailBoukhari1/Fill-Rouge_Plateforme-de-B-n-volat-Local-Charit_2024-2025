package com.fill_rouge.backend.domain;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import com.fill_rouge.backend.constant.EventParticipationStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "event_participations")
public class EventParticipation {
    @Id
    private String id;
    private EventParticipationStatus status;
    private LocalDateTime registrationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @DBRef
    private Event event;

    @DBRef
    private VolunteerProfile volunteer;

    public boolean isAttended() {
        return status == EventParticipationStatus.ATTENDED;
    }
} 