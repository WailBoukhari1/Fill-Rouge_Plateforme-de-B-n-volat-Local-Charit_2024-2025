package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.service.storage.GridFsService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.CacheControl;
import org.bson.Document;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Arrays;

@RestController
@RequestMapping({"/api/files", "/files"})
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"}, allowedHeaders = "*", exposedHeaders = "Content-Disposition", allowCredentials = "true")
public class FileController {
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);
    private final GridFsService gridFsService;

    @GetMapping("/{fileId}")
    public ResponseEntity<?> getFile(@PathVariable String fileId) {
        logger.debug("Fetching file with ID: {}", fileId);
        try {
            if (fileId == null || fileId.trim().isEmpty()) {
                logger.warn("Invalid file ID: null or empty");
                return ResponseEntity.badRequest().body("Invalid file ID");
            }

            GridFsResource resource = gridFsService.getAsResource(fileId);
            if (resource == null) {
                logger.warn("File not found with ID: {}", fileId);
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            
            // Set content type from the file's metadata
            String contentType = resource.getContentType();
            if (contentType == null || contentType.isEmpty()) {
                contentType = "application/octet-stream";
            }
            headers.setContentType(MediaType.parseMediaType(contentType));
            logger.debug("Content type for file {}: {}", fileId, contentType);
            
            // Set content disposition to inline for browser display
            headers.setContentDisposition(org.springframework.http.ContentDisposition
                .inline()
                .filename(resource.getFilename())
                .build());
            
            // Set caching headers
            headers.setCacheControl(CacheControl.maxAge(Duration.ofHours(1))
                .cachePublic()
                .mustRevalidate());

            // Add CORS headers with specific origins
            String origin = headers.getOrigin();
            if (origin != null && (origin.startsWith("http://localhost:4200") || origin.startsWith("http://localhost:3000"))) {
                headers.setAccessControlAllowOrigin(origin);
            }
            headers.setAccessControlAllowMethods(Arrays.asList(HttpMethod.GET, HttpMethod.OPTIONS));
            headers.setAccessControlAllowHeaders(Arrays.asList("*"));
            headers.setAccessControlExposeHeaders(Arrays.asList("Content-Disposition"));
            headers.setAccessControlAllowCredentials(true);

            // Stream the file content
            return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(resource.getInputStream()));
                
        } catch (IllegalArgumentException e) {
            logger.error("Invalid file ID: {}", fileId, e);
            return ResponseEntity.badRequest().body("Invalid file ID format");
        } catch (IOException e) {
            logger.error("Error retrieving file: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving file: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error while retrieving file: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred");
        }
    }
} 