package com.fill_rouge.backend.integration;

import com.fill_rouge.backend.config.BaseMongoTestContainer;
import com.fill_rouge.backend.constant.EventStatus;
import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.util.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class EventRepositoryIntegrationTest extends BaseMongoTestContainer {

    @Autowired
    private EventRepository eventRepository;

    private String organizationId;
    private Event testEvent;

    @BeforeEach
    void setUp() {
        // Clean repository
        eventRepository.deleteAll();

        // Set up test data
        organizationId = "org123";
        testEvent = TestDataFactory.createEvent(organizationId, "Test Event");
        testEvent.setStatus(EventStatus.ACTIVE);
        testEvent = eventRepository.save(testEvent);
    }

    @AfterEach
    void tearDown() {
        eventRepository.deleteAll();
    }

    @Test
    void findById_ShouldReturnEvent_WhenEventExists() {
        // Act
        Optional<Event> result = eventRepository.findById(testEvent.getId());

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testEvent.getId(), result.get().getId());
        assertEquals("Test Event", result.get().getTitle());
        assertEquals(organizationId, result.get().getOrganizationId());
    }

    @Test
    void findById_ShouldReturnEmpty_WhenEventDoesNotExist() {
        // Act
        Optional<Event> result = eventRepository.findById("non-existent-id");

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllEvents() {
        // Arrange
        // Create another event
        Event anotherEvent = TestDataFactory.createEvent(organizationId, "Another Event");
        anotherEvent.setStatus(EventStatus.ACTIVE);
        eventRepository.save(anotherEvent);

        // Act
        List<Event> results = eventRepository.findAll();

        // Assert
        assertNotNull(results);
        assertEquals(2, results.size());
        assertTrue(results.stream().anyMatch(event -> event.getTitle().equals("Test Event")));
        assertTrue(results.stream().anyMatch(event -> event.getTitle().equals("Another Event")));
    }

    @Test
    void findByStartDateAfterAndStatus_ShouldReturnUpcomingEvents() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        
        // Create future events
        Event futureEvent1 = TestDataFactory.createEvent(organizationId, "Future Event 1");
        futureEvent1.setStartDate(now.plusDays(1));
        futureEvent1.setStatus(EventStatus.ACTIVE);
        eventRepository.save(futureEvent1);
        
        Event futureEvent2 = TestDataFactory.createEvent(organizationId, "Future Event 2");
        futureEvent2.setStartDate(now.plusDays(2));
        futureEvent2.setStatus(EventStatus.ACTIVE);
        eventRepository.save(futureEvent2);
        
        // Create a past event
        Event pastEvent = TestDataFactory.createEvent(organizationId, "Past Event");
        pastEvent.setStartDate(now.minusDays(1));
        pastEvent.setStatus(EventStatus.ACTIVE);
        eventRepository.save(pastEvent);
        
        // Create a cancelled event
        Event cancelledEvent = TestDataFactory.createEvent(organizationId, "Cancelled Event");
        cancelledEvent.setStartDate(now.plusDays(3));
        cancelledEvent.setStatus(EventStatus.CANCELLED);
        eventRepository.save(cancelledEvent);

        // Act
        Page<Event> results = eventRepository.findByStartDateAfterAndStatusOrderByStartDateAsc(
                now, EventStatus.ACTIVE, PageRequest.of(0, 10));

        // Assert
        assertNotNull(results);
        assertEquals(3, results.getTotalElements()); // includes the testEvent from setUp
        List<Event> content = results.getContent();
        assertEquals("Test Event", content.get(0).getTitle());
        assertEquals("Future Event 1", content.get(1).getTitle());
        assertEquals("Future Event 2", content.get(2).getTitle());
    }

    @Test
    void save_ShouldUpdateEvent_WhenEventExists() {
        // Arrange
        testEvent.setTitle("Updated Title");
        testEvent.setDescription("Updated Description");

        // Act
        Event savedEvent = eventRepository.save(testEvent);

        // Assert
        assertEquals(testEvent.getId(), savedEvent.getId());
        assertEquals("Updated Title", savedEvent.getTitle());
        assertEquals("Updated Description", savedEvent.getDescription());
        
        // Verify the update was persisted
        Optional<Event> fetchedEvent = eventRepository.findById(testEvent.getId());
        assertTrue(fetchedEvent.isPresent());
        assertEquals("Updated Title", fetchedEvent.get().getTitle());
    }

    @Test
    void delete_ShouldRemoveEvent() {
        // Act
        eventRepository.delete(testEvent);
        
        // Assert
        Optional<Event> result = eventRepository.findById(testEvent.getId());
        assertFalse(result.isPresent());
    }
} 