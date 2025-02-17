package com.fill_rouge.backend.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@Document(collection = "skills")
public class Skill {
    @Id
    private String id;

    @NotBlank(message = "Skill name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @Indexed(unique = true)
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @PositiveOrZero(message = "Popularity cannot be negative")
    private Integer popularity = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Skill() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.popularity = 0;
    }

    public void incrementPopularity() {
        this.popularity++;
        this.updatedAt = LocalDateTime.now();
    }
} 