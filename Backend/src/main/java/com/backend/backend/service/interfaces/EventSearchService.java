package com.backend.backend.service.interfaces;

import com.backend.backend.dto.response.EventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

public interface EventSearchService {
    Page<EventResponse> searchEvents(
        String query,
        String location,
        Double radius,
        Set<String> categories,
        Boolean includeFullEvents,
        Boolean includePastEvents,
        Pageable pageable
    );

    List<EventResponse> findNearbyEvents(String location, Double radius);
    List<EventResponse> findUpcomingEvents(int days);
    List<EventResponse> findPopularEvents(int limit);
} 