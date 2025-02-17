package com.fill_rouge.backend.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "event_feedback")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "event_volunteer_idx", def = "{'eventId': 1, 'volunteerId': 1}", unique = true)
public class EventFeedback {
    @Id
    private String id;
    
    @Field("event_id")
    private String eventId;
    
    @Field("volunteer_id")
    private String volunteerId;
    
    private double rating;
    
    private String comment;
    
    @Field("hours_contributed")
    private int hoursContributed;
    
    @Field("is_anonymous")
    @Builder.Default
    private boolean isAnonymous = false;
    
    @CreatedDate
    @Field("submitted_at")
    private LocalDateTime submittedAt;
} 