package com.fill_rouge.backend.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file);
    Resource loadAsResource(String filePath);
    void delete(String filePath);
    void init();
    void deleteAll();
} 