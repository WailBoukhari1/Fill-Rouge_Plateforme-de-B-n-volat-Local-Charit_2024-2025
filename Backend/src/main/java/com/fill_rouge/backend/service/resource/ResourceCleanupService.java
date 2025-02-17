package com.fill_rouge.backend.service.resource;

import com.fill_rouge.backend.config.ResourceStorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ResourceCleanupService {
    private final ResourceStorageProperties properties;
    private final FileStorageService fileStorageService;
    private final ResourceVersionManager versionManager;

    @Scheduled(fixedRateString = "${app.resource.storage.cleanupIntervalHours}000")
    public void cleanupExpiredResources() throws IOException {
        cleanupTempFiles();
        cleanupOldVersions();
    }

    private void cleanupTempFiles() throws IOException {
        Path tempDir = Path.of(properties.getUploadDir(), "temp");
        if (Files.exists(tempDir)) {
            try (Stream<Path> paths = Files.walk(tempDir)) {
                paths.filter(Files::isRegularFile)
                     .filter(this::isExpired)
                     .forEach(this::deleteQuietly);
            }
        }
    }

    private void cleanupOldVersions() throws IOException {
        // Keep only the maximum number of versions specified in properties
        Path versionDir = Path.of("versions");
        if (Files.exists(versionDir)) {
            try (Stream<Path> paths = Files.walk(versionDir)) {
                paths.filter(Files::isRegularFile)
                     .sorted((p1, p2) -> {
                         try {
                             return Files.getLastModifiedTime(p2).compareTo(Files.getLastModifiedTime(p1));
                         } catch (IOException e) {
                             return 0;
                         }
                     })
                     .skip(properties.getMaxVersions())
                     .forEach(this::deleteQuietly);
            }
        }
    }

    private boolean isExpired(Path file) {
        try {
            LocalDateTime lastModified = LocalDateTime.parse(
                Files.getLastModifiedTime(file).toString()
            );
            return ChronoUnit.HOURS.between(lastModified, LocalDateTime.now()) > 
                   properties.getTempFileExpiryHours();
        } catch (IOException e) {
            return false;
        }
    }

    private void deleteQuietly(Path file) {
        try {
            Files.deleteIfExists(file);
        } catch (IOException e) {
            // Log error but continue with cleanup
        }
    }
} 