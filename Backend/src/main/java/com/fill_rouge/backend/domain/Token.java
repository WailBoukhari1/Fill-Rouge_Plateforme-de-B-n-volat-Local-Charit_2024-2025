package com.fill_rouge.backend.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "tokens")
public class Token {
    @Id
    private String id;
    private String token;
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean revoked;
    private String tokenType;
} 