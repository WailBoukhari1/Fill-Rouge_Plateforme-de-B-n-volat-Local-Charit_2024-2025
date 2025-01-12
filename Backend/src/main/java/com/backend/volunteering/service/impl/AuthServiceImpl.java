package com.backend.volunteering.service.impl;

import com.backend.volunteering.dto.request.LoginRequest;
import com.backend.volunteering.dto.request.SignupRequest;
import com.backend.volunteering.dto.response.AuthResponse;
import com.backend.volunteering.exception.BadRequestException;
import com.backend.volunteering.exception.UserAlreadyExistsException;
import com.backend.volunteering.model.User;
import com.backend.volunteering.repository.UserRepository;
import com.backend.volunteering.security.JwtTokenProvider;
import com.backend.volunteering.security.TokenBlacklistService;
import com.backend.volunteering.service.interfaces.IAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserServiceImpl userService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        return generateAuthResponse(authentication);
    }

    @Override
    public AuthResponse signup(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new UserAlreadyExistsException("Email address already in use.");
        }

        User user = new User();
        user.setName(signupRequest.getName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.getRoles().add("USER");

        user = userRepository.save(user);

        // Send verification email
        userService.sendVerificationEmail(user);

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                signupRequest.getEmail(),
                signupRequest.getPassword()
            )
        );

        return generateAuthResponse(authentication);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String email = tokenProvider.getUserEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("User not found"));

        return new AuthResponse(
            tokenProvider.generateToken(user),
            tokenProvider.generateRefreshToken(user)
        );
    }

    @Override
    public void logout(String refreshToken) {
        if (tokenProvider.validateToken(refreshToken)) {
            tokenBlacklistService.blacklistToken(refreshToken);
        } else {
            throw new BadRequestException("Invalid refresh token");
        }
    }

    private AuthResponse generateAuthResponse(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String accessToken = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken);
    }
} 