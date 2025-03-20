package com.fill_rouge.backend.service.event;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.EventParticipation;
import com.fill_rouge.backend.domain.VolunteerAchievement;
import com.fill_rouge.backend.constant.AchievementType;
import com.fill_rouge.backend.constant.EventParticipationStatus;
import com.fill_rouge.backend.service.achievement.AchievementService;
import com.fill_rouge.backend.repository.EventParticipationRepository;
import com.fill_rouge.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventAchievementService {
    
    private final AchievementService achievementService;
    private final EventParticipationRepository eventParticipationRepository;
    private final EventRepository eventRepository;
    
    @Transactional
    public void checkEventAchievements(String volunteerId) {
        // Get all event participations for the volunteer
        List<EventParticipation> participations = eventParticipationRepository.findByVolunteerId(volunteerId);
        
        // Calculate statistics
        int totalEventsAttended = (int) participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.ATTENDED)
            .count();
            
        int totalHours = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.ATTENDED)
            .mapToInt(p -> p.getHours() != null ? p.getHours() : 0)
            .sum();
            
        double averageRating = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.ATTENDED && p.getRating() != null)
            .mapToDouble(EventParticipation::getRating)
            .average()
            .orElse(0.0);
            
        // Check participation achievements
        checkParticipationAchievements(volunteerId, totalEventsAttended);
        
        // Check hours contributed achievements
        checkHoursAchievements(volunteerId, totalHours);
        
        // Check rating achievements
        checkRatingAchievements(volunteerId, averageRating);
        
        // Check category specialist achievements
        checkCategorySpecialistAchievements(volunteerId, participations);
        
        // Check streak achievements
        checkStreakAchievements(volunteerId, participations);
        
        // Check first-time achievements
        checkFirstTimeAchievements(volunteerId, participations);
        
        // Check milestone achievements
        checkMilestoneAchievements(volunteerId, totalEventsAttended, totalHours);
    }
    
    private void checkParticipationAchievements(String volunteerId, int totalEventsAttended) {
        achievementService.checkAndAwardAchievements(volunteerId);
    }
    
    private void checkHoursAchievements(String volunteerId, int totalHours) {
        achievementService.checkAndAwardAchievements(volunteerId);
    }
    
    private void checkRatingAchievements(String volunteerId, double averageRating) {
        achievementService.checkAndAwardAchievements(volunteerId);
    }
    
    private void checkCategorySpecialistAchievements(String volunteerId, List<EventParticipation> participations) {
        // Group participations by category
        Map<String, Long> categoryCounts = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.ATTENDED)
            .collect(Collectors.groupingBy(
                p -> p.getEvent().getCategory().toString(),
                Collectors.counting()
            ));
            
        // Check if volunteer qualifies for category specialist achievements
        categoryCounts.forEach((category, count) -> {
            if (count >= 5) { // Example threshold
                achievementService.checkAndAwardAchievements(volunteerId);
            }
        });
    }
    
    private void checkStreakAchievements(String volunteerId, List<EventParticipation> participations) {
        // Sort participations by date
        List<EventParticipation> sortedParticipations = participations.stream()
            .filter(p -> p.getStatus() == EventParticipationStatus.ATTENDED)
            .sorted((p1, p2) -> p2.getEvent().getStartDate().compareTo(p1.getEvent().getStartDate()))
            .collect(Collectors.toList());
            
        // Calculate current streak
        int currentStreak = 1;
        LocalDateTime lastEventDate = null;
        
        for (EventParticipation participation : sortedParticipations) {
            LocalDateTime eventDate = participation.getEvent().getStartDate();
            
            if (lastEventDate == null) {
                lastEventDate = eventDate;
                continue;
            }
            
            // Check if events are within 30 days of each other
            if (lastEventDate.minusDays(30).isAfter(eventDate)) {
                break;
            }
            
            currentStreak++;
            lastEventDate = eventDate;
        }
        
        // Check if volunteer qualifies for streak achievements
        if (currentStreak >= 3) { // Example threshold
            achievementService.checkAndAwardAchievements(volunteerId);
        }
    }
    
    private void checkFirstTimeAchievements(String volunteerId, List<EventParticipation> participations) {
        // Check if this is the first event
        if (participations.size() == 1) {
            achievementService.checkAndAwardAchievements(volunteerId);
        }
    }
    
    private void checkMilestoneAchievements(String volunteerId, int totalEventsAttended, int totalHours) {
        // Check for milestone achievements (e.g., 10 events, 50 hours, etc.)
        if (totalEventsAttended >= 10 || totalHours >= 50) {
            achievementService.checkAndAwardAchievements(volunteerId);
        }
    }
    
    @Transactional
    public void onEventCompleted(Event event) {
        // Get all participants who attended the event
        List<EventParticipation> attendedParticipations = eventParticipationRepository
            .findByEventIdAndStatus(event.getId(), EventParticipationStatus.ATTENDED);
            
        // Check achievements for each participant
        attendedParticipations.forEach(participation -> {
            checkEventAchievements(participation.getVolunteerId());
        });
    }
    
    @Transactional
    public void onEventParticipationUpdated(EventParticipation participation) {
        if (participation.getStatus() == EventParticipationStatus.ATTENDED) {
            checkEventAchievements(participation.getVolunteerId());
        }
    }
} 