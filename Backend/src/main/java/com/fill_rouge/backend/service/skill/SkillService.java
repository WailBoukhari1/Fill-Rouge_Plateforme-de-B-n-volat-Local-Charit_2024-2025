package com.fill_rouge.backend.service.skill;

import com.fill_rouge.backend.domain.Skill;
import com.fill_rouge.backend.dto.request.SkillRequest;

import java.util.List;

public interface SkillService {
    Skill createSkill(SkillRequest request);
    Skill updateSkill(String skillId, SkillRequest request);
    void deleteSkill(String skillId);
    List<Skill> getAllSkills();
    List<String> getSkillCategories();
    List<Skill> getPopularSkills();
    List<Skill> getVolunteerSkills(String volunteerId);
    List<Skill> addVolunteerSkills(String volunteerId, List<String> skillIds);
    void removeVolunteerSkill(String volunteerId, String skillId);
    List<Skill> getMatchingSkillsForEvent(String eventId);
} 