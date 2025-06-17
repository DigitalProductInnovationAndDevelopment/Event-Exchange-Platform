package com.itestra.eep.services.impl;

import com.itestra.eep.dtos.SchematicsCreateDTO;
import com.itestra.eep.dtos.SchematicsUpdateDTO;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.exceptions.SchematicsNotFoundException;
import com.itestra.eep.mappers.SchematicsMapper;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Schematics;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.SchematicsRepository;
import com.itestra.eep.services.SchematicsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class SchematicsServiceImpl implements SchematicsService {

    private final SchematicsRepository schematicsRepository;
    private final EventRepository eventRepository;
    private final SchematicsMapper schematicsMapper;

    @Override
    public Schematics findById(UUID projectId) {
        return schematicsRepository.findById(projectId).orElseThrow(SchematicsNotFoundException::new);
    }

    @Override
    public Schematics create(SchematicsCreateDTO dto) {
        Event event = eventRepository.findById(dto.getEventId()).orElseThrow(EventNotFoundException::new);
        Schematics schematics = new Schematics();
        schematics.setName(dto.getName());
        schematics.setState(dto.getState());
        schematics.setEvent(event);
        return schematicsRepository.save(schematics);
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
