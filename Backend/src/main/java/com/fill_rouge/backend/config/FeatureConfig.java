package com.fill_rouge.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "features")
@Data
public class FeatureConfig {
    private boolean emailVerification = true;
    private boolean rateLimiting = true;
    private boolean demoData = false;
} 