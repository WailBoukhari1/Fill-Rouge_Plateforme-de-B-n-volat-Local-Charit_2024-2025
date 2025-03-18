package com.fill_rouge.backend.controller;

import com.fill_rouge.backend.service.storage.GridFsService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Tag(name = "File Management", description = "Endpoints for managing file uploads and retrievals")
public class FileController {

    private final GridFsService gridFsService;

    @PostMapping("/upload")
    @Operation(summary = "Upload file", description = "Upload a file to GridFS")
    @ApiResponse(responseCode = "200", description = "File uploaded successfully")
    @ApiResponse(responseCode = "400", description = "Invalid file type or size")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        String fileId = gridFsService.store(file);
        return ResponseEntity.ok(Map.of("fileId", fileId));
    }

    @GetMapping("/{fileId}")
    @Operation(summary = "Get file", description = "Retrieve a file from GridFS by ID")
    @ApiResponse(responseCode = "200", description = "File retrieved successfully")
    @ApiResponse(responseCode = "404", description = "File not found")
    public ResponseEntity<InputStreamResource> getFile(@PathVariable String fileId) throws IOException {
        GridFsResource resource = gridFsService.getAsResource(fileId);
        if (resource == null) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(resource.getContentType()));
        headers.setContentLength(resource.contentLength());
        headers.setContentDispositionFormData("attachment", resource.getFilename());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(resource.getInputStream()));
    }

    @GetMapping("/{fileId}/metadata")
    @Operation(summary = "Get file metadata", description = "Retrieve metadata for a file from GridFS")
    @ApiResponse(responseCode = "200", description = "Metadata retrieved successfully")
    @ApiResponse(responseCode = "404", description = "File not found")
    public ResponseEntity<Map<String, Object>> getFileMetadata(@PathVariable String fileId) {
        Map<String, Object> metadata = gridFsService.getFileMetadata(fileId);
        if (metadata == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(metadata);
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "Delete file", description = "Delete a file from GridFS")
    @ApiResponse(responseCode = "204", description = "File deleted successfully")
    @ApiResponse(responseCode = "404", description = "File not found")
    public ResponseEntity<Void> deleteFile(@PathVariable String fileId) {
        if (!gridFsService.exists(fileId)) {
            return ResponseEntity.notFound().build();
        }
        gridFsService.delete(fileId);
        return ResponseEntity.noContent().build();
    }
} 