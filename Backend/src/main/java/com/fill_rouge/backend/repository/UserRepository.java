package com.fill_rouge.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.fill_rouge.backend.domain.User;
import com.fill_rouge.backend.constant.Role;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetPasswordToken(String token);
    long countByRole(Role role);

    @Query(value = "{'createdAt': {$gte: ?0, $lte: ?1}}", fields = "{'createdAt': 1}")
    List<Object[]> getUserGrowthByDay(LocalDateTime start, LocalDateTime end);
}
