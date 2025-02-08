package com.backend.backend.service.impl;

import com.backend.backend.domain.model.User;
import com.backend.backend.domain.model.UserRole;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.security.oauth2.CustomOAuth2UserService;
import com.backend.backend.service.interfaces.OAuth2Service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuth2ServiceImpl implements OAuth2Service {

    private final UserRepository userRepository;
    private final CustomOAuth2UserService oauth2UserService;
    private final OAuth2AuthorizedClientService authorizedClientService;

    @Override
    public OAuth2User processOAuthPostLogin(String authorizationCode) {
        // The OAuth2 flow is handled by Spring Security OAuth2 Client
        // We just need to process the user data
        OAuth2User oauth2User = oauth2UserService.loadUser(null);
        processUser(oauth2User);
        return oauth2User;
    }

    private User processUser(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        return userRepository.findByEmail(email)
            .orElseGet(() -> createNewUser(oauth2User));
    }

    private User createNewUser(OAuth2User oauth2User) {
        User user = new User();
        user.setEmail(oauth2User.getAttribute("email"));
        user.setRole(UserRole.VOLUNTEER);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }
} 