package com.backend.backend.mapper;

import com.backend.backend.domain.model.User;
import com.backend.backend.dto.request.RegisterRequest;
import com.backend.backend.dto.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "emailVerified", constant = "false")
    @Mapping(target = "profilePicture", ignore = true)
    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "skills", ignore = true)
    @Mapping(target = "interests", ignore = true)
    @Mapping(target = "location", ignore = true)
    @Mapping(target = "resetPasswordCode", ignore = true)
    @Mapping(target = "resetPasswordCodeExpiryDate", ignore = true)
    @Mapping(target = "verificationCode", ignore = true)
    @Mapping(target = "verificationCodeExpiryDate", ignore = true)
    User toEntity(RegisterRequest request);


    UserResponse toResponse(User user);
} 