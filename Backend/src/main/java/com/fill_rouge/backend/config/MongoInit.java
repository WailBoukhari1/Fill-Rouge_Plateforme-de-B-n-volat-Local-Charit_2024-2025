package com.fill_rouge.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class MongoInit implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Initializing MongoDB indexes");
            // Add any other manual index creation here if needed in the future
            log.info("Successfully initialized MongoDB indexes");
        } catch (Exception e) {
            log.error("Error initializing MongoDB indexes: {}", e.getMessage());
            // Don't throw the exception - allow the application to start even if index creation fails
        }
    }
} 