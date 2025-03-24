package com.fill_rouge.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationRequest {
    
    private String specialRequirements;
    
    private String notes;
    
    @NotNull(message = "Terms and conditions must be accepted")
    private boolean termsAccepted;
    
    private String eventId;
    
    // Optional userId for authenticated users
    private String userId;
    
} 