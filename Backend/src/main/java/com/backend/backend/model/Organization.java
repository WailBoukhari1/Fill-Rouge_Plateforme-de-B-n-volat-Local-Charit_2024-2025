package com.backend.backend.model;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@Document(collection = "organizations")
public class Organization {
    @Id
    private String id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 1000)
    private String description;

    @NotBlank(message = "User ID is required")
    private String userId;

    private String website;
    private String logo;
    private String address;
    private String phone;
    private boolean verified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String mission;
    private String vision;
    private boolean active = true;
} 