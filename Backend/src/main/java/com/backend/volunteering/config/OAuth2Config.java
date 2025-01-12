package com.backend.volunteering.config;

import com.backend.volunteering.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.backend.volunteering.security.oauth2.OAuth2AuthenticationSuccessHandler;
import com.backend.volunteering.security.JwtTokenProvider;
import com.backend.volunteering.security.oauth2.GoogleOAuth2UserInfo;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import lombok.RequiredArgsConstructor;

@Configuration
@Profile("prod")
@ConditionalOnProperty(prefix = "spring.security.oauth2", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class OAuth2Config {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    @Bean
    public OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler() {
        return new OAuth2AuthenticationFailureHandler();
    }

    @Bean
    public OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler() {
        return new OAuth2AuthenticationSuccessHandler(jwtTokenProvider);
    }

    @Bean
    public GoogleOAuth2UserInfo googleOAuth2UserService() {
        return new GoogleOAuth2UserInfo();
    }
} 