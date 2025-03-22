package com.fill_rouge.backend.service.event;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.dto.request.EventRequest;
import com.fill_rouge.backend.mapper.EventMapper;
import com.fill_rouge.backend.repository.EventFeedbackRepository;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.service.event.impl.EventServiceImpl;
import com.fill_rouge.backend.util.TestDataFactory;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;
    
    @Mock
    private EventFeedbackRepository eventFeedbackRepository;
        

    
    @Mock
    private EventMapper eventMapper;
    
    @Mock
    private EventParticipationService participationService;

    @InjectMocks
    private EventServiceImpl eventService;

    private Event testEvent;
    private String organizationId;
    private String eventId;

    @BeforeEach
    void setUp() {
        organizationId = "org123";
        eventId = "event123";
        testEvent = TestDataFactory.createEvent(organizationId, "Test Event");
        testEvent.setId(eventId);
    }

    @Test
    void getEventById_ShouldReturnEvent_WhenEventExists() {
        // Arrange
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(testEvent));

        // Act
        Event result = eventService.getEventById(eventId);

        // Assert
        assertNotNull(result);
        assertEquals(eventId, result.getId());
        assertEquals("Test Event", result.getTitle());
        assertEquals(organizationId, result.getOrganizationId());
    }

    @Test
    void getEventById_ShouldThrowException_WhenEventDoesNotExist() {
        // Arrange
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            eventService.getEventById(eventId);
        });
    }

    @Test
    void createEvent_ShouldReturnCreatedEvent() {
        // Arrange
        EventRequest eventRequest = new EventRequest();
        eventRequest.setTitle("New Test Event");
        eventRequest.setDescription("Test Description");
        eventRequest.setLocation("Test Location");
        eventRequest.setStartDate(LocalDateTime.now().plusDays(1));
        eventRequest.setEndDate(LocalDateTime.now().plusDays(1).plusHours(2));
        
        Event mappedEvent = new Event();
        mappedEvent.setTitle(eventRequest.getTitle());
        mappedEvent.setDescription(eventRequest.getDescription());
        mappedEvent.setLocation(eventRequest.getLocation());
        mappedEvent.setStartDate(eventRequest.getStartDate());
        mappedEvent.setEndDate(eventRequest.getEndDate());
        
        when(eventMapper.toEntity(eventRequest)).thenReturn(mappedEvent);
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> {
            Event savedEvent = invocation.getArgument(0);
            savedEvent.setId(eventId);
            return savedEvent;
        });

        // Act
        Event result = eventService.createEvent(eventRequest, organizationId);

        // Assert
        assertNotNull(result);
        assertEquals(eventId, result.getId());
        assertEquals("New Test Event", result.getTitle());
        assertEquals(organizationId, result.getOrganizationId());
        verify(eventRepository).save(any(Event.class));
    }

    // @Test
    // void updateEvent_ShouldReturnUpdatedEvent_WhenEventExists() {
    //     // Arrange
    //     EventRequest updateRequest = new EventRequest();
    //     updateRequest.setTitle("Updated Event");
    //     updateRequest.setDescription("Updated Description");
    //     updateRequest.setStartDate(LocalDateTime.now().plusDays(1));
    //     updateRequest.setEndDate(LocalDateTime.now().plusDays(1).plusHours(2));
        
    //     when(eventRepository.findById(eventId)).thenReturn(Optional.of(testEvent));
    //     when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

    //     // Act
    //     Event result = eventService.updateEvent(eventId, updateRequest);

    //     // Assert
    //     assertNotNull(result);
    //     assertEquals(eventId, result.getId());
    //     assertEquals("Updated Event", result.getTitle());
    //     assertEquals("Updated Description", result.getDescription());
    //     verify(eventRepository).save(any(Event.class));
    // }

    @Test
    void deleteEvent_ShouldCallRepository_WhenEventExists() {
        // Act
        eventService.deleteEvent(eventId);

        // Assert
        verify(eventRepository).deleteById(eventId);
    }

    @Test
    void updateEventStatus_ShouldUpdateStatus_WhenEventExists() {
        // Arrange
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(testEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Event result = eventService.updateEventStatus(eventId, EventStatus.CANCELLED);

        // Assert
        assertNotNull(result);
        assertEquals(EventStatus.CANCELLED, result.getStatus());
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void getUpcomingEvents_ShouldReturnListOfEvents() {
        // Arrange
        List<Event> events = Arrays.asList(
                TestDataFactory.createEvent(organizationId, "Event 1"),
                TestDataFactory.createEvent(organizationId, "Event 2")
        );
        Page<Event> eventPage = new PageImpl<>(events);
        
        when(eventRepository.findByStartDateAfterAndStatusOrderByStartDateAsc(
                any(LocalDateTime.class), eq(EventStatus.ACTIVE), any(Pageable.class)))
                .thenReturn(eventPage);

        // Act
        Page<Event> result = eventService.getUpcomingEvents(Pageable.unpaged());

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        verify(eventRepository).findByStartDateAfterAndStatusOrderByStartDateAsc(
                any(LocalDateTime.class), eq(EventStatus.ACTIVE), any(Pageable.class));
    }
} 