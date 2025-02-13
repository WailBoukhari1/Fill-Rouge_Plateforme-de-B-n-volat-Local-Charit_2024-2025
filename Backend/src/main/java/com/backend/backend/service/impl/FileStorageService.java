package com.backend.backend.service.impl;

import com.backend.backend.exception.CustomException;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final GridFsTemplate gridFsTemplate;
    private final GridFsOperations gridFsOperations;
    private final GridFSBucket gridFSBucket;

    @Value("${app.file.max-size:5242880}") // 5MB default
    private long maxFileSize;

    @Value("${app.file.allowed-types:image/jpeg,image/png,image/gif,application/pdf}")
    private String[] allowedFileTypes;

    @Value("${app.file.max-filename-length:255}")
    private int maxFilenameLength;

    /**
     * Stores a file in GridFS
     * @param file The file to store
     * @return The stored file's ID
     * @throws CustomException if file validation fails
     * @throws IOException if file operations fail
     */
    public String storeFile(MultipartFile file) throws IOException {
        validateFile(file);

        String filename = generateUniqueFilename(file.getOriginalFilename());
        
        try {
            ObjectId fileId = gridFsTemplate.store(
                file.getInputStream(),
                filename,
                file.getContentType(),
                createMetadata(file)
            );
            log.info("Successfully stored file: {} with ID: {}", filename, fileId);
            return fileId.toString();
        } catch (IOException e) {
            log.error("Failed to store file: {}", filename, e);
            throw new CustomException("Failed to store file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retrieves a file by its ID
     * @param id The file ID
     * @return Optional containing the file if found
     */
    public Optional<GridFSFile> getFile(String id) {
        try {
            return Optional.ofNullable(
                gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id)))
            );
        } catch (IllegalArgumentException e) {
            log.error("Invalid file ID format: {}", id);
            throw new CustomException("Invalid file ID", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Deletes a file by its ID
     * @param id The file ID
     * @throws CustomException if file doesn't exist or deletion fails
     */
    public void deleteFile(String id) {
        try {
            if (!getFile(id).isPresent()) {
                throw new CustomException("File not found", HttpStatus.NOT_FOUND);
            }
            gridFsTemplate.delete(new Query(Criteria.where("_id").is(id)));
            log.info("Successfully deleted file with ID: {}", id);
        } catch (IllegalArgumentException e) {
            log.error("Failed to delete file with ID: {}", id, e);
            throw new CustomException("Invalid file ID", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Downloads a file by its ID
     * @param id The file ID
     * @return The file contents as byte array
     * @throws CustomException if file doesn't exist or download fails
     */
    public byte[] downloadFile(String id) {
        try {
            GridFSFile file = getFile(id)
                .orElseThrow(() -> new CustomException("File not found", HttpStatus.NOT_FOUND));
                
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            gridFSBucket.downloadToStream(new ObjectId(id), outputStream);
            return outputStream.toByteArray();
        } catch (IllegalArgumentException e) {
            log.error("Invalid file ID format: {}", id);
            throw new CustomException("Invalid file ID", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Failed to download file with ID: {}", id, e);
            throw new CustomException("Failed to download file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Updates an existing file's contents
     * @param id The file ID
     * @param newFile The new file contents
     * @return The updated file's ID
     * @throws CustomException if file validation fails or update fails
     */
    public String updateFile(String id, MultipartFile newFile) throws IOException {
        validateFile(newFile);

        // Delete old file
        deleteFile(id);

        // Store new file with same ID if possible
        try {
            return storeFile(newFile);
        } catch (Exception e) {
            log.error("Failed to update file with ID: {}", id, e);
            throw new CustomException("Failed to update file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new CustomException("File is empty", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > maxFileSize) {
            throw new CustomException(
                String.format("File size exceeds maximum limit of %d bytes", maxFileSize),
                HttpStatus.BAD_REQUEST
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !Arrays.asList(allowedFileTypes).contains(contentType)) {
            throw new CustomException(
                "File type not allowed. Allowed types: " + String.join(", ", allowedFileTypes),
                HttpStatus.BAD_REQUEST
            );
        }

        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        if (filename.length() > maxFilenameLength) {
            throw new CustomException(
                String.format("Filename exceeds maximum length of %d characters", maxFilenameLength),
                HttpStatus.BAD_REQUEST
            );
        }
    }

    private String generateUniqueFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + (extension != null ? "." + extension : "");
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return null;
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private Document createMetadata(MultipartFile file) {
        return new Document()
            .append("originalFilename", file.getOriginalFilename())
            .append("contentType", file.getContentType())
            .append("size", file.getSize())
            .append("uploadDate", System.currentTimeMillis());
    }
} 