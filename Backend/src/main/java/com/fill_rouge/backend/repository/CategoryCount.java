package com.fill_rouge.backend.repository;

import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCount {
    @Field("_id")
    private String id;
    
    @Field("count")
    private Long count;
} 