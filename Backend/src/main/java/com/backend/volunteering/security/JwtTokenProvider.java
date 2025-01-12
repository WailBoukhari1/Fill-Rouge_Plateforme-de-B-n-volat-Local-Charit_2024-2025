package com.backend.volunteering.security;

import com.backend.volunteering.exception.TokenException;
import com.backend.volunteering.exception.ErrorCode;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private int jwtExpirationInMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            return generateToken(userPrincipal.getEmail());
        } catch (Exception e) {
            log.error("Error generating token: ", e);
            throw new TokenException(
                ErrorCode.INTERNAL_ERROR,
                "Failed to generate access token"
            );
        }
    }

    public String generateRefreshToken(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            return generateRefreshToken(userPrincipal.getEmail());
        } catch (Exception e) {
            log.error("Error generating refresh token: ", e);
            throw new TokenException(
                ErrorCode.INTERNAL_ERROR,
                "Failed to generate refresh token"
            );
        }
    }

    private String generateToken(String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        try {
            return Jwts.builder()
                    .setSubject(subject)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(getSigningKey())
                    .compact();
        } catch (Exception e) {
            log.error("Error generating token: ", e);
            throw new TokenException(
                ErrorCode.INTERNAL_ERROR,
                "Failed to generate token"
            );
        }
    }

    private String generateRefreshToken(String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (jwtExpirationInMs * 24)); // 24 times longer than access token

        try {
            return Jwts.builder()
                    .setSubject(subject)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(getSigningKey())
                    .compact();
        } catch (Exception e) {
            log.error("Error generating refresh token: ", e);
            throw new TokenException(
                ErrorCode.INTERNAL_ERROR,
                "Failed to generate refresh token"
            );
        }
    }

    public String getUserEmailFromToken(String token) {
        return getUsernameFromToken(token);
    }

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();
        } catch (ExpiredJwtException ex) {
            log.error("JWT token is expired: {}", ex.getMessage());
            throw new TokenException(
                ErrorCode.TOKEN_EXPIRED,
                "Token has expired"
            );
        } catch (Exception ex) {
            log.error("Error parsing token: ", ex);
            throw new TokenException(
                ErrorCode.INVALID_TOKEN,
                "Invalid token"
            );
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
            throw new TokenException(
                ErrorCode.INVALID_TOKEN,
                "Invalid token signature"
            );
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
            throw new TokenException(
                ErrorCode.INVALID_TOKEN,
                "Malformed token"
            );
        } catch (ExpiredJwtException ex) {
            log.error("JWT token is expired: {}", ex.getMessage());
            throw new TokenException(
                ErrorCode.TOKEN_EXPIRED,
                "Token has expired"
            );
        } catch (UnsupportedJwtException ex) {
            log.error("JWT token is unsupported: {}", ex.getMessage());
            throw new TokenException(
                ErrorCode.INVALID_TOKEN,
                "Unsupported token type"
            );
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
            throw new TokenException(
                ErrorCode.INVALID_TOKEN,
                "Empty token"
            );
        }
    }
} 