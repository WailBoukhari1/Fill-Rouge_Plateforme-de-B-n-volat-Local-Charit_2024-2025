package com.fill_rouge.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/swagger-resources/**",
                    "/webjars/**",
                    "/api/swagger-ui/**",
                    "/api/swagger-ui.html",
                    "/api/v3/api-docs/**",
                    "/api/swagger-resources/**",
                    "/api/webjars/**",
                    "/api/actuator/**",
                    "/api/v3/api-docs/swagger-config",
                    "/api/v3/api-docs.yaml",
                    "/api/v3/api-docs.json"
                ).permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
} 