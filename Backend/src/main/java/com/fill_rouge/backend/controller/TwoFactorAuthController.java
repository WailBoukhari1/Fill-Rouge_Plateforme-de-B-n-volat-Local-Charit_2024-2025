package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.dto.request.TwoFactorSetupRequest;
import com.fill_rouge.backend.dto.response.TwoFactorSetupResponse;
import com.fill_rouge.backend.service.auth.TwoFactorAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/2fa")
@RequiredArgsConstructor
public class TwoFactorAuthController {

    private final TwoFactorAuthService twoFactorAuthService;

    @PostMapping("/setup")
    public ResponseEntity<TwoFactorSetupResponse> setup(@AuthenticationPrincipal User user) {
        try {
            String secret = twoFactorAuthService.generateSecretKey(user);
            String qrCodeImage = twoFactorAuthService.generateQrCodeImageUri(secret, user.getEmail());

            TwoFactorSetupResponse response = new TwoFactorSetupResponse();
            response.setSecretKey(secret);
            response.setQrCodeImage(qrCodeImage);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup 2FA: " + e.getMessage());
        }
    }

    @PostMapping("/enable")
    public ResponseEntity<Void> enable(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TwoFactorSetupRequest request) {
        twoFactorAuthService.enableTwoFactorAuth(user, request.getVerificationCode());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/disable")
    public ResponseEntity<Void> disable(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TwoFactorSetupRequest request) {
        twoFactorAuthService.disableTwoFactorAuth(user, request.getVerificationCode());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verify(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TwoFactorSetupRequest request) {
        boolean isValid = twoFactorAuthService.validateCode(user, request.getVerificationCode());
        return ResponseEntity.ok(isValid);
    }
} 