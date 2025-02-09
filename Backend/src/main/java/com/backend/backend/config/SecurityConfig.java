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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import com.backend.backend.security.oauth2.CustomOAuth2UserService;

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
    private final CustomAuthenticationProvider customAuthenticationProvider;
    private final CustomOAuth2UserService oauth2UserService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

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
            .cors(cors -> cors.configure(http))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(unauthorizedHandler)
                .accessDeniedHandler(accessDeniedHandler))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(customAuthenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authorization -> authorization
                    .baseUri("/api/auth/oauth2/authorize"))
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/api/auth/oauth2/callback/*"))
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oauth2UserService))
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/organizations/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/volunteers/**").permitAll()
                
                // Admin only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/organizations/*/verify").hasRole("ADMIN")
                
                // Organization endpoints
                .requestMatchers(HttpMethod.POST, "/api/events").hasRole("ORGANIZATION")
                .requestMatchers(HttpMethod.PUT, "/api/events/*").hasRole("ORGANIZATION")
                .requestMatchers(HttpMethod.DELETE, "/api/events/*").hasRole("ORGANIZATION")
                .requestMatchers(HttpMethod.PATCH, "/api/events/*/publish").hasRole("ORGANIZATION")
                .requestMatchers(HttpMethod.PATCH, "/api/events/*/cancel").hasRole("ORGANIZATION")
                
                // Volunteer endpoints
                .requestMatchers(HttpMethod.POST, "/api/volunteers/**").hasRole("VOLUNTEER")
                .requestMatchers(HttpMethod.PUT, "/api/volunteers/**").hasRole("VOLUNTEER")
                .requestMatchers(HttpMethod.DELETE, "/api/volunteers/**").hasRole("VOLUNTEER")
                
                // Add OAuth2 endpoints to permitted URLs
                .requestMatchers("/api/auth/oauth2/**").permitAll()
                
                // Default
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(
            googleClientRegistration()
            // Add more providers here as needed
        );
    }

    private ClientRegistration googleClientRegistration() {
        return CommonOAuth2Provider.GOOGLE.getBuilder("google")
            .clientId(googleClientId)
            .clientSecret(googleClientSecret)
            .scope("email", "profile")
            .build();
    }
} 