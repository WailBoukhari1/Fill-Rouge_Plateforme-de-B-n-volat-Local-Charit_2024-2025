package com.fill_rouge.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.fill_rouge.backend.service.resource.FileStorageService;
import com.fill_rouge.backend.service.resource.ResourceCleanupService;
import com.fill_rouge.backend.service.resource.ResourceVersionManager;

@Configuration
@EnableScheduling
public class ResourceConfig {
    
    @Bean
    public ResourceStorageProperties resourceStorageProperties() {
        return new ResourceStorageProperties();
    }
    
    @Bean
    public ResourceVersionManager resourceVersionManager(ResourceLoader resourceLoader) {
        return new ResourceVersionManager(resourceLoader);
    }
    
    @Bean
    public ResourceCleanupService resourceCleanupService(
            ResourceStorageProperties properties,
            FileStorageService fileStorageService,
            ResourceVersionManager versionManager) {
        return new ResourceCleanupService(properties, fileStorageService, versionManager);
    }
    
    @Bean
    public FileStorageService fileStorageService(ResourceStorageProperties properties) {
        return new FileStorageService(properties);
    }
} 