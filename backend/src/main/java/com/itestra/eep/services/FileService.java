package com.itestra.eep.services;

import com.itestra.eep.models.FileEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

public interface FileService {

    void storeFile(MultipartFile file, UUID eventId) throws IOException;

    Optional<FileEntity> getFile(UUID id);
}
