package com.backend.backend.service.interfaces;

import com.backend.backend.domain.model.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface OAuth2Service {
    OAuth2User processOAuthPostLogin(String authorizationCode);
} 