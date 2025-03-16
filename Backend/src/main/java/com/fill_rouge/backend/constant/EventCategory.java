package com.fill_rouge.backend.constant;

public enum EventCategory {
    EDUCATION,
    HEALTH,
    ENVIRONMENT,
    SOCIAL_SERVICES,
    ARTS_AND_CULTURE,
    SPORTS_AND_RECREATION,
    ANIMAL_WELFARE,
    DISASTER_RELIEF,
    COMMUNITY_DEVELOPMENT,
    OTHER;
    
    @Override
    public String toString() {
        return name().toLowerCase().replace('_', ' ');
    }
} 