package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.domain.Skill;
import com.fill_rouge.backend.dto.request.SkillRequest;
import com.fill_rouge.backend.dto.response.SkillResponse;
import com.fill_rouge.backend.service.skill.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor

public class SkillsController {

    private final SkillService skillService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SkillResponse> createSkill(@Valid @RequestBody SkillRequest request) {
        Skill skill = skillService.createSkill(request);
        return ResponseEntity.ok(SkillResponse.fromSkill(skill));
    }

    @GetMapping
    public ResponseEntity<List<SkillResponse>> getAllSkills() {
        List<SkillResponse> skills = skillService.getAllSkills()
                .stream()
                .map(SkillResponse::fromSkill)
                .collect(Collectors.toList());
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getSkillCategories() {
        return ResponseEntity.ok(skillService.getSkillCategories());
    }

    @GetMapping("/popular")
    public ResponseEntity<List<SkillResponse>> getPopularSkills() {
        List<SkillResponse> skills = skillService.getPopularSkills()
                .stream()
                .map(SkillResponse::fromSkill)
                .collect(Collectors.toList());
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<List<SkillResponse>> getVolunteerSkills(@PathVariable String volunteerId) {
        List<SkillResponse> skills = skillService.getVolunteerSkills(volunteerId)
                .stream()
                .map(SkillResponse::fromSkill)
                .collect(Collectors.toList());
        return ResponseEntity.ok(skills);
    }

    @PostMapping("/volunteer/{volunteerId}")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<List<SkillResponse>> addVolunteerSkills(
            @PathVariable String volunteerId,
            @RequestBody List<String> skillIds) {
        List<SkillResponse> skills = skillService.addVolunteerSkills(volunteerId, skillIds)
                .stream()
                .map(SkillResponse::fromSkill)
                .collect(Collectors.toList());
        return ResponseEntity.ok(skills);
    }

    @DeleteMapping("/volunteer/{volunteerId}/{skillId}")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<Void> removeVolunteerSkill(
            @PathVariable String volunteerId,
            @PathVariable String skillId) {
        skillService.removeVolunteerSkill(volunteerId, skillId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/match/event/{eventId}")
    public ResponseEntity<List<SkillResponse>> getMatchingSkillsForEvent(@PathVariable String eventId) {
        List<SkillResponse> skills = skillService.getMatchingSkillsForEvent(eventId)
                .stream()
                .map(SkillResponse::fromSkill)
                .collect(Collectors.toList());
        return ResponseEntity.ok(skills);
    }

    @PutMapping("/{skillId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SkillResponse> updateSkill(
            @PathVariable String skillId,
            @Valid @RequestBody SkillRequest request) {
        Skill skill = skillService.updateSkill(skillId, request);
        return ResponseEntity.ok(SkillResponse.fromSkill(skill));
    }

    @DeleteMapping("/{skillId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSkill(@PathVariable String skillId) {
        skillService.deleteSkill(skillId);
        return ResponseEntity.noContent().build();
    }
} 