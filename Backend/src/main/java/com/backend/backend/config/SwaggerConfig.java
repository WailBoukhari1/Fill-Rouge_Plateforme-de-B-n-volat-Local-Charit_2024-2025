package com.backend.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI volunteerPlatformAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Volunteer Platform API")
                        .description("API documentation for the Local Volunteering and Charity Platform")
                        .version("1.0.0"));
    }
}