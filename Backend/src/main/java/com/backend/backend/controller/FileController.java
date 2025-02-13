package com.backend.backend.controller;

import com.backend.backend.dto.response.ApiResponse;
import com.backend.backend.service.impl.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestParam("file") MultipartFile file) throws IOException {
        String fileId = fileStorageService.storeFile(file);
        return ResponseEntity.ok(ApiResponse.success(
            fileId,
            "File uploaded successfully"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable String id) {
        byte[] data = fileStorageService.downloadFile(id);
        ByteArrayResource resource = new ByteArrayResource(data);
        
        String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String filename = "download"; // You might want to get the actual filename from metadata
        
        return ResponseEntity.ok()
            .contentLength(data.length)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType(contentType))
            .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable String id) {
        fileStorageService.deleteFile(id);
        return ResponseEntity.ok(ApiResponse.success(
            null,
            "File deleted successfully"
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> updateFile(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String newFileId = fileStorageService.updateFile(id, file);
        return ResponseEntity.ok(ApiResponse.success(
            newFileId,
            "File updated successfully"
        ));
    }
} 