package com.fill_rouge.backend.dto.request;

import com.fill_rouge.backend.constant.ValidationConstants;
import com.fill_rouge.backend.domain.SocialMediaLinks;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Organization creation/update request")
public class OrganizationRequest {
    @Schema(description = "Organization name", example = "Global Help Initiative")
    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Schema(description = "Organization description", example = "A non-profit organization dedicated to helping communities")
    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters")
    private String description;

    @Schema(description = "Mission statement", example = "To create positive change through community engagement")
    @NotBlank(message = "Mission statement is required")
    @Size(min = 20, max = 1000, message = "Mission must be between 20 and 1000 characters")
    private String mission;

    @Schema(description = "Vision statement", example = "A world where every community thrives")
    @Size(max = 1000, message = "Vision cannot exceed 1000 characters")
    private String vision;

    @Schema(description = "Logo URL", example = "https://example.com/logo.png")
    private String logo;

    @Schema(description = "Website URL", example = "https://www.example.org")
    @Pattern(regexp = "^(https?:\\/\\/)?([\\w\\-])+\\.{1}([a-zA-Z]{2,63})([\\/\\w-]*)*\\/?$", 
            message = "Invalid website URL format")
    private String website;

    @Schema(description = "Phone number", example = "+1234567890")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;

    @Schema(description = "Street address", example = "123 Main St")
    @NotBlank(message = "Address is required")
    private String address;

    @Schema(description = "City", example = "New York")
    @NotBlank(message = "City is required")
    private String city;

    @Schema(description = "Country", example = "United States")
    @NotBlank(message = "Country is required")
    private String country;

    @Schema(description = "Province/State", example = "New York")
    private String province;

    @Schema(description = "Postal code", example = "10001")
    private String postalCode;

    @Schema(description = "Geographic coordinates [longitude, latitude]", example = "[74.006, 40.7128]")
    @Size(min = 2, max = 2, message = "Coordinates must contain exactly 2 values [longitude, latitude]")
    private double[] coordinates;

    @Schema(description = "Focus areas", example = "[\"Education\", \"Environment\"]")
    @NotEmpty(message = "At least one focus area is required")
    private Set<String> focusAreas;

    @Schema(description = "Social media links")
    private SocialMediaLinks socialMediaLinks;

    @Schema(description = "Registration number", example = "REG123456")
    @Pattern(regexp = "^[A-Z0-9-]{5,20}$", message = "Invalid registration number format")
    private String registrationNumber;

    @Schema(description = "Document URLs")
    private List<String> documents;

    @Schema(description = "Organization type", example = "Non-Profit")
    private String type;

    @Schema(description = "Organization category", example = "Charity")
    private String category;

    @Schema(description = "Organization size", example = "Medium")
    private String size;

    @Schema(description = "Year founded", example = "2020")
    private Integer foundedYear;

    @Schema(description = "Profile picture URL", example = "https://example.com/profile.jpg")
    private String profilePicture;

    @Schema(description = "Whether the organization is accepting volunteers")
    private boolean acceptingVolunteers;

    @AssertTrue(message = "Registration number is required for verified organizations")
    private boolean isValidRegistration() {
        return registrationNumber != null && !registrationNumber.trim().isEmpty();
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
