package com.backend.backend.model;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.HashSet;
import java.util.Set;

@Data
@Document(collection = "volunteers")
public class Volunteer {
    @Id
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Indexed(unique = true)
    private String email;

    @Size(min = 10, max = 500, message = "Bio must be between 10 and 500 characters")
    private String bio;

    private Set<String> skills = new HashSet<>();

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;

    private String location;

    private boolean isAvailable = true;

    @NotNull(message = "User ID is required")
    @Indexed(unique = true)
    private String userId;

    private Set<String> interests = new HashSet<>();
    private String availability;
    private Set<String> completedEvents = new HashSet<>();
    private int hoursContributed;
} 