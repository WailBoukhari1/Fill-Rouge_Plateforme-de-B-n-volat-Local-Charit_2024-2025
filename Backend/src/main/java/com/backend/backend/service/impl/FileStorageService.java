package com.backend.backend.service.impl;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final GridFsTemplate gridFsTemplate;
    private final GridFsOperations gridFsOperations;
    private final GridFSBucket gridFSBucket;

    public String storeFile(MultipartFile file) throws IOException {
        ObjectId fileId = gridFsTemplate.store(
            file.getInputStream(),
            file.getOriginalFilename(),
            file.getContentType()
        );
        return fileId.toString();
    }

    public Optional<GridFSFile> getFile(String id) {
        return Optional.ofNullable(
            gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id)))
        );
    }

    public void deleteFile(String id) {
        gridFsTemplate.delete(new Query(Criteria.where("_id").is(id)));
    }

    public byte[] downloadFile(String id) throws IOException {
        GridFSFile file = getFile(id)
            .orElseThrow(() -> new IOException("File not found"));
            
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        gridFSBucket.downloadToStream(new ObjectId(id), outputStream);
        return outputStream.toByteArray();
    }
} 