package com.youcode.volunteering.model;

import com.youcode.volunteering.model.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@Document(collection = "organizations")
public class Organization extends BaseEntity {
    private String name;
    private String type;
    private String status;
    private Profile profile;
    private Location location;
    private List<Contact> contacts;
    private Metrics metrics;
    private Verification verification;
    private Settings settings;

    @Data
    public static class Profile {
        private String logo;
        private String description;
        private String mission;
        private String website;
        private Map<String, String> socialLinks;
    }

    @Data
    public static class Contact {
        private String name;
        private String role;
        private String email;
        private String phone;
    }

    @Data
    public static class Metrics {
        private Integer totalVolunteers;
        private Integer totalHours;
        private Double impactScore;
    }

    @Data
    public static class Verification {
        private String status;
        private List<String> documents;
        private LocalDateTime verifiedAt;
    }
} 