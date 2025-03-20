package com.fill_rouge.backend.config.security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.fill_rouge.backend.domain.Organization;
import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.repository.OrganizationRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    private final JwtConfig jwtConfig;
    private final Key signingKey;
    private final OrganizationRepository organizationRepository;

    public JwtService(JwtConfig jwtConfig, OrganizationRepository organizationRepository) {
        this.jwtConfig = jwtConfig;
        this.signingKey = Keys.hmacShaKeyFor(jwtConfig.getSecretKey().getBytes());
        this.organizationRepository = organizationRepository;
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getExpiration());
        
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("sub", userDetails.getUsername());
        claims.put("created", now);
        
        if (userDetails instanceof User) {
            User user = (User) userDetails;
            logger.debug("Generating token for user: {} with role: {}", user.getEmail(), user.getRole());
            
            // Ensure role is not null before adding to claims
            if (user.getRole() != null) {
                claims.put("role", "ROLE_" + user.getRole().name());
                claims.put("needs_questionnaire", user.getRole() == com.fill_rouge.backend.constant.Role.UNASSIGNED);
                claims.put("can_access_questionnaire", user.getRole() == com.fill_rouge.backend.constant.Role.UNASSIGNED);
            } else {
                claims.put("role", "ROLE_UNASSIGNED");
                claims.put("needs_questionnaire", true);
                claims.put("can_access_questionnaire", true);
            }
            
            claims.put("email_verified", user.isEmailVerified());
            claims.put("questionnaire_completed", user.isQuestionnaireCompleted());
            claims.put("user_id", user.getId());
            claims.put("first_name", user.getFirstName());
            claims.put("last_name", user.getLastName());
            
            // Add organization ID to claims if user is an organization
            if (user.getRole() == com.fill_rouge.backend.constant.Role.ORGANIZATION) {
                organizationRepository.findByUserId(user.getId())
                    .ifPresent(organization -> {
                        claims.put("organization_id", organization.getId());
                        logger.debug("Added organization ID to token: {}", organization.getId());
                    });
            }
            
            logger.debug("Token claims: {}", claims);
        } else {
            // Fallback for non-User UserDetails implementations
            claims.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        }

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getRefreshToken().getExpiration());

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("role", userDetails.getAuthorities().iterator().next().getAuthority())
                .claim("tokenType", "REFRESH")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            final Claims claims = extractAllClaims(token);
            
            // Validate token type (not refresh token)
            if ("REFRESH".equals(claims.get("tokenType"))) {
                logger.warn("Attempted to use refresh token as access token");
                return false;
            }

            // Check token hasn't expired and username matches
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
            
            if (!isValid) {
                logger.warn("Token validation failed for user: {}", username);
            }
            
            return isValid;
        } catch (Exception e) {
            logger.error("Error validating token: {}", e.getMessage());
            return false;
        }
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            final Claims claims = extractAllClaims(token);
            
            // Validate token type
            if (!"REFRESH".equals(claims.get("tokenType"))) {
                logger.warn("Attempted to use access token as refresh token");
                return false;
            }

            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            logger.error("Error validating refresh token: {}", e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUserId(String token) {
        // In our implementation, we don't store the user ID in the token
        // We use the username (email) to look up the user
        // This method is provided for compatibility with the controller
        return extractUsername(token);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String getOrganizationIdFromToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }
        
        User user = (User) authentication.getPrincipal();
        return organizationRepository.findByUserId(user.getId())
            .map(Organization::getId)
            .orElse(null);
    }
} 