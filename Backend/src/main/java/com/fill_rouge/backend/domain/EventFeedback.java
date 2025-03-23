package com.fill_rouge.backend.domain;

import java.time.LocalDateTime;
import java.util.List;

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
    
    // Add missing fields needed for DatabaseSeeder
    private List<String> skillsLearned;
    
    @Min(value = 1, message = "Impact rating must be between 1 and 5")
    @Max(value = 5, message = "Impact rating must be between 1 and 5")
    private int impactRating;
    
    @Min(value = 1, message = "Organization rating must be between 1 and 5")
    @Max(value = 5, message = "Organization rating must be between 1 and 5")
    private int organizationRating;
    
    private LocalDateTime submissionDate;
    
    private boolean anonymous;
    
    // Add missing setter methods
    public void setSkillsLearned(List<String> skillsLearned) {
        this.skillsLearned = skillsLearned;
    }
    
    public void setImpactRating(int impactRating) {
        this.impactRating = impactRating;
    }
    
    public void setOrganizationRating(int organizationRating) {
        this.organizationRating = organizationRating;
    }
    
    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
        this.submittedAt = submissionDate; // Keep both fields in sync
    }
    
    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }
} 