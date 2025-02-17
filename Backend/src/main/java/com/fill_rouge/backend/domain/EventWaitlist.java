package com.fill_rouge.backend.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "event_waitlists")
public class EventWaitlist {
    @Id
    private String id;
    private String eventId;
    private String volunteerId;
    private LocalDateTime joinedAt;
    private int position;
    private boolean notified;
    private LocalDateTime notifiedAt;
    private boolean expired;
    private LocalDateTime expiresAt;
    private String status; // WAITING, NOTIFIED, EXPIRED, JOINED, LEFT
} 