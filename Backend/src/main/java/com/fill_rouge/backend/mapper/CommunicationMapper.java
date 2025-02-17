package com.fill_rouge.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.fill_rouge.backend.domain.Communication;
import com.fill_rouge.backend.dto.response.MessageResponse;
import com.fill_rouge.backend.dto.response.NotificationResponse;

@Mapper(componentModel = "spring")
public interface CommunicationMapper {
    
    @Mapping(target = "timestamp", source = "createdAt")
    @Mapping(target = "messageId", source = "id")
    @Mapping(target = "status", expression = "java(getMessageStatus(communication))")
    MessageResponse toMessageResponse(Communication communication);
    
    @Mapping(target = "timestamp", source = "createdAt")
    @Mapping(target = "notificationId", source = "id")
    @Mapping(target = "status", expression = "java(getNotificationStatus(communication))")
    NotificationResponse toNotificationResponse(Communication communication);
    
    List<MessageResponse> toMessageResponseList(List<Communication> communications);
    List<NotificationResponse> toNotificationResponseList(List<Communication> communications);
    
    @Named("getMessageStatus")
    default String getMessageStatus(Communication communication) {
        return communication.isRead() ? "READ" : "UNREAD";
    }
    
    @Named("getNotificationStatus")
    default String getNotificationStatus(Communication communication) {
        return communication.isRead() ? "READ" : "UNREAD";
    }
} 