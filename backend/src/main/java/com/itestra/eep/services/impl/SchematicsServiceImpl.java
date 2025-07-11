package com.itestra.eep.services.impl;

import com.itestra.eep.dtos.SchematicsCreateDTO;
import com.itestra.eep.dtos.SchematicsUpdateDTO;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.exceptions.SchematicsNotFoundException;
import com.itestra.eep.mappers.SchematicsMapper;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.FileEntity;
import com.itestra.eep.models.Schematics;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.FileRepository;
import com.itestra.eep.repositories.SchematicsRepository;
import com.itestra.eep.services.SchematicsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class SchematicsServiceImpl implements SchematicsService {

    public static final byte[] EMPTY_PNG = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR42mP8/5+hHgAHggJ/PXJ3WQAAAABJRU5ErkJggg=="
    );

    private final SchematicsRepository schematicsRepository;
    private final EventRepository eventRepository;
    private final FileRepository fileRepository;
    private final SchematicsMapper schematicsMapper;

    @Override
    public Schematics findById(UUID projectId) {
        return schematicsRepository.findById(projectId).orElseThrow(SchematicsNotFoundException::new);
    }

    @Override
    public Schematics create(SchematicsCreateDTO dto) {
        Event event = eventRepository.findById(dto.getEventId()).orElseThrow(EventNotFoundException::new);
        Schematics schematics = new Schematics();
        schematics.setState(dto.getState());
        schematics.setEvent(event);

        FileEntity overviewFile = new FileEntity();
        overviewFile.setEvent(null);
        overviewFile.setName("%s_schematics.png".formatted(event.getId()));
        overviewFile.setContent(EMPTY_PNG);
        overviewFile.setContentType("image/png");
        fileRepository.saveAndFlush(overviewFile);
        schematics.setOverview(overviewFile);

        return schematicsRepository.save(schematics);
    }

    @Override
    public void updateSchematicOverview(UUID schematicsId, MultipartFile file) throws IOException {
        Schematics schematics = schematicsRepository.findById(schematicsId).orElseThrow(SchematicsNotFoundException::new);
        schematics.getOverview().setContent(file.getBytes());
        fileRepository.saveAndFlush(schematics.getOverview());
    }

    @Override
    public Schematics update(UUID id, SchematicsUpdateDTO dto) {
        Schematics schematics = schematicsRepository.findById(id).orElseThrow(SchematicsNotFoundException::new);
        schematicsMapper.updateSchematicsFromDto(dto, schematics);
        return schematicsRepository.save(schematics);
    }

    @Override
    public void delete(UUID id) {
        schematicsRepository.deleteById(id);
    }

}
