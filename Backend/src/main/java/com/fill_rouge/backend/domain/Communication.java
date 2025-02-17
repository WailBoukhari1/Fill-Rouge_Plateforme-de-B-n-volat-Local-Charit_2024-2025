package com.fill_rouge.backend.domain;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "communications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Communication {

    @Id
    private String id;

    @Field("sender_id")
    private String senderId;

    @Field("receiver_id")
    private String receiverId;

    private String content;

    private String title;

    @Field("type")
    private CommunicationType type;

    @Field("reference_id")
    private String referenceId;

    @Field("attachment_url")
    private String attachmentUrl;

    private boolean read;

    @Field("metadata")
    private Map<String, String> metadata;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    public enum CommunicationType {
        MESSAGE,
        NOTIFICATION,
        SYSTEM_ALERT
    }
} 