package com.fill_rouge.backend.service.auth;

import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.repository.UserRepository;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class TwoFactorAuthService {
    private final UserRepository userRepository;
    private final SecretGenerator secretGenerator;
    private final CodeVerifier codeVerifier;

    @Transactional
    public String generateSecretKey(User user) {
        String secret = secretGenerator.generate();
        user.setTwoFactorSecret(secret);
        userRepository.save(user);
        return secret;
    }

    public String generateQrCodeImageUri(String secret, String email) throws QrGenerationException {
        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("Volunteer Platform")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        QrGenerator qrGenerator = new ZxingPngQrGenerator();
        byte[] imageData = qrGenerator.generate(data);
        return "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(imageData);
    }

    public boolean verifyCode(String secret, String code) {
        return codeVerifier.isValidCode(secret, code);
    }

    @Transactional
    public void enableTwoFactorAuth(User user, String code) {
        if (!verifyCode(user.getTwoFactorSecret(), code)) {
            throw new RuntimeException("Invalid 2FA code");
        }
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void disableTwoFactorAuth(User user, String code) {
        if (!verifyCode(user.getTwoFactorSecret(), code)) {
            throw new RuntimeException("Invalid 2FA code");
        }
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
    }

    public boolean validateCode(User user, String code) {
        if (!user.isTwoFactorEnabled()) {
            return true;
        }
        return verifyCode(user.getTwoFactorSecret(), code);
    }
} 