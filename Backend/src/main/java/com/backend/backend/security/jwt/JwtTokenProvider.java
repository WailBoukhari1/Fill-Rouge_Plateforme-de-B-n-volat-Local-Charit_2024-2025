package com.backend.backend.security.jwt;

import com.backend.backend.model.User;
import com.backend.backend.repository.UserRepository;
import com.backend.backend.security.SecurityConstants;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final UserRepository userRepository;

    @Value("${spring.security.jwt.secret}")
    private String jwtSecret;

    private Key signingKey;

    private Key getSigningKey() {
        if (signingKey == null) {
            byte[] keyBytes = jwtSecret.getBytes();
            signingKey = Keys.hmacShaKeyFor(keyBytes);
        }
        return signingKey;
    }

    public String generateToken(Authentication authentication) {
        String email;
        if (authentication.getPrincipal() instanceof User) {
            email = ((User) authentication.getPrincipal()).getEmail();
        } else if (authentication.getPrincipal() instanceof OAuth2User) {
            email = ((OAuth2User) authentication.getPrincipal()).getAttribute("email");
        } else {
            throw new IllegalArgumentException("Unsupported principal type");
        }
        
        return buildToken(email, SecurityConstants.ACCESS_TOKEN_VALIDITY);
    }

    public String generateAccessToken(String email) {
        return buildToken(email, SecurityConstants.ACCESS_TOKEN_VALIDITY);
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, SecurityConstants.REFRESH_TOKEN_VALIDITY);
    }

    private String buildToken(String email, long expiration) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .claim("roles", List.of(user.getRole().name()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            logger.error("Invalid JWT signature", e);
        } catch (ExpiredJwtException e) {
            logger.error("Expired JWT token", e);
        } catch (UnsupportedJwtException e) {
            logger.error("Unsupported JWT token", e);
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty", e);
        }
        return false;
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
} 