package com.fill_rouge.backend.mapper;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.dto.response.EventResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-03-22T22:08:12+0000",
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

        double[] coordinates = request.getCoordinates();
        if ( coordinates != null ) {
            event.coordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        event.waitlistEnabled( request.isWaitlistEnabled() );
        event.maxWaitlistSize( request.getMaxWaitlistSize() );
        List<String> list = request.getRequiredSkills();
        if ( list != null ) {
            event.requiredSkills( new ArrayList<String>( list ) );
        }
        event.virtual( request.isVirtual() );
        event.requiresApproval( request.isRequiresApproval() );
        event.difficulty( request.getDifficulty() );
        Set<String> set = request.getTags();
        if ( set != null ) {
            event.tags( new LinkedHashSet<String>( set ) );
        }
        event.recurring( request.isRecurring() );
        event.minimumAge( request.getMinimumAge() );
        event.requiresBackground( request.isRequiresBackground() );
        event.specialEvent( request.isSpecialEvent() );
        event.pointsAwarded( request.getPointsAwarded() );
        event.durationHours( request.getDurationHours() );
        event.bannerImage( request.getBannerImage() );
        event.category( request.getCategory() );
        event.contactEmail( request.getContactEmail() );
        event.contactPerson( request.getContactPerson() );
        event.contactPhone( request.getContactPhone() );
        event.description( request.getDescription() );
        event.endDate( request.getEndDate() );
        event.location( request.getLocation() );
        event.maxParticipants( request.getMaxParticipants() );
        event.organizationId( request.getOrganizationId() );
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

        double[] coordinates = event.getCoordinates();
        if ( coordinates != null ) {
            eventResponse.coordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        eventResponse.waitlistEnabled( event.isWaitlistEnabled() );
        eventResponse.maxWaitlistSize( event.getMaxWaitlistSize() );
        List<String> list = event.getRequiredSkills();
        if ( list != null ) {
            eventResponse.requiredSkills( new ArrayList<String>( list ) );
        }
        eventResponse.virtual( event.isVirtual() );
        eventResponse.requiresApproval( event.isRequiresApproval() );
        eventResponse.difficulty( event.getDifficulty() );
        Set<String> set = event.getTags();
        if ( set != null ) {
            eventResponse.tags( new LinkedHashSet<String>( set ) );
        }
        eventResponse.recurring( event.isRecurring() );
        eventResponse.minimumAge( event.getMinimumAge() );
        eventResponse.requiresBackground( event.isRequiresBackground() );
        eventResponse.specialEvent( event.isSpecialEvent() );
        eventResponse.pointsAwarded( event.getPointsAwarded() );
        eventResponse.durationHours( event.getDurationHours() );
        eventResponse.bannerImage( event.getBannerImage() );
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

        double[] coordinates = request.getCoordinates();
        if ( coordinates != null ) {
            event.setCoordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        event.setWaitlistEnabled( request.isWaitlistEnabled() );
        event.setMaxWaitlistSize( request.getMaxWaitlistSize() );
        if ( event.getRequiredSkills() != null ) {
            List<String> list = request.getRequiredSkills();
            if ( list != null ) {
                event.getRequiredSkills().clear();
                event.getRequiredSkills().addAll( list );
            }
        }
        else {
            List<String> list = request.getRequiredSkills();
            if ( list != null ) {
                event.setRequiredSkills( new ArrayList<String>( list ) );
            }
        }
        event.setVirtual( request.isVirtual() );
        event.setRequiresApproval( request.isRequiresApproval() );
        if ( request.getDifficulty() != null ) {
            event.setDifficulty( request.getDifficulty() );
        }
        if ( event.getTags() != null ) {
            Set<String> set = request.getTags();
            if ( set != null ) {
                event.getTags().clear();
                event.getTags().addAll( set );
            }
        }
        else {
            Set<String> set = request.getTags();
            if ( set != null ) {
                event.setTags( new LinkedHashSet<String>( set ) );
            }
        }
        event.setRecurring( request.isRecurring() );
        event.setMinimumAge( request.getMinimumAge() );
        event.setRequiresBackground( request.isRequiresBackground() );
        event.setSpecialEvent( request.isSpecialEvent() );
        event.setPointsAwarded( request.getPointsAwarded() );
        event.setDurationHours( request.getDurationHours() );
        if ( request.getBannerImage() != null ) {
            event.setBannerImage( request.getBannerImage() );
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
        if ( request.getOrganizationId() != null ) {
            event.setOrganizationId( request.getOrganizationId() );
        }
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

    @Override
    public EventRequest toRequest(Event event) {
        if ( event == null ) {
            return null;
        }

        EventRequest.EventRequestBuilder eventRequest = EventRequest.builder();

        double[] coordinates = event.getCoordinates();
        if ( coordinates != null ) {
            eventRequest.coordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        eventRequest.waitlistEnabled( event.isWaitlistEnabled() );
        eventRequest.maxWaitlistSize( event.getMaxWaitlistSize() );
        List<String> list = event.getRequiredSkills();
        if ( list != null ) {
            eventRequest.requiredSkills( new ArrayList<String>( list ) );
        }
        eventRequest.virtual( event.isVirtual() );
        eventRequest.requiresApproval( event.isRequiresApproval() );
        eventRequest.difficulty( event.getDifficulty() );
        Set<String> set = event.getTags();
        if ( set != null ) {
            eventRequest.tags( new LinkedHashSet<String>( set ) );
        }
        eventRequest.recurring( event.isRecurring() );
        eventRequest.minimumAge( event.getMinimumAge() );
        eventRequest.requiresBackground( event.isRequiresBackground() );
        eventRequest.specialEvent( event.isSpecialEvent() );
        eventRequest.pointsAwarded( event.getPointsAwarded() );
        eventRequest.durationHours( event.getDurationHours() );
        eventRequest.bannerImage( event.getBannerImage() );
        eventRequest.category( event.getCategory() );
        eventRequest.contactEmail( event.getContactEmail() );
        eventRequest.contactPerson( event.getContactPerson() );
        eventRequest.contactPhone( event.getContactPhone() );
        eventRequest.description( event.getDescription() );
        eventRequest.endDate( event.getEndDate() );
        eventRequest.location( event.getLocation() );
        eventRequest.maxParticipants( event.getMaxParticipants() );
        eventRequest.organizationId( event.getOrganizationId() );
        eventRequest.startDate( event.getStartDate() );
        eventRequest.status( event.getStatus() );
        eventRequest.title( event.getTitle() );

        return eventRequest.build();
    }

    @Override
    public Event toEvent(EventRequest eventRequest) {
        if ( eventRequest == null ) {
            return null;
        }

        Event.EventBuilder event = Event.builder();

        event.bannerImage( eventRequest.getBannerImage() );
        event.category( eventRequest.getCategory() );
        event.contactEmail( eventRequest.getContactEmail() );
        event.contactPerson( eventRequest.getContactPerson() );
        event.contactPhone( eventRequest.getContactPhone() );
        double[] coordinates = eventRequest.getCoordinates();
        if ( coordinates != null ) {
            event.coordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        event.description( eventRequest.getDescription() );
        event.difficulty( eventRequest.getDifficulty() );
        event.durationHours( eventRequest.getDurationHours() );
        event.endDate( eventRequest.getEndDate() );
        event.location( eventRequest.getLocation() );
        event.maxParticipants( eventRequest.getMaxParticipants() );
        event.maxWaitlistSize( eventRequest.getMaxWaitlistSize() );
        event.minimumAge( eventRequest.getMinimumAge() );
        event.pointsAwarded( eventRequest.getPointsAwarded() );
        event.recurring( eventRequest.isRecurring() );
        List<String> list = eventRequest.getRequiredSkills();
        if ( list != null ) {
            event.requiredSkills( new ArrayList<String>( list ) );
        }
        event.requiresApproval( eventRequest.isRequiresApproval() );
        event.requiresBackground( eventRequest.isRequiresBackground() );
        event.specialEvent( eventRequest.isSpecialEvent() );
        event.startDate( eventRequest.getStartDate() );
        Set<String> set = eventRequest.getTags();
        if ( set != null ) {
            event.tags( new LinkedHashSet<String>( set ) );
        }
        event.title( eventRequest.getTitle() );
        event.virtual( eventRequest.isVirtual() );
        event.waitlistEnabled( eventRequest.isWaitlistEnabled() );

        return event.build();
    }

    @Override
    public Event updateEventFromRequest(EventRequest eventRequest, Event event) {
        if ( eventRequest == null ) {
            return event;
        }

        if ( eventRequest.getBannerImage() != null ) {
            event.setBannerImage( eventRequest.getBannerImage() );
        }
        if ( eventRequest.getCategory() != null ) {
            event.setCategory( eventRequest.getCategory() );
        }
        if ( eventRequest.getContactEmail() != null ) {
            event.setContactEmail( eventRequest.getContactEmail() );
        }
        if ( eventRequest.getContactPerson() != null ) {
            event.setContactPerson( eventRequest.getContactPerson() );
        }
        if ( eventRequest.getContactPhone() != null ) {
            event.setContactPhone( eventRequest.getContactPhone() );
        }
        double[] coordinates = eventRequest.getCoordinates();
        if ( coordinates != null ) {
            event.setCoordinates( Arrays.copyOf( coordinates, coordinates.length ) );
        }
        if ( eventRequest.getDescription() != null ) {
            event.setDescription( eventRequest.getDescription() );
        }
        if ( eventRequest.getDifficulty() != null ) {
            event.setDifficulty( eventRequest.getDifficulty() );
        }
        event.setDurationHours( eventRequest.getDurationHours() );
        if ( eventRequest.getEndDate() != null ) {
            event.setEndDate( eventRequest.getEndDate() );
        }
        if ( eventRequest.getLocation() != null ) {
            event.setLocation( eventRequest.getLocation() );
        }
        event.setMaxParticipants( eventRequest.getMaxParticipants() );
        event.setMaxWaitlistSize( eventRequest.getMaxWaitlistSize() );
        event.setMinimumAge( eventRequest.getMinimumAge() );
        if ( eventRequest.getOrganizationId() != null ) {
            event.setOrganizationId( eventRequest.getOrganizationId() );
        }
        event.setPointsAwarded( eventRequest.getPointsAwarded() );
        event.setRecurring( eventRequest.isRecurring() );
        if ( event.getRequiredSkills() != null ) {
            List<String> list = eventRequest.getRequiredSkills();
            if ( list != null ) {
                event.getRequiredSkills().clear();
                event.getRequiredSkills().addAll( list );
            }
        }
        else {
            List<String> list = eventRequest.getRequiredSkills();
            if ( list != null ) {
                event.setRequiredSkills( new ArrayList<String>( list ) );
            }
        }
        event.setRequiresApproval( eventRequest.isRequiresApproval() );
        event.setRequiresBackground( eventRequest.isRequiresBackground() );
        event.setSpecialEvent( eventRequest.isSpecialEvent() );
        if ( eventRequest.getStartDate() != null ) {
            event.setStartDate( eventRequest.getStartDate() );
        }
        if ( eventRequest.getStatus() != null ) {
            event.setStatus( eventRequest.getStatus() );
        }
        if ( event.getTags() != null ) {
            Set<String> set = eventRequest.getTags();
            if ( set != null ) {
                event.getTags().clear();
                event.getTags().addAll( set );
            }
        }
        else {
            Set<String> set = eventRequest.getTags();
            if ( set != null ) {
                event.setTags( new LinkedHashSet<String>( set ) );
            }
        }
        if ( eventRequest.getTitle() != null ) {
            event.setTitle( eventRequest.getTitle() );
        }
        event.setVirtual( eventRequest.isVirtual() );
        event.setWaitlistEnabled( eventRequest.isWaitlistEnabled() );

        return event;
    }
}
