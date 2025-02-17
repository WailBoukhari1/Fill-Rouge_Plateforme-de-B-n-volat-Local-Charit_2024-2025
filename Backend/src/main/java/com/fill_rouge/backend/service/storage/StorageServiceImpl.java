package com.fill_rouge.backend.service.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StorageServiceImpl implements StorageService {
    private static final Logger logger = LoggerFactory.getLogger(StorageServiceImpl.class);

    private final Path rootLocation;
    private final Map<String, String> fileChecksums = new ConcurrentHashMap<>();
    private final Set<String> allowedFileTypes = new HashSet<>(Arrays.asList(
        "image/jpeg", "image/png", "image/gif", "application/pdf",
        "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ));

    @Value("${storage.max-file-size:10485760}") // 10MB default
    private long maxFileSize;

    @Value("${storage.upload-dir:uploads}")
    private String uploadDir;

    private static final int BUFFER_SIZE = 8192;
    private static final String TEMP_DIR = "temp";
    private static final String BACKUP_DIR = "backup";

    public StorageServiceImpl() {
        this.rootLocation = Paths.get("uploads");
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve(TEMP_DIR));
            Files.createDirectories(rootLocation.resolve(BACKUP_DIR));
            logger.info("Storage initialized at: {}", rootLocation.toAbsolutePath());
        } catch (IOException e) {
            logger.error("Could not initialize storage", e);
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        validateFile(file);

        try {
            String filename = generateUniqueFilename(file);
            Path destinationFile = getDestinationPath(filename);
            String checksum = calculateChecksum(file.getInputStream());

            // Check for duplicate content
            if (isDuplicate(checksum)) {
                logger.warn("Duplicate file content detected for file: {}", file.getOriginalFilename());
            }

            // Store file with atomic operation
            atomicFileCopy(file.getInputStream(), destinationFile);
            
            // Store checksum
            fileChecksums.put(filename, checksum);
            
            logger.info("Successfully stored file: {}", filename);
            return filename;
        } catch (IOException e) {
            logger.error("Failed to store file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            Path file = rootLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                logger.debug("Loading resource: {}", filename);
                return resource;
            } else {
                logger.error("File not found or not readable: {}", filename);
                throw new RuntimeException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            logger.error("Error loading resource: {}", filename, e);
            throw new RuntimeException("Could not read file: " + filename, e);
        }
    }

    @Override
    public void delete(String filename) {
        try {
            Path file = rootLocation.resolve(filename).normalize();
            validateFilePath(file);

            // Create backup before deletion
            createBackup(file);

            // Secure deletion with overwrite
            secureDelete(file);
            
            // Remove checksum
            fileChecksums.remove(filename);
            
            logger.info("Successfully deleted file: {}", filename);
        } catch (IOException e) {
            logger.error("Could not delete file: {}", filename, e);
            throw new RuntimeException("Could not delete file: " + filename, e);
        }
    }

    @Override
    public void deleteAll() {
        try {
            // Create backup before mass deletion
            createBackupDirectory();
            
            FileSystemUtils.deleteRecursively(rootLocation);
            fileChecksums.clear();
            
            // Reinitialize storage
            init();
            
            logger.info("Successfully deleted all files");
        } catch (IOException e) {
            logger.error("Could not delete all files", e);
            throw new RuntimeException("Could not delete all files", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit");
        }

        String contentType = file.getContentType();
        if (!allowedFileTypes.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }

        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        if (filename.contains("..")) {
            throw new IllegalArgumentException("Cannot store file with relative path");
        }
    }

    private void validateFilePath(Path file) {
        if (!file.getParent().equals(rootLocation.toAbsolutePath())) {
            throw new SecurityException("Cannot access file outside storage directory");
        }
    }

    private String generateUniqueFilename(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);
    }

    private Path getDestinationPath(String filename) {
        return rootLocation.resolve(filename)
                .normalize()
                .toAbsolutePath();
    }

    private void atomicFileCopy(InputStream inputStream, Path destinationFile) throws IOException {
        Path tempFile = rootLocation.resolve(TEMP_DIR).resolve(UUID.randomUUID().toString());
        
        try {
            Files.copy(inputStream, tempFile, StandardCopyOption.REPLACE_EXISTING);
            Files.move(tempFile, destinationFile, StandardCopyOption.ATOMIC_MOVE);
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    private String calculateChecksum(InputStream inputStream) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[BUFFER_SIZE];
            int bytesRead;
            
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            
            byte[] hash = digest.digest();
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Could not calculate file checksum", e);
        }
    }

    private boolean isDuplicate(String checksum) {
        return fileChecksums.containsValue(checksum);
    }

    private void createBackup(Path file) throws IOException {
        if (Files.exists(file)) {
            Path backupPath = rootLocation.resolve(BACKUP_DIR)
                    .resolve(file.getFileName() + "." + System.currentTimeMillis());
            Files.copy(file, backupPath, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private void createBackupDirectory() throws IOException {
        Path backupRoot = rootLocation.resolve(BACKUP_DIR)
                .resolve(String.valueOf(System.currentTimeMillis()));
        Files.createDirectories(backupRoot);
        
        Files.walk(rootLocation)
            .filter(path -> !path.equals(rootLocation))
            .forEach(path -> {
                try {
                    Path relativePath = rootLocation.relativize(path);
                    Path backupPath = backupRoot.resolve(relativePath);
                    if (Files.exists(path)) {
                        Files.copy(path, backupPath, StandardCopyOption.REPLACE_EXISTING);
                    }
                } catch (IOException e) {
                    logger.warn("Could not backup file: {}", path, e);
                }
            });
    }

    private void secureDelete(Path file) throws IOException {
        if (Files.exists(file)) {
            // Overwrite file content before deletion
            try {
                byte[] zeros = new byte[BUFFER_SIZE];
                Files.write(file, zeros, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
            } finally {
                Files.deleteIfExists(file);
            }
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1) : "";
    }
} 