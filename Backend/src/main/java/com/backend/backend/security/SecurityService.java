package com.backend.backend.security;

import com.backend.backend.domain.model.Event;
import com.backend.backend.domain.model.Organization;
import com.backend.backend.repository.EventRepository;
import com.backend.backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SecurityService {
    
    private final EventRepository eventRepository;
    private final OrganizationRepository organizationRepository;
    
    public boolean isEventOwner(String eventId, UserDetails userDetails) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isPresent()) {
            Optional<Organization> org = organizationRepository.findByUserId(userDetails.getUsername());
            return org.map(o -> o.getId().equals(event.get().getOrganizationId())).orElse(false);
        }
        return false;
    }
    
    public boolean isOrganizationOwner(String organizationId, UserDetails userDetails) {
        return organizationRepository.findById(organizationId)
            .map(org -> org.getUserId().equals(userDetails.getUsername()))
            .orElse(false);
    }
} 