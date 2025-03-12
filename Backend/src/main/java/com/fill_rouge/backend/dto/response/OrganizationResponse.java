package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.domain.SocialMediaLinks;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Organization profile response")
public class OrganizationResponse {
    @Schema(description = "Organization unique identifier", example = "org123")
    private String id;
    
    @Schema(description = "Associated user ID", example = "user456")
    private String userId;
    
    @Schema(description = "Organization name", example = "Global Help Initiative")
    private String name;
    
    @Schema(description = "Organization description", example = "A non-profit organization dedicated to helping communities")
    private String description;
    
    @Schema(description = "Organization mission statement", example = "To create positive change through community engagement")
    private String mission;
    
    @Schema(description = "Organization vision statement", example = "A world where every community thrives")
    private String vision;
    
    @Schema(description = "Organization logo URL", example = "https://example.com/logo.png")
    private String logo;
    
    @Schema(description = "Organization website", example = "https://www.globalhelp.org")
    private String website;
    
    @Schema(description = "Contact phone number", example = "+1234567890")
    private String phoneNumber;
    
    @Schema(description = "Physical address", example = "123 Main Street")
    private String address;
    
    @Schema(description = "City location", example = "New York")
    private String city;
    
    @Schema(description = "Country location", example = "United States")
    private String country;
    
    @Schema(description = "Geographic coordinates [latitude, longitude]", example = "[40.7128, -74.0060]")
    private double[] coordinates;
    
    @Schema(description = "Areas of focus", example = "[\"Education\", \"Healthcare\", \"Environment\"]")
    @Builder.Default
    private Set<String> focusAreas = new HashSet<>();
    
    @Schema(description = "Social media presence", example = "[\"https://twitter.com/globalhelp\", \"https://facebook.com/globalhelp\"]")
    @Builder.Default
    private List<String> socialMediaLinks = new ArrayList<>();
    
    @Schema(description = "Verification status")
    @Builder.Default
    private boolean verified = false;
    
    @Schema(description = "Date of verification", example = "2024-03-15T10:30:00")
    private LocalDateTime verificationDate;
    
    @Schema(description = "Official registration number", example = "REG123456")
    private String registrationNumber;
    
    @Schema(description = "Tax identification number", example = "TAX987654")
    private String taxId;
    
    @Schema(description = "Uploaded document URLs")
    @Builder.Default
    private List<String> documents = new ArrayList<>();
    
    @Schema(description = "Average rating (0-5)", example = "4.5")
    @Builder.Default
    private double rating = 0.0;
    
    @Schema(description = "Total number of ratings received", example = "150")
    @Builder.Default
    private int numberOfRatings = 0;
    
    @Schema(description = "Total events organized", example = "25")
    @Builder.Default
    private int totalEventsHosted = 0;
    
    @Schema(description = "Current active volunteers", example = "50")
    @Builder.Default
    private int activeVolunteers = 0;
    
    @Schema(description = "Total volunteer hours contributed", example = "1200")
    @Builder.Default
    private int totalVolunteerHours = 0;
    
    @Schema(description = "Organization impact score", example = "85.5")
    @Builder.Default
    private double impactScore = 0.0;
    
    @Schema(description = "Currently accepting volunteers")
    @Builder.Default
    private boolean acceptingVolunteers = true;
    
    @Schema(description = "Profile creation date", example = "2024-01-01T00:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update date", example = "2024-03-15T15:45:00")
    private LocalDateTime updatedAt;

    public static OrganizationResponse fromOrganization(Organization organization) {
        if (organization == null) {
            return null;
        }

        List<String> socialLinks = new ArrayList<>();
        if (organization.getSocialMediaLinks() != null) {
            SocialMediaLinks links = organization.getSocialMediaLinks();
            if (links.getFacebook() != null) socialLinks.add(links.getFacebook());
            if (links.getTwitter() != null) socialLinks.add(links.getTwitter());
            if (links.getInstagram() != null) socialLinks.add(links.getInstagram());
            if (links.getLinkedin() != null) socialLinks.add(links.getLinkedin());
            if (links.getWebsite() != null) socialLinks.add(links.getWebsite());
        }

        return OrganizationResponse.builder()
                .id(organization.getId())
                .userId(organization.getUser().getId())
                .name(organization.getName())
                .description(organization.getDescription())
                .mission(organization.getMission())
                .vision(organization.getVision())
                .logo(organization.getLogo())
                .website(organization.getWebsite())
                .phoneNumber(organization.getPhoneNumber())
                .address(organization.getAddress())
                .city(organization.getCity())
                .country(organization.getCountry())
                .coordinates(organization.getCoordinates())
                .focusAreas(organization.getFocusAreas())
                .socialMediaLinks(socialLinks)
                .verified(organization.isVerified())
                .verificationDate(organization.getVerificationDate())
                .registrationNumber(organization.getRegistrationNumber())
                .taxId(organization.getTaxId())
                .documents(organization.getDocuments())
                .rating(organization.getRating())
                .numberOfRatings(organization.getNumberOfRatings())
                .totalEventsHosted(organization.getTotalEventsHosted())
                .activeVolunteers(organization.getActiveVolunteers())
                .totalVolunteerHours(organization.getTotalVolunteerHours())
                .impactScore(organization.getImpactScore())
                .acceptingVolunteers(organization.isAcceptingVolunteers())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .build();
    }
}
