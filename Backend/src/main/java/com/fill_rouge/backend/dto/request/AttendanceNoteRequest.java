package com.fill_rouge.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceNoteRequest {
    @NotBlank(message = "Event ID is required")
    private String eventId;

    @NotBlank(message = "Volunteer ID is required")
    private String volunteerId;

    @Size(max = 500, message = "Note cannot exceed 500 characters")
    private String note;

    private boolean isPrivate = false;
} 