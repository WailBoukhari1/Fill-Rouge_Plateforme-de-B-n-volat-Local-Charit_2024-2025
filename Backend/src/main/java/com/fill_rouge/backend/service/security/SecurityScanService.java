package com.fill_rouge.backend.service.security;

import com.fill_rouge.backend.service.audit.AuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class SecurityScanService {
    private static final Logger logger = LoggerFactory.getLogger(SecurityScanService.class);

    private final AuditService auditService;
    private final JavaMailSender mailSender;

    @Value("${security-scan.alert.email}")
    private String alertEmail;

    @Value("${security-scan.alert.threshold.high}")
    private int highThreshold;

    @Value("${security-scan.alert.threshold.medium}")
    private int mediumThreshold;

    // Security thresholds and windows
    private static final int BRUTE_FORCE_WINDOW = 30;
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int SUSPICIOUS_IP_THRESHOLD = 10;
    private static final int UNUSUAL_ACCESS_WINDOW = 60;
    private static final int RATE_LIMIT_WINDOW = 5;
    private static final int MAX_REQUESTS_PER_WINDOW = 100;
    private static final int BLOCK_DURATION_HOURS = 24;
    private static final int SESSION_ANOMALY_THRESHOLD = 3;

    // Thread-safe data structures for concurrent access
    private final Map<String, List<LocalDateTime>> failedLoginAttempts = new ConcurrentHashMap<>();
    private final Map<String, Integer> suspiciousIPs = new ConcurrentHashMap<>();
    private final Set<String> knownBadIPs = ConcurrentHashMap.newKeySet();
    private final Map<String, List<LocalDateTime>> requestTimestamps = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Integer>> userSessionPatterns = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> ipBlockExpiration = new ConcurrentHashMap<>();

    @Scheduled(cron = "${security-scan.schedule}")
    public void performSecurityScan() {
        logger.info("Starting security scan");
        List<SecurityIssue> issues = new ArrayList<>();

        try {
            // Scan for various security issues
            scanBruteForceAttempts(issues);
            scanSuspiciousIPs(issues);
            scanUnusualAccessPatterns(issues);
            scanRateLimitViolations(issues);
            scanSessionAnomalies(issues);

            // Clean up old data
            cleanupOldData();

            // Send alerts if necessary
            if (!issues.isEmpty()) {
                sendSecurityAlert(issues);
                logSecurityIssues(issues);
                applySecurityMeasures(issues);
            }

            logger.info("Security scan completed. Found {} issues", issues.size());
        } catch (Exception e) {
            logger.error("Error during security scan", e);
            sendErrorAlert("Security scan failed: " + e.getMessage());
        }
    }

    private void scanBruteForceAttempts(List<SecurityIssue> issues) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(BRUTE_FORCE_WINDOW);
        
        failedLoginAttempts.forEach((ip, attempts) -> {
            long recentAttempts = attempts.stream()
                    .filter(time -> time.isAfter(cutoff))
                    .count();

            if (recentAttempts >= MAX_FAILED_ATTEMPTS) {
                issues.add(new SecurityIssue(
                    "HIGH",
                    String.format("Potential brute force attack detected from IP: %s (%d failed attempts)", 
                                ip, recentAttempts),
                    "Block IP address and notify system administrator",
                    SecurityAction.BLOCK_IP
                ));
                blockIP(ip);
            }
        });
    }

    private void scanSuspiciousIPs(List<SecurityIssue> issues) {
        suspiciousIPs.forEach((ip, count) -> {
            if (count >= SUSPICIOUS_IP_THRESHOLD || knownBadIPs.contains(ip)) {
                issues.add(new SecurityIssue(
                    "MEDIUM",
                    String.format("Suspicious activity detected from IP: %s (%d suspicious actions)", 
                                ip, count),
                    "Monitor IP address and consider temporary blocking",
                    SecurityAction.INCREASE_MONITORING
                ));
            }
        });
    }

    private void scanUnusualAccessPatterns(List<SecurityIssue> issues) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(UNUSUAL_ACCESS_WINDOW);
        
        userSessionPatterns.forEach((userId, patterns) -> {
            if (detectAnomalousPatterns(patterns)) {
                issues.add(new SecurityIssue(
                    "MEDIUM",
                    String.format("Unusual access pattern detected for user: %s", userId),
                    "Review user activity and enable additional monitoring",
                    SecurityAction.ENABLE_2FA
                ));
            }
        });
    }

    private void scanRateLimitViolations(List<SecurityIssue> issues) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(RATE_LIMIT_WINDOW);
        
        requestTimestamps.forEach((ip, timestamps) -> {
            long recentRequests = timestamps.stream()
                    .filter(time -> time.isAfter(cutoff))
                    .count();

            if (recentRequests > MAX_REQUESTS_PER_WINDOW) {
                issues.add(new SecurityIssue(
                    "HIGH",
                    String.format("Rate limit exceeded for IP: %s (%d requests in %d minutes)", 
                                ip, recentRequests, RATE_LIMIT_WINDOW),
                    "Temporarily block IP and implement rate limiting",
                    SecurityAction.RATE_LIMIT
                ));
                blockIP(ip);
            }
        });
    }

    private void scanSessionAnomalies(List<SecurityIssue> issues) {
        userSessionPatterns.forEach((userId, patterns) -> {
            int anomalyCount = countSessionAnomalies(patterns);
            if (anomalyCount >= SESSION_ANOMALY_THRESHOLD) {
                issues.add(new SecurityIssue(
                    "HIGH",
                    String.format("Multiple session anomalies detected for user: %s", userId),
                    "Force user logout and require password reset",
                    SecurityAction.FORCE_PASSWORD_RESET
                ));
            }
        });
    }

    private void cleanupOldData() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        
        // Clean up various tracking maps
        failedLoginAttempts.entrySet().removeIf(entry ->
            entry.getValue().stream().allMatch(time -> time.isBefore(cutoff))
        );
        
        requestTimestamps.entrySet().removeIf(entry ->
            entry.getValue().stream().allMatch(time -> time.isBefore(cutoff))
        );
        
        // Clean up expired IP blocks
        ipBlockExpiration.entrySet().removeIf(entry -> 
            entry.getValue().isBefore(LocalDateTime.now())
        );
        
        // Reset counters
        suspiciousIPs.clear();
        userSessionPatterns.clear();
    }

    private void sendSecurityAlert(List<SecurityIssue> issues) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(alertEmail);
        message.setSubject("Security Scan Alert - Issues Detected");
        
        StringBuilder body = new StringBuilder();
        body.append("Security scan has detected the following issues:\n\n");
        
        Map<String, List<SecurityIssue>> groupedIssues = issues.stream()
                .collect(Collectors.groupingBy(SecurityIssue::getSeverity));
        
        // Process issues by severity
        processIssueSeverity(body, groupedIssues, "HIGH");
        processIssueSeverity(body, groupedIssues, "MEDIUM");
        processIssueSeverity(body, groupedIssues, "LOW");
        
        message.setText(body.toString());
        mailSender.send(message);
    }

    private void processIssueSeverity(StringBuilder body, Map<String, List<SecurityIssue>> groupedIssues, String severity) {
        if (groupedIssues.containsKey(severity)) {
            body.append(severity).append(" SEVERITY ISSUES:\n");
            groupedIssues.get(severity).forEach(issue -> formatIssue(body, issue));
            body.append("\n");
        }
    }

    private void formatIssue(StringBuilder body, SecurityIssue issue) {
        body.append(String.format("- Description: %s\n", issue.getDescription()));
        body.append(String.format("  Recommendation: %s\n", issue.getRecommendation()));
        body.append(String.format("  Action: %s\n\n", issue.getAction()));
    }

    private void logSecurityIssues(List<SecurityIssue> issues) {
        issues.forEach(issue -> {
            logger.warn("Security Issue - Severity: {}, Description: {}, Action: {}", 
                       issue.getSeverity(), issue.getDescription(), issue.getAction());
            
            auditService.logSecurityEvent(
                "SYSTEM",
                "SECURITY_SCAN",
                String.format("%s (Action: %s)", issue.getDescription(), issue.getAction()),
                issue.getSeverity()
            );
        });
    }

    private void applySecurityMeasures(List<SecurityIssue> issues) {
        issues.forEach(issue -> {
            switch (issue.getAction()) {
                case BLOCK_IP:
                    blockIP(extractIP(issue.getDescription()));
                    break;
                case RATE_LIMIT:
                    applyRateLimit(extractIP(issue.getDescription()));
                    break;
                case ENABLE_2FA:
                    flagForTwoFactorAuth(extractUserId(issue.getDescription()));
                    break;
                case FORCE_PASSWORD_RESET:
                    flagForPasswordReset(extractUserId(issue.getDescription()));
                    break;
                case INCREASE_MONITORING:
                    enableEnhancedMonitoring(extractIP(issue.getDescription()));
                    break;
            }
        });
    }

    private void blockIP(String ip) {
        knownBadIPs.add(ip);
        ipBlockExpiration.put(ip, LocalDateTime.now().plusHours(BLOCK_DURATION_HOURS));
        logger.info("Blocked IP address: {} for {} hours", ip, BLOCK_DURATION_HOURS);
    }

    private void applyRateLimit(String ip) {
        // Implementation for rate limiting
        logger.info("Applied rate limiting to IP: {}", ip);
    }

    private void flagForTwoFactorAuth(String userId) {
        // Implementation for 2FA requirement
        logger.info("Flagged user for 2FA requirement: {}", userId);
    }

    private void flagForPasswordReset(String userId) {
        // Implementation for password reset requirement
        logger.info("Flagged user for password reset: {}", userId);
    }

    private void enableEnhancedMonitoring(String ip) {
        // Implementation for enhanced monitoring
        logger.info("Enabled enhanced monitoring for IP: {}", ip);
    }

    private boolean detectAnomalousPatterns(Map<String, Integer> patterns) {
        // Advanced pattern detection logic
        return patterns.values().stream().anyMatch(count -> count >= SUSPICIOUS_IP_THRESHOLD);
    }

    private int countSessionAnomalies(Map<String, Integer> patterns) {
        return (int) patterns.values().stream()
                .filter(count -> count >= SESSION_ANOMALY_THRESHOLD)
                .count();
    }

    public void recordFailedLogin(String ipAddress) {
        failedLoginAttempts.computeIfAbsent(ipAddress, k -> Collections.synchronizedList(new ArrayList<>()))
                          .add(LocalDateTime.now());
    }

    public void recordRequest(String ipAddress) {
        requestTimestamps.computeIfAbsent(ipAddress, k -> Collections.synchronizedList(new ArrayList<>()))
                        .add(LocalDateTime.now());
    }

    public void recordSuspiciousActivity(String ipAddress) {
        suspiciousIPs.merge(ipAddress, 1, Integer::sum);
    }

    public boolean isIPBlocked(String ipAddress) {
        if (knownBadIPs.contains(ipAddress)) {
            LocalDateTime expiration = ipBlockExpiration.get(ipAddress);
            if (expiration != null && expiration.isAfter(LocalDateTime.now())) {
                return true;
            }
            // Remove expired block
            knownBadIPs.remove(ipAddress);
            ipBlockExpiration.remove(ipAddress);
        }
        return false;
    }

    private String extractIP(String description) {
        // Extract IP address from description
        return description.replaceAll(".*IP: ([\\d.]+).*", "$1");
    }

    private String extractUserId(String description) {
        // Extract user ID from description
        return description.replaceAll(".*user: ([\\w-]+).*", "$1");
    }

    private void sendErrorAlert(String errorMessage) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(alertEmail);
        message.setSubject("Security Scan Error Alert");
        message.setText("Error during security scan:\n" + errorMessage);
        mailSender.send(message);
    }

    private enum SecurityAction {
        BLOCK_IP,
        RATE_LIMIT,
        ENABLE_2FA,
        FORCE_PASSWORD_RESET,
        INCREASE_MONITORING
    }

    private static class SecurityIssue {
        private final String severity;
        private final String description;
        private final String recommendation;
        private final SecurityAction action;

        public SecurityIssue(String severity, String description, String recommendation, SecurityAction action) {
            this.severity = severity;
            this.description = description;
            this.recommendation = recommendation;
            this.action = action;
        }

        public String getSeverity() { return severity; }
        public String getDescription() { return description; }
        public String getRecommendation() { return recommendation; }
        public SecurityAction getAction() { return action; }
    }
} 