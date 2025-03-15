package com.fill_rouge.backend.mapper;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.dto.response.EventResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-03-15T09:00:36+0000",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.41.0.z20250213-2037, environment: Java 21.0.6 (Eclipse Adoptium)"
)
@Component
public class EventMapperImpl implements EventMapper {

    @Override
    public Event toEntity(EventRequest request) {
        if ( request == null ) {
            return null;
        }

        Event.EventBuilder event = Event.builder();

        event.category( request.getCategory() );
        event.contactEmail( request.getContactEmail() );
        event.contactPerson( request.getContactPerson() );
        event.contactPhone( request.getContactPhone() );
        event.description( request.getDescription() );
        event.endDate( request.getEndDate() );
        event.location( request.getLocation() );
        event.maxParticipants( request.getMaxParticipants() );
        event.startDate( request.getStartDate() );
        event.title( request.getTitle() );

        event.createdAt( LocalDateTime.now() );
        event.updatedAt( LocalDateTime.now() );

        return event.build();
    }

    @Override
    public EventResponse toResponse(Event event, String currentUserId) {
        if ( event == null ) {
            return null;
        }

        EventResponse.EventResponseBuilder eventResponse = EventResponse.builder();

        eventResponse.averageRating( event.getAverageRating() );
        eventResponse.category( event.getCategory() );
        eventResponse.contactEmail( event.getContactEmail() );
        eventResponse.contactPerson( event.getContactPerson() );
        eventResponse.contactPhone( event.getContactPhone() );
        eventResponse.createdAt( event.getCreatedAt() );
        eventResponse.description( event.getDescription() );
        eventResponse.endDate( event.getEndDate() );
        eventResponse.id( event.getId() );
        eventResponse.location( event.getLocation() );
        eventResponse.maxParticipants( event.getMaxParticipants() );
        eventResponse.numberOfRatings( event.getNumberOfRatings() );
        eventResponse.organizationId( event.getOrganizationId() );
        eventResponse.startDate( event.getStartDate() );
        eventResponse.status( event.getStatus() );
        eventResponse.title( event.getTitle() );
        eventResponse.updatedAt( event.getUpdatedAt() );

        eventResponse.currentParticipants( event.getRegisteredParticipants().size() );
        eventResponse.isRegistered( event.getRegisteredParticipants().contains(currentUserId) );

        return eventResponse.build();
    }

    @Override
    public void updateEntity(EventRequest request, Event event) {
        if ( request == null ) {
            return;
        }

        if ( request.getCategory() != null ) {
            event.setCategory( request.getCategory() );
        }
        if ( request.getContactEmail() != null ) {
            event.setContactEmail( request.getContactEmail() );
        }
        if ( request.getContactPerson() != null ) {
            event.setContactPerson( request.getContactPerson() );
        }
        if ( request.getContactPhone() != null ) {
            event.setContactPhone( request.getContactPhone() );
        }
        if ( request.getDescription() != null ) {
            event.setDescription( request.getDescription() );
        }
        if ( request.getEndDate() != null ) {
            event.setEndDate( request.getEndDate() );
        }
        if ( request.getLocation() != null ) {
            event.setLocation( request.getLocation() );
        }
        event.setMaxParticipants( request.getMaxParticipants() );
        if ( request.getStartDate() != null ) {
            event.setStartDate( request.getStartDate() );
        }
        if ( request.getTitle() != null ) {
            event.setTitle( request.getTitle() );
        }

        event.setUpdatedAt( LocalDateTime.now() );
    }

    @Override
    public List<EventResponse> toResponseList(List<Event> events, String currentUserId) {
        if ( events == null ) {
            return null;
        }

        List<EventResponse> list = new ArrayList<EventResponse>( events.size() );
        for ( Event event : events ) {
            list.add( toResponse( event, currentUserId ) );
        }

        return list;
    }

    @Override
    public Set<EventResponse> toResponseSet(Set<Event> events, String currentUserId) {
        if ( events == null ) {
            return null;
        }

        Set<EventResponse> set = new LinkedHashSet<EventResponse>( Math.max( (int) ( events.size() / .75f ) + 1, 16 ) );
        for ( Event event : events ) {
            set.add( toResponse( event, currentUserId ) );
        }

        return set;
    }
}
