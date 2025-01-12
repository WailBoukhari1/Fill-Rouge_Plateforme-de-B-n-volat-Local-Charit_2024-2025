package com.backend.volunteering.repository;

import com.backend.volunteering.model.VerificationToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends MongoRepository<VerificationToken, String> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUserIdAndType(String userId, VerificationToken.TokenType type);
} 