package com.backend.backend.security.jwt;

import com.backend.backend.security.UserPrincipal;
import com.backend.backend.domain.model.User;
import com.backend.backend.repository.UserRepository;
import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.Date;
import java.util.List;
import java.security.Key;
import io.jsonwebtoken.security.Keys;

@Service
@RequiredArgsConstructor
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final UserRepository userRepository;

    @Value("${spring.security.jwt.secret}")
    private String jwtSecret;

    @Value("${spring.security.jwt.expiration}")
    private int jwtExpirationInMs;

    @Value("${spring.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .claim("roles", userPrincipal.getAuthorities().iterator().next().getAuthority())
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .build()
                .parseClaimsJws(authToken);
            return true;
        } catch (io.jsonwebtoken.security.SignatureException ex) {
            logger.error("Invalid JWT signature");
            return false;
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
            return false;
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
            return false;
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
            return false;
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty");
            return false;
        }
    }

    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateAccessToken(String email) {
        return buildToken(email, jwtExpirationInMs);
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, refreshExpiration);
    }

    private String buildToken(String email, long expiration) {
        byte[] keyBytes = jwtSecret.getBytes();
        Key key = Keys.hmacShaKeyFor(keyBytes);
        
        // Get user role from repository
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .claim("roles", List.of(user.getRole().name()))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
} 