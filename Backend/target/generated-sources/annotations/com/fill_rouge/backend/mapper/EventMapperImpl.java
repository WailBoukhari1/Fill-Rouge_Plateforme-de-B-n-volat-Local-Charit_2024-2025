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
    date = "2025-03-05T23:57:02+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class EventMapperImpl implements EventMapper {

    @Override
    public Event toEntity(EventRequest request) {
        if ( request == null ) {
            return null;
        }

        Event event = new Event();

        event.setTitle( request.getTitle() );
        event.setDescription( request.getDescription() );
        event.setLocation( request.getLocation() );
        event.setStartDate( request.getStartDate() );
        event.setEndDate( request.getEndDate() );
        event.setMaxParticipants( request.getMaxParticipants() );
        event.setCategory( request.getCategory() );
        event.setContactPerson( request.getContactPerson() );
        event.setContactEmail( request.getContactEmail() );
        event.setContactPhone( request.getContactPhone() );

        event.setCreatedAt( LocalDateTime.now() );
        event.setUpdatedAt( LocalDateTime.now() );

        return event;
    }

    @Override
    public EventResponse toResponse(Event event, String currentUserId) {
        if ( event == null ) {
            return null;
        }

        EventResponse.EventResponseBuilder eventResponse = EventResponse.builder();

        eventResponse.id( event.getId() );
        eventResponse.title( event.getTitle() );
        eventResponse.description( event.getDescription() );
        eventResponse.organizationId( event.getOrganizationId() );
        eventResponse.location( event.getLocation() );
        eventResponse.startDate( event.getStartDate() );
        eventResponse.endDate( event.getEndDate() );
        eventResponse.maxParticipants( event.getMaxParticipants() );
        eventResponse.category( event.getCategory() );
        eventResponse.status( event.getStatus() );
        eventResponse.averageRating( event.getAverageRating() );
        eventResponse.numberOfRatings( event.getNumberOfRatings() );
        eventResponse.contactPerson( event.getContactPerson() );
        eventResponse.contactEmail( event.getContactEmail() );
        eventResponse.contactPhone( event.getContactPhone() );
        eventResponse.createdAt( event.getCreatedAt() );
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

        if ( request.getTitle() != null ) {
            event.setTitle( request.getTitle() );
        }
        if ( request.getDescription() != null ) {
            event.setDescription( request.getDescription() );
        }
        if ( request.getLocation() != null ) {
            event.setLocation( request.getLocation() );
        }
        if ( request.getStartDate() != null ) {
            event.setStartDate( request.getStartDate() );
        }
        if ( request.getEndDate() != null ) {
            event.setEndDate( request.getEndDate() );
        }
        event.setMaxParticipants( request.getMaxParticipants() );
        if ( request.getCategory() != null ) {
            event.setCategory( request.getCategory() );
        }
        if ( request.getContactPerson() != null ) {
            event.setContactPerson( request.getContactPerson() );
        }
        if ( request.getContactEmail() != null ) {
            event.setContactEmail( request.getContactEmail() );
        }
        if ( request.getContactPhone() != null ) {
            event.setContactPhone( request.getContactPhone() );
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
