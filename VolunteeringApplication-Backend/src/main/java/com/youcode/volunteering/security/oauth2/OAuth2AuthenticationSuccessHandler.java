package com.youcode.volunteering.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.youcode.volunteering.security.jwt.JwtService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException {
        OAuth2UserPrincipal oauth2User = (OAuth2UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(oauth2User.getUser());
        
        getRedirectStrategy().sendRedirect(request, response, 
            "http://localhost:4200/auth/oauth2/success?token=" + token);
    }
} 