package com.backend.volunteering.security;

import com.backend.volunteering.service.interfaces.IEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
@RequiredArgsConstructor
public class TwoFactorAuthService {
    private final IEmailService emailService;
    private final ConcurrentHashMap<String, TwoFactorCode> pendingCodes = new ConcurrentHashMap<>();
    
    public void sendCode(String email) {
        String code = generateCode();
        log.info("Generated 2FA code for email: {}", email);
        pendingCodes.put(email, new TwoFactorCode(code, Instant.now().plusSeconds(300))); // 5 min expiry
        emailService.send2FACode(email, code);
    }
    
    public boolean verifyCode(String email, String code) {
        TwoFactorCode storedCode = pendingCodes.get(email);
        if (storedCode == null || storedCode.isExpired()) {
            log.error("Invalid or expired 2FA code for email: {}", email);
            return false;
        }
        boolean isValid = storedCode.code.equals(code);
        if (isValid) {
            pendingCodes.remove(email);
            log.info("2FA code verified for email: {}", email);
        } else {
            log.error("Invalid 2FA code for email: {}", email);
        }
        return isValid;
    }
    
    private String generateCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }
    
    private record TwoFactorCode(String code, Instant expiry) {
        boolean isExpired() {
            return Instant.now().isAfter(expiry);
        }
    }
}