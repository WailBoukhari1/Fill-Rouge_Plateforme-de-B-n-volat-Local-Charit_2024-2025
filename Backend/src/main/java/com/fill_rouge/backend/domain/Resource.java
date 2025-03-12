package com.fill_rouge.backend.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Document(collection = "resources")
@NoArgsConstructor
@AllArgsConstructor
public class Resource {
    @Id
    private String id;
    
    @DBRef
    private Organization organization;
    
    private String name;
    private String description;
    private String type;
    private String url;
} 