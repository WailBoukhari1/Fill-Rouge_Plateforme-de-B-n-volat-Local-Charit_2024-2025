package com.fill_rouge.backend.config;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.IndexOptions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MongoInit implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Initializing MongoDB indexes");
            
            MongoCollection<Document> collection = mongoTemplate.getCollection("event_participations");
            
            // Create a unique compound index for volunteer-event participation
            IndexOptions indexOptions = new IndexOptions()
                .unique(true)
                .sparse(true)
                .name("volunteer_event_idx");
            
            collection.createIndex(
                new Document("volunteerId", 1)
                    .append("eventId", 1),
                indexOptions
            );
            
            log.info("Successfully created/updated volunteer_event_idx index on event_participations collection");
        } catch (Exception e) {
            log.error("Error initializing MongoDB indexes: {}", e.getMessage());
            // Don't throw the exception - allow the application to start even if index creation fails
            // The index might already exist with the same options
        }
    }
} 