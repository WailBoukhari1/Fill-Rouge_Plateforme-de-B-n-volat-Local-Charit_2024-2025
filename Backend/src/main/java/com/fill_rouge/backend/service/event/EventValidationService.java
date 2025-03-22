package com.fill_rouge.backend.service.event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EventValidationService {
    
    private static final int MAX_TITLE_LENGTH = 100;
    private static final int MAX_DESCRIPTION_LENGTH = 2000;
    private static final Pattern LOCATION_PATTERN = Pattern.compile("^[a-zA-Z0-9\\s,.-]{5,200}$");

    public String sanitizeTitle(String title) {
        if (title == null) {
            throw new IllegalArgumentException("Event title cannot be null");
        }
        // Clean and trim the title
        String cleanTitle = Jsoup.clean(title, Safelist.none());
        cleanTitle = StringUtils.trimWhitespace(cleanTitle);
        
        if (cleanTitle.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException("Event title exceeds maximum length");
        }
        if (cleanTitle.isEmpty()) {
            throw new IllegalArgumentException("Event title cannot be empty");
        }
        return cleanTitle;
    }

    public String sanitizeDescription(String description) {
        if (description == null) {
            throw new IllegalArgumentException("Event description cannot be null");
        }
        // Allow basic HTML formatting but prevent XSS
        String cleanDescription = Jsoup.clean(description, Safelist.basic());
        
        if (cleanDescription.length() > MAX_DESCRIPTION_LENGTH) {
            throw new IllegalArgumentException("Event description exceeds maximum length");
        }
        return cleanDescription;
    }

    public void validateEventDates(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime now = LocalDateTime.now();
        
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Event dates cannot be null");
        }
        if (startDate.isBefore(now)) {
            throw new IllegalArgumentException("Event start date cannot be in the past");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Event end date must be after start date");
        }
        if (startDate.isEqual(endDate)) {
            throw new IllegalArgumentException("Event start and end dates cannot be the same");
        }
    }

    public void validateParticipantLimits(int maxParticipants) {
        if (maxParticipants < 1) {
            throw new IllegalArgumentException("Maximum participants must be at least 1");
        }
        if (maxParticipants > 1000) { // Reasonable upper limit for most volunteer events
            throw new IllegalArgumentException("Maximum participants exceeds platform limit");
        }
    }

    public String validateLocation(String location) {
        if (location == null) {
            throw new IllegalArgumentException("Event location cannot be null");
        }
        
        String cleanLocation = Jsoup.clean(location, Safelist.none());
        cleanLocation = StringUtils.trimWhitespace(cleanLocation);
        
        if (!LOCATION_PATTERN.matcher(cleanLocation).matches()) {
            throw new IllegalArgumentException("Invalid location format");
        }
        return cleanLocation;
    }

    public void validateRequiredSkills(List<String> skills) {
        if (skills == null) {
            throw new IllegalArgumentException("Skills list cannot be null");
        }
        if (skills.size() > 10) { // Reasonable limit for required skills
            throw new IllegalArgumentException("Too many required skills specified");
        }
        for (String skill : skills) {
            if (skill == null || skill.trim().isEmpty()) {
                throw new IllegalArgumentException("Invalid skill specified");
            }
            if (skill.length() > 50) { // Reasonable length for skill names
                throw new IllegalArgumentException("Skill name too long: " + skill);
            }
        }
    }

    public void validatePointsOffered(int points) {
        if (points < 0) {
            throw new IllegalArgumentException("Points offered cannot be negative");
        }
        if (points > 100) { // Reasonable upper limit for points per event
            throw new IllegalArgumentException("Points offered exceeds maximum allowed");
        }
    }
} 