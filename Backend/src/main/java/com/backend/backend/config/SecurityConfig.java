package com.backend.backend.config;

import com.backend.backend.security.CustomAuthenticationProvider;
import com.backend.backend.security.jwt.JwtAuthenticationFilter;
import com.backend.backend.security.jwt.JwtAuthenticationEntryPoint;
import com.backend.backend.security.handler.CustomAccessDeniedHandler;
import com.backend.backend.security.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(unauthorizedHandler)
                .accessDeniedHandler(accessDeniedHandler))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Admin only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/organizations/*/verify").hasRole("ADMIN")
                
                // Organization endpoints
                .requestMatchers(HttpMethod.POST, "/api/events").hasRole("ORGANIZATION")
                .requestMatchers(HttpMethod.PUT, "/api/events/*").hasRole("ORGANIZATION")
                .requestMatchers(HttpMethod.DELETE, "/api/events/*").hasRole("ORGANIZATION")
                .requestMatchers(HttpMethod.PATCH, "/api/events/*/publish").hasRole("ORGANIZATION")
                .requestMatchers(HttpMethod.PATCH, "/api/events/*/cancel").hasRole("ORGANIZATION")
                
                // Mixed access endpoints
                .requestMatchers(HttpMethod.GET, "/api/events/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/organizations/**").authenticated()
                
                // Volunteer endpoints
                .requestMatchers("/api/volunteers/**").hasRole("VOLUNTEER")
                
                // Default
                .anyRequest().authenticated()
            );

        return http.build();
    }
} 