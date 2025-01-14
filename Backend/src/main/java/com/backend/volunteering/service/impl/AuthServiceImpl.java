package com.backend.volunteering.service.impl;

import com.backend.volunteering.dto.request.LoginRequest;
import com.backend.volunteering.dto.request.SignupRequest;
import com.backend.volunteering.dto.response.AuthResponse;
import com.backend.volunteering.exception.AuthenticationException;
import com.backend.volunteering.model.User;
import com.backend.volunteering.model.enums.UserRole;
import com.backend.volunteering.model.enums.UserStatus;
import com.backend.volunteering.repository.UserRepository;
import com.backend.volunteering.security.JwtTokenProvider;
import com.backend.volunteering.security.TokenBlacklistService;
import com.backend.volunteering.security.UserPrincipal;
import com.backend.volunteering.service.interfaces.IAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.dao.DataIntegrityViolationException;
import com.backend.volunteering.exception.BaseException;
import com.backend.volunteering.exception.ErrorCode;
import com.backend.volunteering.exception.ResourceNotFoundException;
import com.backend.volunteering.exception.ValidationException;
import com.backend.volunteering.exception.BadRequestException;
import org.springframework.dao.DuplicateKeyException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements IAuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserServiceImpl userService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        try {
            String email = loginRequest.getLoginId();
            if (!email.contains("@")) {
                User user = userRepository.findByEmail(loginRequest.getLoginId())
                    .orElseThrow(() -> new AuthenticationException(
                        ErrorCode.INVALID_CREDENTIALS,
                        "Invalid email or password"
                    ));
                email = user.getEmail();
            }

            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    email,
                    loginRequest.getPassword()
                )
            );

            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(
                    ErrorCode.INVALID_CREDENTIALS,
                    "User not found"
                ));

            if (!user.isEmailVerified()) {
                throw new AuthenticationException(
                    ErrorCode.EMAIL_NOT_VERIFIED,
                    "Please verify your email before logging in"
                );
            }

            if (!user.isEnabled()) {
                throw new AuthenticationException(
                    ErrorCode.ACCOUNT_DISABLED,
                    "Your account has been disabled"
                );
            }

            return generateAuthResponse(authentication);
        } catch (BadCredentialsException e) {
            throw new AuthenticationException(
                ErrorCode.INVALID_CREDENTIALS,
                "Invalid email or password"
            );
        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            log.error("Login error: ", e);
            throw new AuthenticationException(
                ErrorCode.INTERNAL_ERROR,
                "Authentication failed"
            );
        }
    }

    @Override
    public AuthResponse signup(SignupRequest request) {
        log.info("Processing signup request for email: {}", request.getEmail());
        
        try {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(UserRole.USER);
            user.setStatus(UserStatus.PENDING);
            
            user = userRepository.save(user);
            
            // Async email sending
            userService.sendVerificationEmail(user);
            
            String accessToken = tokenProvider.generateAccessToken(user);
            String refreshToken = tokenProvider.generateRefreshToken(user);
            
            return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
            
        } catch (DuplicateKeyException e) {
            log.error("Duplicate key error during registration", e);
            throw new BadRequestException("Email already registered");
        } catch (Exception e) {
            log.error("Error during registration", e);
            throw new RuntimeException("Registration failed");
        }
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        try {
            if (!tokenProvider.validateToken(refreshToken)) {
                throw new AuthenticationException(
                    ErrorCode.INVALID_TOKEN,
                    "Invalid refresh token"
                );
            }

            String email = tokenProvider.getUserEmailFromToken(refreshToken);
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

            if (!user.isEnabled()) {
                throw new AuthenticationException(
                    ErrorCode.ACCOUNT_DISABLED,
                    "Account is disabled"
                );
            }

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                UserPrincipal.create(user),
                null,
                user.getAuthorities()
            );

            return generateAuthResponse(authentication);
        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            log.error("Token refresh error: ", e);
            throw new AuthenticationException(
                ErrorCode.INTERNAL_ERROR,
                "Failed to refresh token"
            );
        }
    }

    @Override
    public void logout(String refreshToken) {
        try {
            if (!tokenProvider.validateToken(refreshToken)) {
                throw new AuthenticationException(
                    ErrorCode.INVALID_TOKEN,
                    "Invalid refresh token"
                );
            }
            tokenBlacklistService.blacklistToken(refreshToken);
        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            log.error("Logout error: ", e);
            throw new AuthenticationException(
                ErrorCode.INTERNAL_ERROR,
                "Logout failed"
            );
        }
    }
    private AuthResponse generateAuthResponse(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
        
        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);
        
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .build();
    }
} 