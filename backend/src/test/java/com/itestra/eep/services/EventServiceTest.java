package com.itestra.eep.services;

import com.itestra.eep.dtos.EmployeeParticipationUpsertDTO;
import com.itestra.eep.mappers.EventMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Event;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.utils.RandomEntityGenerator;
import org.hibernate.Hibernate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest
@Import(value = RandomEntityGenerator.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class EventServiceTest {

    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private EventMapper eventMapper;
    @Autowired
    private EventService eventService;
    @Autowired
    private RandomEntityGenerator randomEntityGenerator;

    @Test
    void testFindByIdReturnsEvent() {
        Event event = randomEntityGenerator.generate(Event.class);
        event = eventRepository.save(event);

        Event result = eventService.findById(event.getId());
        assertNotNull(result);

        assertEquals(event.getId(), result.getId());
    }

    @Test
    void testCreateEvent() {
        Event event = randomEntityGenerator.generate(Event.class);
        Event result = eventService.create(eventMapper.toCreateDto(event));

        Event savedEvent = (Event) Hibernate.unproxy(eventRepository.findById(result.getId()).get());
        assertNotNull(result);

        assertEquals(savedEvent.getId(), result.getId());
        assertEquals(savedEvent.getCapacity(), result.getCapacity());
        assertEquals(savedEvent.getDate(), result.getDate());
        assertEquals(savedEvent.getDescription(), result.getDescription());
        assertEquals(savedEvent.getEventType(), result.getEventType());
        assertEquals(savedEvent.getName(), result.getName());
    }

    @Test
    void testAddParticipant() {
        Employee employee = randomEntityGenerator.generate(Employee.class);
        employee = employeeRepository.save(employee);

        Event event = randomEntityGenerator.generate(Event.class);
        event.setCapacity(10);
        event.setDate(LocalDateTime.now().plusDays(25));
        event = eventRepository.save(event);
        int guestCount = 1;

        EmployeeParticipationUpsertDTO dto = new EmployeeParticipationUpsertDTO(guestCount, employee.getId());
        EmployeeParticipation employeeParticipation = eventService.addParticipant(event.getId(), dto);

        assertNotNull(employeeParticipation);
        assertEquals(employee.getId(), employeeParticipation.getEmployee().getId());
        assertEquals(event.getId(), employeeParticipation.getEvent().getId());
        assertEquals(guestCount, employeeParticipation.getGuestCount());
    }

    @Test
    void testAddParticipantWithCapacityExceed() {

        Employee employee = randomEntityGenerator.generate(Employee.class);
        employee = employeeRepository.save(employee);

        Event event = randomEntityGenerator.generate(Event.class);
        event.setCapacity(10);
        event.setDate(LocalDateTime.now().plusDays(25));
        event = eventRepository.save(event);
        int guestCount = 10;
        final UUID eventId = event.getId();
        EmployeeParticipationUpsertDTO dto = new EmployeeParticipationUpsertDTO(guestCount, employee.getId());
        assertThrows(com.itestra.eep.exceptions.EventCapacityExceededException.class, () -> eventService.addParticipant(eventId, dto));
    }

} 