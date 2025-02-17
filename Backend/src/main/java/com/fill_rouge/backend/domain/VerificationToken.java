package com.fill_rouge.backend.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@Document(collection = "verification_tokens")
public class VerificationToken {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed(unique = true)
    private String token;
    
    private TokenType type;
    
    @Indexed(expireAfterSeconds = 86400) // 24 hours
    private LocalDateTime expiresAt;
    
    private LocalDateTime createdAt;
    private boolean used;
    
    public enum TokenType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET,
        TWO_FACTOR_SETUP
    }
    
    public VerificationToken() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(24);
        this.used = false;
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isValid() {
        return !isExpired() && !used;
    }
}
