package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.domain.EventWaitlist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WaitlistResponse {
    private String id;
    private String eventId;
    private String volunteerId;
    private String volunteerName;
    private String eventTitle;
    private LocalDateTime joinedAt;
    private int position;
    private boolean notified;
    private LocalDateTime notifiedAt;
    private boolean expired;
    private LocalDateTime expiresAt;
    private String status;

    public static WaitlistResponse fromWaitlist(EventWaitlist waitlist) {
        if (waitlist == null) {
            return null;
        }

        return WaitlistResponse.builder()
                .id(waitlist.getId())
                .eventId(waitlist.getEventId())
                .volunteerId(waitlist.getVolunteerId())
                .joinedAt(waitlist.getJoinedAt())
                .position(waitlist.getPosition())
                .notified(waitlist.isNotified())
                .notifiedAt(waitlist.getNotifiedAt())
                .expired(waitlist.isExpired())
                .expiresAt(waitlist.getExpiresAt())
                .status(waitlist.getStatus())
                .build();
    }

    public static WaitlistResponse fromWaitlistWithDetails(
            EventWaitlist waitlist,
            String volunteerName,
            String eventTitle) {
        if (waitlist == null) {
            return null;
        }

        return WaitlistResponse.builder()
                .id(waitlist.getId())
                .eventId(waitlist.getEventId())
                .volunteerId(waitlist.getVolunteerId())
                .volunteerName(volunteerName)
                .eventTitle(eventTitle)
                .joinedAt(waitlist.getJoinedAt())
                .position(waitlist.getPosition())
                .notified(waitlist.isNotified())
                .notifiedAt(waitlist.getNotifiedAt())
                .expired(waitlist.isExpired())
                .expiresAt(waitlist.getExpiresAt())
                .status(waitlist.getStatus())
                .build();
    }
} 