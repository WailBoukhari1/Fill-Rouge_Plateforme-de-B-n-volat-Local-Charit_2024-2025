package com.fill_rouge.backend.integration;

import com.fill_rouge.backend.config.BaseMongoTestContainer;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.constant.Role;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.repository.UserRepository;
import com.fill_rouge.backend.service.event.EventService;
import com.fill_rouge.backend.util.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class EventIntegrationTest extends BaseMongoTestContainer {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EventService eventService;

    private User organizationUser;
    private String organizationId;
    private Event testEvent;

    @BeforeEach
    void setUp() {
        // Clean repositories
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // Create an organization user
        organizationUser = TestDataFactory.createUser("org@example.com");
        organizationUser.setRole(Role.ORGANIZATION);
        organizationUser = userRepository.save(organizationUser);
        organizationId = organizationUser.getId();

        // Create a test event
        testEvent = TestDataFactory.createEvent(organizationId, "Test Event");
        testEvent.setStatus(EventStatus.ACTIVE);
        testEvent.setStartDate(LocalDateTime.now().plusDays(1));
        testEvent.setEndDate(LocalDateTime.now().plusDays(1).plusHours(2));
        testEvent = eventRepository.save(testEvent);
    }

    @AfterEach
    void tearDown() {
        eventRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void findById_ShouldReturnEvent_WhenEventExists() {
        // Act
        Event result = eventService.getEventById(testEvent.getId());

        // Assert
        assertNotNull(result);
        assertEquals(testEvent.getId(), result.getId());
        assertEquals("Test Event", result.getTitle());
        assertEquals(organizationId, result.getOrganizationId());
    }

    @Test
    void deleteEvent_ShouldDeleteEvent() {
        // Act
        eventService.deleteEvent(testEvent.getId());
        
        // Assert
        Optional<Event> result = eventRepository.findById(testEvent.getId());
        assertFalse(result.isPresent());
    }

    @Test
    void updateEventStatus_ShouldUpdateStatus() {
        // Act
        Event updatedEvent = eventService.updateEventStatus(testEvent.getId(), EventStatus.CANCELLED);
        
        // Assert
        assertNotNull(updatedEvent);
        assertEquals(EventStatus.CANCELLED, updatedEvent.getStatus());
        
        // Verify the database was updated
        Optional<Event> savedEvent = eventRepository.findById(testEvent.getId());
        assertTrue(savedEvent.isPresent());
        assertEquals(EventStatus.CANCELLED, savedEvent.get().getStatus());
    }

    @Test
    void getUpcomingEvents_ShouldReturnFutureEvents() {
        // Arrange
        // Create a past event
        Event pastEvent = TestDataFactory.createEvent(organizationId, "Past Event");
        pastEvent.setStartDate(LocalDateTime.now().minusDays(1));
        pastEvent.setEndDate(LocalDateTime.now().minusDays(1).plusHours(2));
        pastEvent.setStatus(EventStatus.ACTIVE);
        eventRepository.save(pastEvent);
        
        // Create another future event
        Event futureEvent = TestDataFactory.createEvent(organizationId, "Future Event");
        futureEvent.setStartDate(LocalDateTime.now().plusDays(2));
        futureEvent.setEndDate(LocalDateTime.now().plusDays(2).plusHours(2));
        futureEvent.setStatus(EventStatus.ACTIVE);
        eventRepository.save(futureEvent);
        
        // Create a cancelled future event
        Event cancelledEvent = TestDataFactory.createEvent(organizationId, "Cancelled Event");
        cancelledEvent.setStartDate(LocalDateTime.now().plusDays(3));
        cancelledEvent.setEndDate(LocalDateTime.now().plusDays(3).plusHours(2));
        cancelledEvent.setStatus(EventStatus.CANCELLED);
        eventRepository.save(cancelledEvent);

        // Act
        Page<Event> result = eventService.getUpcomingEvents(PageRequest.of(0, 10));

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream().anyMatch(e -> e.getTitle().equals("Test Event")));
        assertTrue(result.getContent().stream().anyMatch(e -> e.getTitle().equals("Future Event")));
        assertFalse(result.getContent().stream().anyMatch(e -> e.getTitle().equals("Past Event")));
        assertFalse(result.getContent().stream().anyMatch(e -> e.getTitle().equals("Cancelled Event")));
    }
} 