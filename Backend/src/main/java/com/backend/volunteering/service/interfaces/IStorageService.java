package com.backend.volunteering.service.interfaces;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;

public interface IStorageService {
    void init();
    String store(MultipartFile file, String directory);
    Stream<Path> loadAll();
    Path load(String filename);
    Resource loadAsResource(String filename);
    void deleteFile(String filename);
    String getFileUrl(String filename);
    boolean exists(String filename);
} 