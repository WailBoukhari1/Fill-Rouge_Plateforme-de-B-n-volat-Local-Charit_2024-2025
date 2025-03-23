package com.fill_rouge.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;

import com.fill_rouge.backend.config.FeatureConfig;
import com.fill_rouge.backend.config.security.JwtConfig;

@SpringBootApplication
@EnableWebSecurity
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties({JwtConfig.class, FeatureConfig.class})
@ServletComponentScan
@Slf4j
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(BackendApplication.class);
        application.setAllowBeanDefinitionOverriding(true);
        application.run(args);
    }
    
    @PostConstruct
    public void logApplicationStartup() {
        log.info("===========================================");
        log.info("Application started with servlet context path: /api");
        log.info("All REST controllers should be accessible under /api/*");
        log.info("===========================================");
    }
    
    @Bean
    public ServletWebServerFactory servletWebServerFactory() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();
        tomcat.setContextPath("/api");
        log.info("Configured Tomcat with context path: /api");
        return tomcat;
    }
}
