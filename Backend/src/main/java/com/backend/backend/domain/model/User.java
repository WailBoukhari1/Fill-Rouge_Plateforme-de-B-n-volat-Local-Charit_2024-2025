package com.backend.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String password;
    private UserRole role;
    private String verificationCode;
    private LocalDateTime verificationCodeExpiryDate;
    private String resetPasswordCode;
    private LocalDateTime resetPasswordCodeExpiryDate;
    private boolean emailVerified = false;
} 