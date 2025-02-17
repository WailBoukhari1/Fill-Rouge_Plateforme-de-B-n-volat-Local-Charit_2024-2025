package com.fill_rouge.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TwoFactorSetupResponse {
    private String secretKey;
    private String qrCodeImage;
    
    @Builder.Default
    private boolean setupComplete = false;
    
    @Builder.Default
    private String recoveryCode = null;
    
    @Builder.Default
    private String authenticatorType = "GOOGLE_AUTHENTICATOR";
    
    @Builder.Default
    private int codeLength = 6;
    
    @Builder.Default
    private int validityPeriod = 30;

    public static TwoFactorSetupResponse createSetupResponse(String secretKey, String qrCodeImage) {
        return TwoFactorSetupResponse.builder()
                .secretKey(secretKey)
                .qrCodeImage(qrCodeImage)
                .build();
    }

    public static TwoFactorSetupResponse createCompletedSetupResponse(String secretKey, String qrCodeImage, String recoveryCode) {
        return TwoFactorSetupResponse.builder()
                .secretKey(secretKey)
                .qrCodeImage(qrCodeImage)
                .recoveryCode(recoveryCode)
                .setupComplete(true)
                .build();
    }

    public String getFormattedSecretKey() {
        if (secretKey == null) return null;
        
        // Format secret key in groups of 4 for better readability
        StringBuilder formatted = new StringBuilder();
        for (int i = 0; i < secretKey.length(); i++) {
            if (i > 0 && i % 4 == 0) {
                formatted.append(" ");
            }
            formatted.append(secretKey.charAt(i));
        }
        return formatted.toString();
    }

    public String getSetupInstructions() {
        return """
            1. Install Google Authenticator or a compatible 2FA app
            2. Scan the QR code or enter the secret key manually
            3. Enter the 6-digit code from your authenticator app
            4. Store your recovery code in a safe place
            """;
    }

    public boolean isQrCodeAvailable() {
        return qrCodeImage != null && !qrCodeImage.isEmpty();
    }

    public boolean hasRecoveryCode() {
        return recoveryCode != null && !recoveryCode.isEmpty();
    }
} 