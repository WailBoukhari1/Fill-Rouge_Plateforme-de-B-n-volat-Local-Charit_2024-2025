package com.fill_rouge.backend.domain;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "volunteers")
public class Volunteer {
    @Id
    private String id;
    
    @DBRef
    @NotNull(message = "User reference is required")
    private User user;
    
    private List<String> skills = new ArrayList<>();
    private List<String> interests = new ArrayList<>();
    
    @PositiveOrZero(message = "Total volunteer hours cannot be negative")
    private int totalVolunteerHours = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastActive;

    public Volunteer() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.lastActive = LocalDateTime.now();
        this.skills = new ArrayList<>();
        this.interests = new ArrayList<>();
    }

    public void addVolunteerHours(int hours) {
        if (hours < 0) {
            throw new IllegalArgumentException("Hours cannot be negative");
        }
        this.totalVolunteerHours += hours;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateLastActive() {
        this.lastActive = LocalDateTime.now();
    }
}
