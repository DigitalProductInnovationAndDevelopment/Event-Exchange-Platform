package com.itestra.eep.services;

import com.itestra.eep.models.FileEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

public interface FileService {

    FileEntity storeFile(MultipartFile file, UUID eventId) throws IOException;

    void deleteFile(UUID id);

    Optional<FileEntity> getFile(UUID id);
}
