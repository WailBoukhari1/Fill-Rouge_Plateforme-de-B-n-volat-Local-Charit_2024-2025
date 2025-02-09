package com.backend.backend.service.interfaces;

import org.springframework.security.oauth2.core.user.OAuth2User;

public interface OAuth2Service {
    OAuth2User processOAuthPostLogin(String authorizationCode);
} 