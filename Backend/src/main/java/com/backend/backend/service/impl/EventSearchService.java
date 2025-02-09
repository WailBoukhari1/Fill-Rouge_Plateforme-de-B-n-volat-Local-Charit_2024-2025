package com.backend.backend.service.impl;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.GeocodingResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.backend.backend.domain.Event;
import com.backend.backend.repository.EventRepository;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EventSearchService {
    private final EventRepository eventRepository;
    private final GeoApiContext geoApiContext;

    public List<Event> searchEvents(String location, Double radius, Set<String> skills) {
        // Convert location string to coordinates using Google Maps API
        double[] coordinates = getCoordinates(location);
        return eventRepository.findByLocationAndSkills(coordinates[0], coordinates[1], radius * 1000, skills);
    }

    private double[] getCoordinates(String location) {
        try {
            GeocodingResult[] results = GeocodingApi.geocode(geoApiContext, location).await();
            if (results.length > 0) {
                return new double[] {
                    results[0].geometry.location.lng,
                    results[0].geometry.location.lat
                };
            }
            throw new RuntimeException("Location not found");
        } catch (Exception e) {
            throw new RuntimeException("Error geocoding location", e);
        }
    }
} 