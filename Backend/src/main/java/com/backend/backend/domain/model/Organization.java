package com.backend.backend.domain.model;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@Document(collection = "organizations")
public class Organization {
    @Id
    private String id;

    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Indexed(unique = true)
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    @Pattern(regexp = "^(https?://.*\\.(png|jpg|jpeg|gif))$", message = "Invalid logo URL format")
    private String logo;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    @Indexed(unique = true)
    private String contactEmail;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String contactPhone;

    private boolean verified;

    @NotBlank(message = "User ID is required")
    @Indexed(unique = true)
    private String userId;
} 