package com.fill_rouge.backend.service.resource;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceVersionManager {
    private final ResourceLoader resourceLoader;
    private final Path versionDirectory;

    public ResourceVersionManager(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
        this.versionDirectory = Paths.get("versions").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.versionDirectory);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create versions directory", ex);
        }
    }

    public String createVersion(String resourceId, byte[] content) throws IOException {
        String versionId = generateVersionId(resourceId);
        Path versionPath = versionDirectory.resolve(versionId);
        Files.write(versionPath, content);
        return versionId;
    }

    public List<String> getVersions(String resourceId) throws IOException {
        return Files.list(versionDirectory)
                .filter(path -> path.getFileName().toString().startsWith(resourceId))
                .map(path -> path.getFileName().toString())
                .collect(Collectors.toList());
    }

    public Resource getVersion(String versionId) {
        Path versionPath = versionDirectory.resolve(versionId);
        return resourceLoader.getResource(versionPath.toUri().toString());
    }

    private String generateVersionId(String resourceId) {
        return String.format("%s_%s", resourceId, LocalDateTime.now().toString().replace(":", "-"));
    }
} 