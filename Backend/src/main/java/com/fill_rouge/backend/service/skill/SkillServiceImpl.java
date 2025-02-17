package com.fill_rouge.backend.service.skill;

import com.fill_rouge.backend.domain.Event;
import com.fill_rouge.backend.domain.Skill;
import com.fill_rouge.backend.domain.Volunteer;
import com.fill_rouge.backend.dto.request.SkillRequest;
import com.fill_rouge.backend.exception.ResourceNotFoundException;
import com.fill_rouge.backend.repository.EventRepository;
import com.fill_rouge.backend.repository.SkillRepository;
import com.fill_rouge.backend.repository.VolunteerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final VolunteerRepository volunteerRepository;
    private final EventRepository eventRepository;

    @Override
    @Transactional
    public Skill createSkill(SkillRequest request) {
        Skill skill = new Skill();
        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        skill.setDescription(request.getDescription());
        skill.setPopularity(0);
        return skillRepository.save(skill);
    }

    @Override
    @Transactional
    public Skill updateSkill(String skillId, SkillRequest request) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + skillId));
        
        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        skill.setDescription(request.getDescription());
        
        return skillRepository.save(skill);
    }

    @Override
    @Transactional
    public void deleteSkill(String skillId) {
        if (!skillRepository.existsById(skillId)) {
            throw new ResourceNotFoundException("Skill not found with id: " + skillId);
        }
        skillRepository.deleteById(skillId);
    }

    @Override
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    @Override
    public List<String> getSkillCategories() {
        return skillRepository.findDistinctCategories();
    }

    @Override
    public List<Skill> getPopularSkills() {
        return skillRepository.findTop10ByOrderByPopularityDesc();
    }

    @Override
    public List<Skill> getVolunteerSkills(String volunteerId) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + volunteerId));
        return skillRepository.findAllById(volunteer.getSkills());
    }

    @Override
    @Transactional
    public List<Skill> addVolunteerSkills(String volunteerId, List<String> skillIds) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + volunteerId));

        Set<String> currentSkillIds = new HashSet<>(volunteer.getSkills());
        currentSkillIds.addAll(skillIds);
        volunteer.setSkills(new ArrayList<>(currentSkillIds));
        
        volunteerRepository.save(volunteer);

        // Increment popularity for added skills
        skillRepository.incrementPopularityForSkills(skillIds);

        return skillRepository.findAllById(currentSkillIds);
    }

    @Override
    @Transactional
    public void removeVolunteerSkill(String volunteerId, String skillId) {
        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + volunteerId));

        List<String> skillIds = new ArrayList<>(volunteer.getSkills());
        if (skillIds.remove(skillId)) {
            volunteer.setSkills(skillIds);
            volunteerRepository.save(volunteer);
            
            // Decrement popularity for removed skill
            skillRepository.decrementPopularityForSkill(skillId);
        }
    }

    @Override
    public List<Skill> getMatchingSkillsForEvent(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        return skillRepository.findAllById(event.getRequiredSkills());
    }
} 