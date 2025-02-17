package com.fill_rouge.backend.service.resource;

import com.fill_rouge.backend.config.ResourceStorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final ResourceStorageProperties properties;
    private final Path fileStorageLocation;

    public FileStorageService(ResourceStorageProperties properties) {
        this.properties = properties;
        this.fileStorageLocation = Paths.get(properties.getUploadDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    public String storeFile(MultipartFile file, String filename) throws IOException {
        validateFile(file);
        Path targetLocation = this.fileStorageLocation.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    public Resource loadFileAsResource(String filename) throws MalformedURLException {
        Path filePath = this.fileStorageLocation.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists()) {
            return resource;
        }
        throw new RuntimeException("File not found: " + filename);
    }

    public void deleteFile(String filename) throws IOException {
        Path file = this.fileStorageLocation.resolve(filename);
        Files.deleteIfExists(file);
    }

    public void clearDirectory() throws IOException {
        FileSystemUtils.deleteRecursively(fileStorageLocation);
        Files.createDirectories(fileStorageLocation);
    }

    private void validateFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new RuntimeException("Invalid file name");
        }
        if (file.getSize() > properties.getMaxFileSize()) {
            throw new RuntimeException("File size exceeds maximum limit");
        }
        boolean isAllowedType = false;
        for (String type : properties.getAllowedFileTypes()) {
            if (originalFilename.toLowerCase().endsWith(type)) {
                isAllowedType = true;
                break;
            }
        }
        if (!isAllowedType) {
            throw new RuntimeException("File type not allowed");
        }
    }
} 