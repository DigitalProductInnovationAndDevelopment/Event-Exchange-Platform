package com.itestra.eep.services.impl;

import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.FileEntity;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.FileRepository;
import com.itestra.eep.services.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;
    private final EventRepository eventRepository;

    @Override
    public void storeFile(MultipartFile file, UUID eventId) throws IOException {
        FileEntity entity = new FileEntity();

        Event event = eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);
        entity.setEvent(event);

        entity.setName(file.getOriginalFilename());
        entity.setContentType(file.getContentType());
        entity.setContent(file.getBytes());

        fileRepository.save(entity);
    }

    @Override
    public Optional<FileEntity> getFile(UUID id) {
        return fileRepository.findById(id);
    }
}
