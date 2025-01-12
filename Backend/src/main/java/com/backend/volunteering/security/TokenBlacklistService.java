package com.backend.volunteering.security;

import org.springframework.stereotype.Service;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class TokenBlacklistService {
    
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;
    
    private final Cache<String, Boolean> blacklist = CacheBuilder.newBuilder()
        .expireAfterWrite(24, TimeUnit.HOURS)
        .build();

    public void blacklistToken(String token) {
        if ("prod".equals(activeProfile)) {
            log.debug("Blacklisting token");
            blacklist.put(token, Boolean.TRUE);
        }
    }

    public boolean isBlacklisted(String token) {
        if ("dev".equals(activeProfile)) {
            return false; // Never blacklist in dev mode
        }
        return blacklist.getIfPresent(token) != null;
    }
} 