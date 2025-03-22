package com.fill_rouge.backend.service.event;

import java.util.Base64;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class EventDataProtectionService {

    @Value("${app.encryption.secret}")
    private String encryptionSecret;

    @Value("${app.encryption.salt}")
    private String encryptionSalt;

    private TextEncryptor encryptor;
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9]{10,15}$");

    @PostConstruct
    public void init() {
        this.encryptor = Encryptors.text(encryptionSecret, encryptionSalt);
    }

    public String maskEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            return email;
        }
        
        String[] parts = email.split("@");
        if (parts.length != 2) return email;
        
        String name = parts[0];
        String domain = parts[1];
        
        if (name.length() <= 2) return email;
        
        return name.substring(0, 2) + "***@" + domain;
    }

    public String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || !PHONE_PATTERN.matcher(phoneNumber).matches()) {
            return phoneNumber;
        }
        
        int length = phoneNumber.length();
        if (length <= 4) return phoneNumber;
        
        return "***" + phoneNumber.substring(length - 4);
    }

    public String encryptSensitiveData(String data) {
        if (data == null || data.trim().isEmpty()) {
            return data;
        }
        return encryptor.encrypt(data);
    }

    public String decryptSensitiveData(String encryptedData) {
        if (encryptedData == null || encryptedData.trim().isEmpty()) {
            return encryptedData;
        }
        return encryptor.decrypt(encryptedData);
    }

    public String sanitizeUserInput(String input) {
        if (input == null) {
            return null;
        }
        // Remove any potentially harmful characters
        return input.replaceAll("[<>\"'&]", "");
    }

    public boolean isPersonalData(String data) {
        if (data == null) {
            return false;
        }
        // Check if data matches patterns of personal information
        return EMAIL_PATTERN.matcher(data).matches() ||
               PHONE_PATTERN.matcher(data).matches() ||
               data.matches("^[0-9]{3}-[0-9]{2}-[0-9]{4}$"); // SSN pattern
    }

    public String hashSensitiveData(String data) {
        if (data == null) {
            return null;
        }
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(data.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash sensitive data", e);
        }
    }
} 