package com.fill_rouge.backend.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "skills")
public class Skill {
    @Id
    private String id;
    private String name;
    private String description;
    private List<String> endorsements;
    
    public int getEndorsementCount() {
        return endorsements != null ? endorsements.size() : 0;
    }
    
    public String getName() {
        return name;
    }
} 