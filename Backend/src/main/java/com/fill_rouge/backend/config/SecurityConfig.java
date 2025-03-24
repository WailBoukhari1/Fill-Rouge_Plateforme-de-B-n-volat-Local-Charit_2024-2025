package com.fill_rouge.backend.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.fill_rouge.backend.config.security.JwtAuthenticationFilter;
import com.fill_rouge.backend.config.security.JwtConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtConfig jwtConfig;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        log.debug("Creating authentication manager");
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        log.debug("Creating authentication provider");
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.debug("Configuring security filter chain");
        
        http
                .cors(cors -> {
                    log.debug("Configuring CORS in security");
                    cors.configurationSource(corsConfigurationSource());
                })
                .csrf(csrf -> {
                    log.debug("Disabling CSRF protection for API endpoints");
                    csrf.disable();
                })
                .sessionManagement(session -> {
                    log.debug("Setting session management to STATELESS");
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                })
                .authorizeHttpRequests(authorize -> {
                    log.debug("Configuring HTTP authorization rules");
                    
                    // Permit all static resource paths
                    authorize.requestMatchers("/static/**", "/public/**", "/resources/**").permitAll();
                    
                    // Explicitly permit diagnostic endpoints for debugging
                    authorize.requestMatchers("/api/diagnostic/**").permitAll();
                    
                    // Permit file access
                    authorize.requestMatchers("/api/files/**", "/files/**").permitAll();
                    
                    // Permit auth endpoints and public APIs
                    authorize.requestMatchers("/api/auth/**", "/api/public/**",
                                            "/v3/api-docs/**", "/swagger-ui/**",
                                            "/swagger-ui.html", "/auth/**").permitAll();
                    
                    // Permit specific event endpoints that are public
                    authorize.requestMatchers("/api/events/upcoming", 
                                            "/api/events/registered", 
                                            "/api/events/waitlist").permitAll();
                    
                    // All other requests must be authenticated
                    authorize.anyRequest().authenticated();
                    
                    log.debug("HTTP authorization rules configured");
                })
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        log.info("Security filter chain configured successfully");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.debug("Creating CORS configuration source");
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "X-User-ID",
                "X-Organization-ID",
                "user-id",
                "organization-id"
        ));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-User-ID", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        log.debug("CORS configuration source created");
        return source;
    }

    @Bean
    public CorsFilter corsFilter() {
        log.debug("Creating CORS filter");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:3000"));
        config.setAllowedHeaders(Arrays.asList(
                "Origin",
                "Content-Type",
                "Accept",
                "Authorization",
                "X-Requested-With",
                "X-User-ID",
                "X-Organization-ID",
                "user-id",
                "organization-id"
        ));
        config.setExposedHeaders(Arrays.asList("Authorization", "X-User-ID", "Content-Disposition"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "OPTIONS", "DELETE", "PATCH"));
        source.registerCorsConfiguration("/**", config);
        log.debug("CORS filter created");
        return new CorsFilter(source);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        log.debug("Creating password encoder");
        return new BCryptPasswordEncoder();
    }
}