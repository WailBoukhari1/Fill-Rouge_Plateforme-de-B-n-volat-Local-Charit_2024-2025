package com.fill_rouge.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.UUID;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Service
public class EventRegistrationService {

    @Autowired
    private EventAuditService auditService;

    public String generateCheckInCode(String eventId, String userId) {
        String timeBasedCode = generateTimeBasedCode(eventId, userId);
        return generateQRCode(timeBasedCode);
    }

    public boolean validateCheckInCode(String eventId, String userId, String providedCode) {
        String expectedCode = generateTimeBasedCode(eventId, userId);
        return expectedCode.equals(providedCode);
    }

    private String generateTimeBasedCode(String eventId, String userId) {
        // Generate a code that's valid for the current hour
        LocalDateTime now = LocalDateTime.now();
        String timeComponent = String.format("%d-%d-%d-%d", 
            now.getYear(), now.getMonthValue(), now.getDayOfMonth(), now.getHour());
        
        // Combine event, user, and time data
        String data = String.format("%s:%s:%s:%s", eventId, userId, timeComponent, UUID.randomUUID().toString());
        
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes());
            return Base64.getUrlEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to generate check-in code", e);
        }
    }

    private String generateQRCode(String content) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 200, 200);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    public void processCheckIn(String eventId, String userId, String checkInCode) {
        if (!validateCheckInCode(eventId, userId, checkInCode)) {
            throw new IllegalArgumentException("Invalid check-in code");
        }
        
        // Log the successful check-in
        auditService.logParticipantCheckIn(eventId, userId, "Event check-in");
    }

    public void markAsNoShow(String eventId, String userId, String reason) {
        // Log the no-show
        auditService.logParticipantNoShow(eventId, userId, reason);
    }

    public void awardPoints(String eventId, String userId, int points, String comment) {
        // Validate points
        if (points < 0 || points > 100) {
            throw new IllegalArgumentException("Invalid points value");
        }
        
        // Log the points awarded
        auditService.logPointsAwarded(eventId, userId, points);
    }
} 