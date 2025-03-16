package com.fill_rouge.backend.service.storage;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSDownloadStream;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.bson.types.ObjectId;
import org.bson.Document;
import org.springframework.util.StringUtils;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GridFsService {
    private final GridFSBucket gridFSBucket;
    private final GridFsTemplate gridFsTemplate;
    private static final Logger logger = LoggerFactory.getLogger(GridFsService.class);

    @Value("${spring.data.mongodb.database}")
    private String databaseName;

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename == null || originalFilename.contains("..")) {
            throw new IllegalArgumentException("Invalid file path sequence");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Invalid file type. Only image files are allowed.");
        }

        // Generate unique filename
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + fileExtension;

        // Set metadata
        Document metadata = new Document();
        metadata.append("contentType", contentType);
        metadata.append("originalFilename", originalFilename);
        metadata.append("uploadDate", System.currentTimeMillis());
        metadata.append("fileSize", file.getSize());
        metadata.append("fileType", "profile_picture");

        GridFSUploadOptions options = new GridFSUploadOptions()
            .metadata(metadata);

        try (InputStream inputStream = file.getInputStream()) {
            // Use GridFsTemplate instead of GridFSBucket for consistent ID generation
            ObjectId objectId = gridFsTemplate.store(inputStream, newFilename, contentType, options);
            String fileId = objectId.toHexString();
            logger.info("File uploaded successfully. ID: {}", fileId);

            // Verify the file was stored correctly
            GridFSFile storedFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(objectId)));
            if (storedFile == null) {
                logger.error("File was not stored correctly. Cannot find file with ID: {}", fileId);
                throw new IOException("Failed to verify file storage");
            }
            logger.info("File verified in GridFS. Filename: {}, Content Type: {}", storedFile.getFilename(), storedFile.getMetadata().get("contentType"));

            return fileId;
        } catch (Exception e) {
            logger.error("Error uploading file: {}", e.getMessage(), e);
            throw new IOException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    public byte[] retrieve(String fileId) throws IOException {
        try {
            GridFSDownloadStream downloadStream = gridFSBucket.openDownloadStream(new ObjectId(fileId));
            return downloadStream.readAllBytes();
        } catch (Exception e) {
            throw new IOException("Failed to retrieve file: " + fileId, e);
        }
    }

    public void delete(String fileId) {
        try {
            gridFSBucket.delete(new ObjectId(fileId));
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file: " + fileId, e);
        }
    }

    public Map<String, Object> retrieveWithMetadata(String fileId) throws IOException {
        try {
            ObjectId objectId = new ObjectId(fileId);
            GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(objectId)));
            
            if (file == null) {
                throw new IOException("File not found: " + fileId);
            }

            GridFSDownloadStream downloadStream = gridFSBucket.openDownloadStream(objectId);
            byte[] content = downloadStream.readAllBytes();
            
            Map<String, Object> result = new HashMap<>();
            result.put("content", content);
            result.put("metadata", file.getMetadata());
            
            return result;
        } catch (Exception e) {
            throw new IOException("Failed to retrieve file: " + fileId, e);
        }
    }

    public GridFsResource getAsResource(String fileId) throws IOException {
        try {
            logger.debug("Attempting to get file as resource. File ID: {}", fileId);
            
            if (fileId == null || fileId.trim().isEmpty()) {
                logger.warn("Invalid file ID: null or empty");
                return null;
            }

            ObjectId objectId;
            try {
                // Try to parse the hex string format
                objectId = new ObjectId(fileId);
                logger.debug("Successfully parsed ObjectId from hex string: {}", fileId);
            } catch (IllegalArgumentException e) {
                logger.error("Invalid ObjectId format: {}", fileId);
                throw new IllegalArgumentException("Invalid file ID format: " + fileId);
            }

            GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(objectId)));
            
            if (file == null) {
                logger.warn("File not found with ID: {}", fileId);
                return null;
            }

            logger.debug("File found. Filename: {}, Content Type: {}", file.getFilename(), file.getMetadata().getString("contentType"));
            return gridFsTemplate.getResource(file);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid file ID: {}", fileId, e);
            throw new IllegalArgumentException("Invalid file ID: " + fileId, e);
        } catch (Exception e) {
            logger.error("Error retrieving file: {}", fileId, e);
            throw new IOException("Failed to retrieve file: " + fileId, e);
        }
    }

    public Map<String, Object> getFileMetadata(String fileId) {
        try {
            logger.debug("Getting metadata for file ID: {}", fileId);
            ObjectId objectId = new ObjectId(fileId);
            GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(objectId)));
            
            if (file == null) {
                logger.warn("No file found with ID: {}", fileId);
                return null;
            }

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("filename", file.getFilename());
            metadata.put("length", file.getLength());
            metadata.put("uploadDate", file.getUploadDate());
            metadata.put("metadata", file.getMetadata());
            
            logger.debug("Retrieved metadata for file: {}", metadata);
            return metadata;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid file ID format: {}", fileId, e);
            return null;
        } catch (Exception e) {
            logger.error("Error retrieving file metadata: {}", e.getMessage(), e);
            return null;
        }
    }

    public boolean exists(String fileId) {
        try {
            ObjectId objectId = new ObjectId(fileId);
            GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(objectId)));
            return file != null;
        } catch (Exception e) {
            logger.error("Error checking file existence: {}", e.getMessage(), e);
            return false;
        }
    }
} 