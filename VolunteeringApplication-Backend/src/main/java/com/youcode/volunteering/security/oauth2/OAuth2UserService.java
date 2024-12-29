package com.youcode.volunteering.security.oauth2;

import com.youcode.volunteering.model.Role;
import com.youcode.volunteering.model.User;
import com.youcode.volunteering.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createUser(email, name));
                
        return new OAuth2UserPrincipal(user, oAuth2User.getAttributes());
    }

    private User createUser(String email, String name) {
        String[] names = name.split(" ", 2);
        User user = User.builder()
                .email(email)
                .firstName(names[0])
                .lastName(names.length > 1 ? names[1] : "")
                .role(Role.USER)
                .enabled(true)
                .build();
        
        return userRepository.save(user);
    }
} 