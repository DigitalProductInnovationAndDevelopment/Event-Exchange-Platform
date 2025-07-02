package com.itestra.eep.services;

import com.itestra.eep.dtos.SchematicsCreateDTO;
import com.itestra.eep.dtos.SchematicsUpdateDTO;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Schematics;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.SchematicsRepository;
import com.itestra.utils.RandomEntityGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;

import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest
@Import(value = RandomEntityGenerator.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class SchematicsServiceTest {

    @Autowired
    private SchematicsRepository schematicsRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private SchematicsService schematicsService;
    @Autowired
    private RandomEntityGenerator randomEntityGenerator;

    @Test
    void testCreateSchematics() {

        Event event = randomEntityGenerator.generate(Event.class);
        event = eventRepository.save(event);

        SchematicsCreateDTO dto = new SchematicsCreateDTO(event.getId(), "{}");
        Schematics result = schematicsService.create(dto);

        assertNotNull(result);
        assertEquals(result.getEvent().getId(), event.getId());
        assertEquals(result.getState(), dto.getState());
    }

    @Test
    void testFindByIdReturnsSchematics() {
        Event event = randomEntityGenerator.generate(Event.class);
        event = eventRepository.save(event);

        SchematicsCreateDTO dto = new SchematicsCreateDTO(event.getId(), "{}");
        Schematics createdSchematics = schematicsService.create(dto);

        Schematics fetchedSchematics = schematicsService.findById(createdSchematics.getId());

        assertEquals(fetchedSchematics.getState(), createdSchematics.getState());
        assertEquals(fetchedSchematics.getEvent().getId(), createdSchematics.getEvent().getId());
    }


    @Test
    void testUpdateSchematics() {
        Event event = randomEntityGenerator.generate(Event.class);
        event = eventRepository.save(event);

        SchematicsCreateDTO createDto = new SchematicsCreateDTO(event.getId(), "{}");
        Schematics createdSchematics = schematicsService.create(createDto);

        SchematicsUpdateDTO updateDto = new SchematicsUpdateDTO(event.getId(), "{ test: 'hello' }");
        Schematics updatedSchematics = schematicsService.update(createdSchematics.getId(), updateDto);

        assertNotNull(updatedSchematics);
        assertEquals(createdSchematics.getEvent().getId(), updatedSchematics.getEvent().getId());
        assertNotEquals(createdSchematics.getState(), updatedSchematics.getState());
        assertNotEquals(createdSchematics.getUpdatedAt(), updatedSchematics.getUpdatedAt());
    }

    @Test
    void testDeleteSchematics() {
        Event event = randomEntityGenerator.generate(Event.class);
        event = eventRepository.save(event);

        assertEquals(0, schematicsRepository.count());

        SchematicsCreateDTO createDto = new SchematicsCreateDTO(event.getId(), "{}");
        Schematics createdSchematics = schematicsService.create(createDto);

        assertEquals(1, schematicsRepository.count());

        schematicsService.delete(createdSchematics.getId());

        assertEquals(0, schematicsRepository.count());
    }
} 