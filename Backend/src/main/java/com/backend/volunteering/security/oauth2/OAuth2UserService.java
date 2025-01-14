package com.backend.volunteering.security.oauth2;

import com.backend.volunteering.model.User;
import com.backend.volunteering.model.enums.AuthProvider;
import com.backend.volunteering.model.enums.UserRole;
import com.backend.volunteering.model.enums.UserStatus;
import com.backend.volunteering.security.UserPrincipal;
import com.backend.volunteering.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = registerNewUser(oauth2User);
        } else {
            user = updateExistingUser(user, oauth2User);
        }
        
        return UserPrincipal.create(user, oauth2User.getAttributes());
    }

    private User registerNewUser(OAuth2User oauth2User) {
        User user = new User();
        user.setName(oauth2User.getAttribute("name"));
        user.setEmail(oauth2User.getAttribute("email"));
        user.setImageUrl(oauth2User.getAttribute("picture"));
        user.setProvider(AuthProvider.GOOGLE);
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private User updateExistingUser(User user, OAuth2User oauth2User) {
        user.setName(oauth2User.getAttribute("name"));
        user.setImageUrl(oauth2User.getAttribute("picture"));
        return userRepository.save(user);
    }
} 