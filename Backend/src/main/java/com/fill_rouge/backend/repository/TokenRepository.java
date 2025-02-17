package com.fill_rouge.backend.repository;

import com.fill_rouge.backend.domain.Token;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository extends MongoRepository<Token, String> {
    void deleteByToken(String token);
    boolean existsByToken(String token);
} 