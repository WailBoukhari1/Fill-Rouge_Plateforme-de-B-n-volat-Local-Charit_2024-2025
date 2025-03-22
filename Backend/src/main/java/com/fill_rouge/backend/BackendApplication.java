package com.fill_rouge.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import com.fill_rouge.backend.config.FeatureConfig;
import com.fill_rouge.backend.config.security.JwtConfig;

@SpringBootApplication
@EnableWebSecurity
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties({JwtConfig.class, FeatureConfig.class})
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(BackendApplication.class);
        application.setAllowBeanDefinitionOverriding(true);
        application.run(args);
    }
}
