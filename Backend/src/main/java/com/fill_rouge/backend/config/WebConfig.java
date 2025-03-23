package com.fill_rouge.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        log.info("Configuring CORS mappings");
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
        log.info("CORS mappings configured successfully");
    }
    
    /**
     * Configure static resource handling to ensure API paths are not intercepted
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        log.info("Configuring resource handlers");
        
        // Add static resource handlers but explicitly AVOID handling /api/** paths
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600)
                .resourceChain(true);
                
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/")
                .setCachePeriod(3600);
                
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/")
                .setCachePeriod(3600);
                
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/")
                .setCachePeriod(3600);
                
        // Important: add a catch-all handler that has LOWER PRIORITY than API endpoints
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true);
                
        log.info("Resource handlers configured successfully");
    }
} 