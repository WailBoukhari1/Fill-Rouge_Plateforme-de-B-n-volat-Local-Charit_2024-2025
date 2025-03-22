package com.fill_rouge.backend.constant;

public enum EventStatus {
    PENDING,    // Waiting for admin approval
    ACTIVE,     // Approved and open for registration
    FULL,       // Maximum participants reached
    ONGOING,    // Event is currently happening
    COMPLETED,  // Event has ended
    CANCELLED,  // Event has been cancelled
    SCHEDULED,  // Event is scheduled but not yet active
    REJECTED    // Event was rejected by admin
} 