package com.itestra.eep.services;

import com.itestra.eep.models.Event;
import com.itestra.eep.models.FileEntity;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.FileRepository;
import com.itestra.eep.services.impl.FileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FileServiceTest {
    @Mock private FileRepository fileRepository;
    @Mock private EventRepository eventRepository;
    @Mock private MultipartFile multipartFile;
    @InjectMocks private FileServiceImpl fileService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void testStoreFile() throws IOException {
        UUID eventId = UUID.randomUUID();
        Event event = new Event();
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(multipartFile.getOriginalFilename()).thenReturn("file.txt");
        when(multipartFile.getContentType()).thenReturn("text/plain");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1,2,3});
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(i -> i.getArgument(0));
        FileEntity result = fileService.storeFile(multipartFile, eventId);
        assertNotNull(result);
        assertEquals("file.txt", result.getName());
    }

    @Test
    void testDeleteFile() {
        UUID id = UUID.randomUUID();
        doNothing().when(fileRepository).deleteById(id);
        fileService.deleteFile(id);
        verify(fileRepository).deleteById(id);
    }

    @Test
    void testGetFile() {
        UUID id = UUID.randomUUID();
        FileEntity fileEntity = new FileEntity();
        when(fileRepository.findById(id)).thenReturn(Optional.of(fileEntity));
        Optional<FileEntity> result = fileService.getFile(id);
        assertTrue(result.isPresent());
        assertEquals(fileEntity, result.get());
    }
} 