package com.itestra.eep.services.impl;

import com.itestra.eep.dtos.EmployeeParticipationUpsertDTO;
import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.EventUpdateDTO;
import com.itestra.eep.exceptions.EmployeeNotFoundException;
import com.itestra.eep.exceptions.EventCapacityExceededException;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.exceptions.ParticipationNotFoundException;
import com.itestra.eep.factories.VisitorParticipationFactory;
import com.itestra.eep.mappers.EventMapper;
import com.itestra.eep.models.*;
import com.itestra.eep.repositories.EmployeeParticipationRepository;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.services.EventService;
import com.itestra.eep.validators.EventCapacityValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static com.itestra.eep.enums.Role.VISITOR;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeParticipationRepository employeeParticipationRepository;
    private final EventMapper eventMapper;
    private final EventCapacityValidator eventCapacityValidator;
    private final VisitorParticipationFactory visitorParticipationFactory;

    @Override
    public Event findById(UUID id) {
        return eventRepository.findById(id).orElseThrow(EventNotFoundException::new);
    }

    @Override
    public List<Event> findAll(Authentication authentication) {
        if (Objects.isNull(authentication)) {
            return new ArrayList<>();
        } else if (authentication.getAuthorities().contains(VISITOR)) {
            return eventRepository.findByVisitorParticipations_Profile_Id(((Profile) authentication.getPrincipal()).getId());
        } else {
            return eventRepository.findAll();
        }
    }

    @Override
    public Event create(EventCreateDTO dto) {
        Event event = new Event();
        eventMapper.createEventFromDto(dto, event);
        return eventRepository.save(event);
    }

    @Override
    public Event update(UUID id, EventUpdateDTO dto) {
        Event event = eventRepository.findById(id).orElseThrow(EventNotFoundException::new);
        if (dto.getCapacity() != null && event.getParticipantCount(null) > dto.getCapacity()) {
            throw new EventCapacityExceededException();
        }
        eventMapper.updateEventFromDto(dto, event);

        return eventRepository.save(event);
    }

    @Override
    public void delete(UUID id) {
        eventRepository.deleteById(id);
    }

    @Override
    @Transactional(isolation = Isolation.READ_UNCOMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public EmployeeParticipation addParticipant(UUID eventId, EmployeeParticipationUpsertDTO dto) {

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(EmployeeNotFoundException::new);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(EventNotFoundException::new);

        eventCapacityValidator.validateCapacity(event, dto.getGuestCount(), null);

        EmployeeParticipation employeeParticipation = new EmployeeParticipation(null, dto.getGuestCount(), true, employee, event, null);

        handleVisitorProfilesForGuests(employeeParticipation, dto.getGuestCount());

        return employeeParticipationRepository.save(employeeParticipation);

    }

    @Override
    @Transactional(isolation = Isolation.READ_UNCOMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public EmployeeParticipation updateParticipant(UUID eventId, EmployeeParticipationUpsertDTO dto) {

        EmployeeParticipation employeeParticipation = employeeParticipationRepository
                .findByEmployee_IdAndEvent_Id(dto.getEmployeeId(), eventId)
                .orElseThrow(ParticipationNotFoundException::new);

        eventCapacityValidator.validateCapacity(employeeParticipation.getEvent(), dto.getGuestCount(), employeeParticipation);

        handleVisitorProfilesForGuests(employeeParticipation, dto.getGuestCount());

        return employeeParticipationRepository.save(employeeParticipation);
    }

    @Override
    @Transactional(isolation = Isolation.READ_UNCOMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public List<EmployeeParticipation> addParticipantsBatch(UUID eventId, List<EmployeeParticipationUpsertDTO> dtos) {
        List<EmployeeParticipation> participationsToCreate = new java.util.ArrayList<>();

        Event event = eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);

        for (EmployeeParticipationUpsertDTO dto : dtos) {
            Employee employee = employeeRepository.findById(dto.getEmployeeId()).orElseThrow(EmployeeNotFoundException::new);

            EmployeeParticipation employeeParticipation = new EmployeeParticipation(null, dto.getGuestCount(), true, employee, event, null);

            handleVisitorProfilesForGuests(employeeParticipation, dto.getGuestCount());

            participationsToCreate.add(employeeParticipation);

        }

        eventCapacityValidator.validateBatchCapacity(event, participationsToCreate);

        return employeeParticipationRepository.saveAll(participationsToCreate);
    }

    @Override
    public void deleteParticipant(UUID participationId) {
        employeeParticipationRepository.deleteById(participationId);
    }

    @Override
    public boolean isParticipant(UUID eventId, UUID userId) {
        return eventRepository.existsByIdAndEmployeeParticipations_Employee_Id(eventId, userId);
    }

    private void handleVisitorProfilesForGuests(EmployeeParticipation participation, int newGuestCount) {
        int currentGuestCount = participation.getGuestCount();
        participation.setGuestCount(newGuestCount);

        Set<VisitorParticipation> visitors = participation.getVisitorParticipations();

        if (newGuestCount > currentGuestCount) {
            visitorParticipationFactory.addVisitorParticipations(participation, visitors, currentGuestCount, newGuestCount);
        } else if (newGuestCount < currentGuestCount) {
            visitorParticipationFactory.removeVisitorParticipations(visitors, currentGuestCount - newGuestCount);
        }
    }


}
