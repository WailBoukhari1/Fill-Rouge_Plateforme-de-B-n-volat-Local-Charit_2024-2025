package com.fill_rouge.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

import com.mongodb.client.MongoClient;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;

@Configuration
public class MongoConfig {
    @Value("${spring.data.mongodb.database}")
    private String databaseName;

    @Bean
    public GridFSBucket gridFSBucket(MongoClient mongoClient) {
        return GridFSBuckets.create(mongoClient.getDatabase(databaseName));
    }
    
    @Bean
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        return new MongoTemplate(new SimpleMongoClientDatabaseFactory(mongoClient, databaseName));
    }
} 