package com.fill_rouge.backend.constant;

public enum OrganizationStatus {
    INCOMPLETE, // Organization has not completed their profile or requirements
    PENDING,    // Organization role status pending admin approval
    APPROVED,   // Organization approved, can create events
    REJECTED,   // Organization rejected
    BANNED      // Organization banned from creating events
} 