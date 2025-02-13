package com.backend.backend.security.oauth2;

import com.backend.backend.model.User;
import com.backend.backend.model.UserRole;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String email = getEmail(oAuth2User);
        
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> registerNewUser(oAuth2User));

        Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
        attributes.put("user", user);
        
        return new DefaultOAuth2User(
            oAuth2User.getAuthorities(),
            attributes,
            "email"
        );
    }

    private User registerNewUser(OAuth2User oAuth2User) {
        User user = new User();
        user.setEmail(getEmail(oAuth2User));
        user.setFirstName(getAttributeOrDefault(oAuth2User, "given_name", ""));
        user.setLastName(getAttributeOrDefault(oAuth2User, "family_name", ""));
        user.setProfilePicture(getAttributeOrDefault(oAuth2User, "picture", null));
        user.setRole(UserRole.valueOf(SecurityConstants.ROLE_VOLUNTEER));
        user.setEmailVerified(true);
        user.setEnabled(true);
        
        return userRepository.save(user);
    }

    private String getEmail(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }
        return email;
    }

    private String getAttributeOrDefault(OAuth2User oAuth2User, String attribute, String defaultValue) {
        Object value = oAuth2User.getAttribute(attribute);
        return value != null ? value.toString() : defaultValue;
    }
} 