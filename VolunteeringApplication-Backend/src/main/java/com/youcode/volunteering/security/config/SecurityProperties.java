package com.youcode.volunteering.security.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "spring.security")
public class SecurityProperties {
    private Jwt jwt = new Jwt();
    private OAuth2 oauth2 = new OAuth2();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long expiration;
    }

    @Getter
    @Setter
    public static class OAuth2 {
        private String successUrl = "http://localhost:4200/auth/oauth2/success";
        private String failureUrl = "http://localhost:4200/auth/oauth2/failure";
    }
} 