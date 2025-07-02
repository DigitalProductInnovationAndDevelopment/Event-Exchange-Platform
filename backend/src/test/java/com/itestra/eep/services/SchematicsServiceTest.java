package com.itestra.eep.services;

import com.itestra.eep.dtos.SchematicsCreateDTO;
import com.itestra.eep.dtos.SchematicsUpdateDTO;
import com.itestra.eep.mappers.SchematicsMapper;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.FileEntity;
import com.itestra.eep.models.Schematics;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.FileRepository;
import com.itestra.eep.repositories.SchematicsRepository;
import com.itestra.eep.services.impl.SchematicsServiceImpl;
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

class SchematicsServiceTest {
    @Mock private SchematicsRepository schematicsRepository;
    @Mock private EventRepository eventRepository;
    @Mock private FileRepository fileRepository;
    @Mock private SchematicsMapper schematicsMapper;
    @Mock private MultipartFile multipartFile;
    @InjectMocks private SchematicsServiceImpl schematicsService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void testFindByIdReturnsSchematics() {
        UUID id = UUID.randomUUID();
        Schematics schematics = new Schematics();
        when(schematicsRepository.findById(id)).thenReturn(Optional.of(schematics));
        assertEquals(schematics, schematicsService.findById(id));
    }

    @Test
    void testCreateSchematics() {
        SchematicsCreateDTO dto = mock(SchematicsCreateDTO.class);
        Event event = new Event();
        when(dto.getEventId()).thenReturn(UUID.randomUUID());
        when(eventRepository.findById(any())).thenReturn(Optional.of(event));
        when(fileRepository.saveAndFlush(any(FileEntity.class))).thenAnswer(i -> i.getArgument(0));
        when(schematicsRepository.save(any(Schematics.class))).thenAnswer(i -> i.getArgument(0));
        Schematics result = schematicsService.create(dto);
        assertNotNull(result);
    }

    @Test
    void testUpdateSchematicOverview() throws IOException {
        UUID id = UUID.randomUUID();
        Schematics schematics = new Schematics();
        FileEntity fileEntity = new FileEntity();
        schematics.setOverview(fileEntity);
        when(schematicsRepository.findById(id)).thenReturn(Optional.of(schematics));
        when(multipartFile.getBytes()).thenReturn(new byte[]{1,2,3});
        when(fileRepository.saveAndFlush(fileEntity)).thenReturn(fileEntity);
        schematicsService.updateSchematicOverview(id, multipartFile);
        verify(fileRepository).saveAndFlush(fileEntity);
    }

    @Test
    void testUpdateSchematics() {
        UUID id = UUID.randomUUID();
        SchematicsUpdateDTO dto = mock(SchematicsUpdateDTO.class);
        Schematics schematics = new Schematics();
        when(schematicsRepository.findById(id)).thenReturn(Optional.of(schematics));
        when(schematicsRepository.save(any(Schematics.class))).thenAnswer(i -> i.getArgument(0));
        Schematics result = schematicsService.update(id, dto);
        assertNotNull(result);
    }

    @Test
    void testDeleteSchematics() {
        UUID id = UUID.randomUUID();
        doNothing().when(schematicsRepository).deleteById(id);
        schematicsService.delete(id);
        verify(schematicsRepository).deleteById(id);
    }
} 