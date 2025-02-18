package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private int rating;
    
    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String comment;
    
    @CreatedDate
    @Field("submitted_at")
    private LocalDateTime submittedAt;
} 