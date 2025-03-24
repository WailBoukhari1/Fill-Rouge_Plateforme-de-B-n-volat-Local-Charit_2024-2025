package com.fill_rouge.backend.constant;

public enum EventStatus {
    // DRAFT,      // Event is in draft state, not yet submitted for approval
    PENDING,    // Waiting for admin approval
    ACTIVE,     // Approved and open for registration
    FULL,       // Maximum participants reached
    ONGOING,    // Event is currently happening
    COMPLETED,  // Event has ended
    CANCELLED,  // Event has been cancelled
    REJECTED    // Event was rejected by admin
} 