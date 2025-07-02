package com.itestra.eep.services;

import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.ParticipationUpsertDTO;
import com.itestra.eep.mappers.EventMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Participation;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.ParticipationRepository;
import com.itestra.eep.services.impl.EventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EventServiceTest {
    @Mock
    private EventRepository eventRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private ParticipationRepository participationRepository;
    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventServiceImpl eventService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindByIdReturnsEvent() {
        UUID eventId = UUID.randomUUID();
        Event event = new Event();
        event.setId(eventId);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        Event result = eventService.findById(eventId);
        assertNotNull(result);
        assertEquals(eventId, result.getId());
    }

    @Test
    void testCreateEvent() {
        EventCreateDTO dto = new EventCreateDTO();
        Event event = new Event();
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        doNothing().when(eventMapper).createEventFromDto(dto, event);
        Event result = eventService.create(dto);
        assertNotNull(result);
    }

    @Test
    void testAddParticipant() {
        UUID employeeId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Employee employee = new Employee();
        employee.setId(employeeId);
        Event event = new Event();
        event.setId(eventId);
        event.setCapacity(10);
        int guestCount = 1;
        ParticipationUpsertDTO dto = new ParticipationUpsertDTO(guestCount, employeeId, eventId);
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(participationRepository.save(any(Participation.class))).thenAnswer(i -> i.getArgument(0));
        Participation participation = eventService.addParticipant(dto);
        assertNotNull(participation);
        assertEquals(employee, participation.getEmployee());
        assertEquals(event, participation.getEvent());
        assertEquals(guestCount, participation.getGuestCount());
    }
} 