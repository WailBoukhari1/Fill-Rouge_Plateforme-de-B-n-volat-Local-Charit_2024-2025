package com.youcode.volunteering.mapper;

import com.youcode.volunteering.dto.auth.RegisterRequest;
import com.youcode.volunteering.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuthMapper {
    
    @Mapping(target = "email", source = "email")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "role", constant = "USER")
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "avatar", ignore = true)
    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "interests", ignore = true)
    @Mapping(target = "location", ignore = true)
    @Mapping(target = "metrics", ignore = true)
    @Mapping(target = "settings", ignore = true)
    @Mapping(target = "skills", ignore = true)
    @Mapping(target = "verification", ignore = true)
    User toUser(RegisterRequest registerRequest);
} 