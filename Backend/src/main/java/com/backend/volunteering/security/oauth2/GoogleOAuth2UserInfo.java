package com.backend.volunteering.security.oauth2;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GoogleOAuth2UserInfo extends DefaultOAuth2UserService {
    // Will implement OAuth2 user info service methods later
} 