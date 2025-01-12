package com.backend.volunteering.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "verification_tokens")
public class VerificationToken {
    @Id
    private String id;
    private String token;
    private String userId;
    private TokenType type;
    private Instant expiryDate;
    private boolean used;

    public enum TokenType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }

    public boolean isExpired() {
        return expiryDate.isBefore(Instant.now());
    }
} 