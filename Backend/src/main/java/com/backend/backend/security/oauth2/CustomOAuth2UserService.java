package com.backend.backend.security.oauth2;

import com.backend.backend.domain.model.User;
import com.backend.backend.domain.model.UserRole;
import com.backend.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String email = oAuth2User.getAttribute("email");
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createUser(email));
        Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
        attributes.put("user", user);
        return new DefaultOAuth2User(
            oAuth2User.getAuthorities(),
            attributes,
            "email"
        );
    }

    private User createUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setRole(UserRole.VOLUNTEER); 
        return userRepository.save(user);
    }
} 