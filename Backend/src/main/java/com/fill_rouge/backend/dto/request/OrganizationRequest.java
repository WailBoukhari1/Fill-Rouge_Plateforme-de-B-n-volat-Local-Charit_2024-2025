package com.fill_rouge.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;
import com.fill_rouge.backend.constant.ValidationConstants;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Organization creation/update request")
public class OrganizationRequest {
    @Schema(description = "Organization name", example = "Global Help Initiative")
    @NotBlank(message = "Name is required")
    @Size(min = ValidationConstants.MIN_NAME_LENGTH, max = ValidationConstants.MAX_NAME_LENGTH, 
          message = "Name must be between {min} and {max} characters")
    private String name;

    @Schema(description = "Organization description", example = "A non-profit organization dedicated to helping communities")
    @NotBlank(message = "Description is required")
    @Size(min = ValidationConstants.MIN_DESCRIPTION_LENGTH, max = ValidationConstants.MAX_DESCRIPTION_LENGTH, 
          message = "Description must be between {min} and {max} characters")
    private String description;

    @Schema(description = "Mission statement", example = "To create positive change through community engagement")
    @NotBlank(message = "Mission statement is required")
    @Size(min = ValidationConstants.MIN_MISSION_LENGTH, max = ValidationConstants.MAX_MISSION_LENGTH, 
          message = "Mission must be between {min} and {max} characters")
    private String mission;

    @Schema(description = "Vision statement", example = "A world where every community thrives")
    @Size(max = ValidationConstants.MAX_VISION_LENGTH, message = "Vision cannot exceed {max} characters")
    private String vision;

    @Schema(description = "Logo URL", example = "https://example.com/logo.png")
    private String logo;

    @Schema(description = "Website URL", example = "https://www.globalhelp.org")
    @Pattern(regexp = ValidationConstants.URL_REGEX, message = "Invalid website URL format")
    private String website;

    @Schema(description = "Contact phone number", example = "+1234567890")
    @Pattern(regexp = ValidationConstants.PHONE_REGEX, message = "Invalid phone number format")
    private String phoneNumber;

    @Schema(description = "Physical address", example = "123 Main Street")
    @NotBlank(message = "Address is required")
    private String address;

    @Schema(description = "City location", example = "New York")
    @NotBlank(message = "City is required")
    private String city;

    @Schema(description = "Country location", example = "United States")
    @NotBlank(message = "Country is required")
    private String country;

    @Schema(description = "Geographic coordinates [latitude, longitude]", example = "[40.7128, -74.0060]")
    @Size(min = 2, max = 2, message = "Coordinates must contain exactly 2 values [latitude, longitude]")
    private double[] coordinates;

    @Schema(description = "Areas of focus", example = "[\"Education\", \"Healthcare\", \"Environment\"]")
    @NotEmpty(message = "At least one focus area is required")
    @Size(max = ValidationConstants.MAX_FOCUS_AREAS, message = "Cannot exceed {max} focus areas")
    @Builder.Default
    private Set<@NotBlank(message = "Focus area cannot be blank") String> focusAreas = new HashSet<>();

    @Schema(description = "Social media links", example = "[\"https://twitter.com/globalhelp\"]")
    @Size(max = ValidationConstants.MAX_SOCIAL_MEDIA_LINKS, message = "Cannot exceed {max} social media links")
    @Builder.Default
    private List<@Pattern(regexp = ValidationConstants.URL_REGEX, message = "Invalid social media URL format") String> 
        socialMediaLinks = new ArrayList<>();

    @Schema(description = "Registration number", example = "REG123456")
    @Pattern(regexp = ValidationConstants.REGISTRATION_REGEX, message = "Invalid registration number format")
    private String registrationNumber;

    @Schema(description = "Tax ID", example = "TAX987654")
    @Pattern(regexp = ValidationConstants.REGISTRATION_REGEX, message = "Invalid tax ID format")
    private String taxId;

    @Schema(description = "Document URLs")
    @Size(max = ValidationConstants.MAX_DOCUMENTS, message = "Cannot exceed {max} documents")
    @Builder.Default
    private List<@Pattern(regexp = ValidationConstants.URL_REGEX, message = "Invalid document URL format") String> 
        documents = new ArrayList<>();

    @Schema(description = "Whether organization is accepting volunteers")
    @Builder.Default
    private boolean acceptingVolunteers = true;

    @AssertTrue(message = "Registration number is required for verified organizations")
    private boolean isValidRegistration() {
        if (taxId != null && !taxId.trim().isEmpty()) {
            return registrationNumber != null && !registrationNumber.trim().isEmpty();
        }
        return true;
    }

    @AssertTrue(message = "Coordinates must be valid latitude and longitude")
    private boolean isValidCoordinates() {
        if (coordinates == null || coordinates.length != 2) return false;
        return coordinates[0] >= ValidationConstants.MIN_LATITUDE && 
               coordinates[0] <= ValidationConstants.MAX_LATITUDE && 
               coordinates[1] >= ValidationConstants.MIN_LONGITUDE && 
               coordinates[1] <= ValidationConstants.MAX_LONGITUDE;
    }
}
