package com.youcode.volunteering.model.common;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Data
public abstract class BaseEntity {
    @Id
    private String id;
    
    @CreatedDate
    private LocalDateTime created;
    
    @LastModifiedDate
    private LocalDateTime updated;
} 