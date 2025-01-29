package com.backend.backend.repository;

import com.backend.backend.domain.model.VerificationToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.time.LocalDateTime;

public interface VerificationTokenRepository extends MongoRepository<VerificationToken, String> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUserIdAndTokenType(String userId, VerificationToken.TokenType tokenType);
    void deleteByExpiryDateBefore(LocalDateTime date);
} 