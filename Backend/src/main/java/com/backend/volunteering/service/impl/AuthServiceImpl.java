package com.backend.volunteering.service.impl;

import com.backend.volunteering.dto.request.LoginRequest;
import com.backend.volunteering.dto.request.SignupRequest;
import com.backend.volunteering.dto.response.AuthResponse;
import com.backend.volunteering.exception.AuthenticationException;
import com.backend.volunteering.model.User;
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
    public AuthResponse signup(SignupRequest signupRequest) {
        try {
            if (userRepository.existsByEmail(signupRequest.getEmail())) {
                throw new ValidationException(
                    ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "Email is already registered",
                    "email"
                );
            }

            validatePassword(signupRequest.getPassword());

            User user = new User();
            user.setName(signupRequest.getName());
            user.setEmail(signupRequest.getEmail());
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            user.getRoles().add("USER");
            user.setEmailVerified(false);
            user.setEnabled(true);

            try {
                user = userRepository.save(user);
            } catch (DataIntegrityViolationException e) {
                throw new ValidationException(
                    ErrorCode.RESOURCE_CONFLICT,
                    "Database constraint violation",
                    "email"
                );
            }

            try {
                userService.sendVerificationEmail(user);
            } catch (Exception e) {
                log.error("Failed to send verification email", e);
                // Continue with signup even if email fails
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
            log.error("Signup error: ", e);
            throw new AuthenticationException(
                ErrorCode.INTERNAL_ERROR,
                "Registration failed"
            );
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

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new ValidationException(
                ErrorCode.PASSWORD_POLICY_VIOLATION,
                "Password must be at least 8 characters long",
                "password"
            );
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new ValidationException(
                ErrorCode.PASSWORD_POLICY_VIOLATION,
                "Password must contain at least one uppercase letter",
                "password"
            );
        }
        if (!password.matches(".*[a-z].*")) {
            throw new ValidationException(
                ErrorCode.PASSWORD_POLICY_VIOLATION,
                "Password must contain at least one lowercase letter",
                "password"
            );
        }
        if (!password.matches(".*\\d.*")) {
            throw new ValidationException(
                ErrorCode.PASSWORD_POLICY_VIOLATION,
                "Password must contain at least one number",
                "password"
            );
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new ValidationException(
                ErrorCode.PASSWORD_POLICY_VIOLATION,
                "Password must contain at least one special character",
                "password"
            );
        }
    }

    private AuthResponse generateAuthResponse(Authentication authentication) {
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        return new AuthResponse(accessToken, refreshToken);
    }
} 