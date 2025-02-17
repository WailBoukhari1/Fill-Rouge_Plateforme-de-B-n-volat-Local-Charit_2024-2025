package com.fill_rouge.backend.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.fill_rouge.backend.domain.VolunteerProfile;
import com.fill_rouge.backend.dto.request.VolunteerProfileRequest;
import com.fill_rouge.backend.dto.response.BadgeResponse;
import com.fill_rouge.backend.dto.response.SkillResponse;
import com.fill_rouge.backend.dto.response.VolunteerProfileResponse;
import com.fill_rouge.backend.dto.response.VolunteerStatsResponse;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VolunteerProfileMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "volunteer", ignore = true)
    @Mapping(target = "reliabilityScore", constant = "100")
    @Mapping(target = "totalHoursVolunteered", constant = "0")
    @Mapping(target = "totalEventsAttended", constant = "0")
    @Mapping(target = "averageRating", constant = "0.0")
    @Mapping(target = "backgroundChecked", constant = "false")
    @Mapping(target = "backgroundCheckStatus", constant = "PENDING")
    VolunteerProfile toEntity(VolunteerProfileRequest request);

    @Mapping(target = "firstName", source = "volunteer.user.firstName")
    @Mapping(target = "lastName", source = "volunteer.user.lastName")
    @Mapping(target = "email", source = "volunteer.user.email")
    @Mapping(target = "joinedAt", source = "createdAt")
    @Mapping(target = "isActive", source = "profileVisible")
    @Mapping(target = "status", source = "backgroundCheckStatus")
    @Mapping(target = "stats", expression = "java(createVolunteerStats(profile))")
    @Mapping(target = "badges", expression = "java(mapBadges(profile.getBadges()))")
    @Mapping(target = "skills", expression = "java(mapSkills(profile.getSkills()))")
    VolunteerProfileResponse toResponse(VolunteerProfile profile);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "volunteer", ignore = true)
    @Mapping(target = "reliabilityScore", ignore = true)
    @Mapping(target = "totalHoursVolunteered", ignore = true)
    @Mapping(target = "totalEventsAttended", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "backgroundChecked", ignore = true)
    @Mapping(target = "backgroundCheckStatus", ignore = true)
    void updateEntity(VolunteerProfileRequest request, @MappingTarget VolunteerProfile profile);

    List<VolunteerProfileResponse> toResponseList(List<VolunteerProfile> profiles);

    Set<VolunteerProfileResponse> toResponseSet(Set<VolunteerProfile> profiles);

    default VolunteerStatsResponse createVolunteerStats(VolunteerProfile profile) {
        return VolunteerStatsResponse.builder()
                .totalEventsAttended(profile.getTotalEventsAttended())
                .totalVolunteerHours(profile.getTotalHoursVolunteered())
                .averageEventRating(profile.getAverageRating())
                .build();
    }

    default List<BadgeResponse> mapBadges(List<String> badges) {
        if (badges == null)
            return new ArrayList<>();
        return badges.stream()
                .map(badge -> BadgeResponse.builder().name(badge).build())
                .collect(Collectors.toList());
    }

    default List<SkillResponse> mapSkills(Set<String> skills) {
        if (skills == null)
            return new ArrayList<>();
        return skills.stream()
                .map(skill -> SkillResponse.builder().name(skill).build())
                .collect(Collectors.toList());
    }
}
