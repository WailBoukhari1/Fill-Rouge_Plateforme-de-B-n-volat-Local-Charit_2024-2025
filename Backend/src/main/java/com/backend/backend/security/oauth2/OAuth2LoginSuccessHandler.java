package com.backend.backend.security.oauth2;

import com.backend.backend.security.jwt.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final ObjectMapper objectMapper;

    @Value("${app.oauth2.success-url}")
    private String successUrl;

    @Value("${app.oauth2.failure-url}")
    private String failureUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private List<String> getAuthorizedRedirectUris() {
        return Arrays.asList(
            frontendUrl + "/oauth2/success",
            frontendUrl + "/oauth2/failure",
            frontendUrl + "/oauth2/redirect"
        );
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    @Override
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, 
            Authentication authentication) {
        String targetUrl = request.getParameter("redirect_uri");
        
        if (targetUrl != null && !getAuthorizedRedirectUris().contains(targetUrl)) {
            return UriComponentsBuilder.fromUriString(failureUrl)
                    .queryParam("error", "unauthorized_redirect")
                    .build().toUriString();
        }

        String redirectUri = targetUrl != null ? targetUrl : successUrl;
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(
            tokenProvider.getEmailFromToken(accessToken)
        );

        return UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();
    }
} 