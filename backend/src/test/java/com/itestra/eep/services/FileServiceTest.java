package com.itestra.eep.services;

import com.itestra.eep.models.Event;
import com.itestra.eep.models.FileEntity;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.FileRepository;
import com.itestra.utils.RandomEntityGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@SpringBootTest
@Import(value = RandomEntityGenerator.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class FileServiceTest {

    public static final String FILE_NAME = "file.txt";
    public static final String CONTENT_TYPE = "text/plain";
    public static final byte[] BYTES = {1, 2, 3};

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private FileService fileService;

    @Autowired
    private RandomEntityGenerator randomEntityGenerator;

    @Mock
    private MultipartFile multipartFile;

    @BeforeEach
    void setUp() throws IOException {
        when(multipartFile.getOriginalFilename()).thenReturn(FILE_NAME);
        when(multipartFile.getContentType()).thenReturn(CONTENT_TYPE);
        when(multipartFile.getBytes()).thenReturn(BYTES);
    }


    @Test
    void testStoreFile() throws IOException {

        Event event = randomEntityGenerator.generate(Event.class);
        event = eventRepository.save(event);

        FileEntity result = fileService.storeFile(multipartFile, event.getId());

        assertNotNull(result);
        assertEquals(FILE_NAME, result.getName());
        assertEquals(CONTENT_TYPE, result.getContentType());
        assertArrayEquals(BYTES, result.getContent());
    }

    @Test
    void testDeleteFile() throws IOException {
        Event event = randomEntityGenerator.generate(Event.class);
        event = eventRepository.save(event);

        assertEquals(0, fileRepository.count());
        FileEntity result = fileService.storeFile(multipartFile, event.getId());
        assertEquals(1, fileRepository.count());
        fileService.deleteFile(result.getFileId());
        assertEquals(0, fileRepository.count());

    }

    @Test
    void testGetFile() throws IOException {
        Event event = randomEntityGenerator.generate(Event.class);
        event = eventRepository.save(event);

        FileEntity file = fileService.storeFile(multipartFile, event.getId());

        FileEntity result = fileService.getFile(file.getFileId()).get();
        assertNotNull(result);
        assertEquals(FILE_NAME, result.getName());
        assertEquals(CONTENT_TYPE, result.getContentType());
        assertArrayEquals(BYTES, result.getContent());
    }
} 