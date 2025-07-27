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
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import com.itestra.eep.dtos.ParticipationBatchResultDTO;
import com.itestra.eep.dtos.EmployeeParticipationDetailsDTO;
import com.itestra.eep.mappers.EmployeeParticipationMapper;
import com.itestra.eep.models.EmployeeParticipation;
import java.util.Set;
import java.util.UUID;

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
    private final EmployeeParticipationMapper employeeParticipationMapper;

    @Override
    @Transactional(readOnly = true)
    public Event findById(UUID id) {
        return eventRepository.findById(id).orElseThrow(EventNotFoundException::new);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> findAll(LocalDateTime from, Authentication authentication) {
        if (from == null) {
            from = LocalDateTime.now().minusYears(20);
        }

        if (authentication.getAuthorities().contains(VISITOR)) {
            return eventRepository.findByDateAfterAndVisitorParticipations_Profile_Id(from, ((Profile) authentication.getPrincipal()).getId());
        } else {
            return eventRepository.findAllByDateAfter(from);
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
        if (dto.getCapacity() != null && (event.getEmployeeParticipantCount() + event.getVisitorParticipantCount()) > dto.getCapacity()) {
            throw new EventCapacityExceededException();
        }
        eventMapper.updateEventFromDto(dto, event);

        return eventRepository.save(event);
    }

    @Override
    public void delete(UUID id) {
        eventRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    @Override
    public List<Profile> findAllParticipantDetails(UUID eventId) {
        return eventRepository.findAllParticipantProfilesByEventId(eventId);
    }

    @Override
    public EmployeeParticipation addParticipant(UUID eventId, EmployeeParticipationUpsertDTO dto) {

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(EmployeeNotFoundException::new);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(EventNotFoundException::new);

        eventCapacityValidator.validateCapacity(event, dto.getGuestCount(), null);

        EmployeeParticipation employeeParticipation = new EmployeeParticipation(null, dto.getGuestCount(), true, employee, event, null);
        employeeParticipationRepository.saveAndFlush(employeeParticipation);

        handleVisitorProfilesForGuests(employeeParticipation, 0, dto.getGuestCount());

        return employeeParticipationRepository.save(employeeParticipation);

    }

    @Override
    @Retryable(retryFor = {CannotAcquireLockException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public EmployeeParticipation updateParticipant(UUID eventId, EmployeeParticipationUpsertDTO dto) {

        EmployeeParticipation employeeParticipation = employeeParticipationRepository
                .findByEmployee_IdAndEvent_Id(dto.getEmployeeId(), eventId)
                .orElseThrow(ParticipationNotFoundException::new);

        eventCapacityValidator.validateCapacity(employeeParticipation.getEvent(), dto.getGuestCount(), employeeParticipation);

        int oldGuestCount = employeeParticipation.getGuestCount();
        employeeParticipation.setGuestCount(dto.getGuestCount());
        // important to set before another transaction tries to read the guest count.
        employeeParticipationRepository.saveAndFlush(employeeParticipation);

        handleVisitorProfilesForGuests(employeeParticipation, oldGuestCount, dto.getGuestCount());

        return employeeParticipationRepository.save(employeeParticipation);
    }

    @Override
    public ParticipationBatchResultDTO addParticipantsBatch(UUID eventId, List<EmployeeParticipationUpsertDTO> dtos) {
        List<EmployeeParticipation> participationsToCreate = new java.util.ArrayList<>();
        List<EmployeeParticipation> participationsToUpdate = new java.util.ArrayList<>();

        Event event = eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);

        for (EmployeeParticipationUpsertDTO dto : dtos) {
            Employee employee = employeeRepository.findById(dto.getEmployeeId()).orElseThrow(EmployeeNotFoundException::new);
            // Check if participation already exists
            EmployeeParticipation existingParticipation = employeeParticipationRepository
                .findByEmployee_IdAndEvent_Id(dto.getEmployeeId(), eventId)
                .orElse(null);
            if (existingParticipation != null) {
                int oldGuestCount = existingParticipation.getGuestCount();
                existingParticipation.setGuestCount(dto.getGuestCount());
                participationsToUpdate.add(existingParticipation);
                handleVisitorProfilesForGuests(existingParticipation, oldGuestCount, dto.getGuestCount());
            } else {
                EmployeeParticipation employeeParticipation = new EmployeeParticipation(null, dto.getGuestCount(), true, employee, event, null);
                participationsToCreate.add(employeeParticipation);
            }
        }

        // Validate capacity for both new and updated participations
        List<EmployeeParticipation> allParticipations = new java.util.ArrayList<>();
        allParticipations.addAll(participationsToCreate);
        allParticipations.addAll(participationsToUpdate);
        eventCapacityValidator.validateBatchCapacity(event, allParticipations);

        // Save new participations
        List<EmployeeParticipation> createdParticipations = employeeParticipationRepository.saveAllAndFlush(participationsToCreate);
        for (EmployeeParticipation employeeParticipation : createdParticipations) {
            handleVisitorProfilesForGuests(employeeParticipation, 0, employeeParticipation.getGuestCount());
        }

        // Save updated participations
        List<EmployeeParticipation> updatedParticipations = employeeParticipationRepository.saveAllAndFlush(participationsToUpdate);

        // Map entities to DTOs here
        List<EmployeeParticipationDetailsDTO> createdDtos = employeeParticipationMapper.map(createdParticipations);
        List<EmployeeParticipationDetailsDTO> updatedDtos = employeeParticipationMapper.map(updatedParticipations);

        // Return DTO with both lists
        return new ParticipationBatchResultDTO(createdDtos, updatedDtos);
    }

    @Override
    public void deleteParticipant(UUID participationId) {
        employeeParticipationRepository.deleteById(participationId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isParticipant(UUID eventId, UUID userId) {
        boolean employeeParticipates = eventRepository.existsByIdAndEmployeeParticipations_Employee_Id(eventId, userId);

        boolean visitorParticipates = eventRepository.existsByIdAndVisitorParticipations_Profile_Id(eventId, userId);

        return employeeParticipates || visitorParticipates;
    }

    private void handleVisitorProfilesForGuests(EmployeeParticipation participation, int oldGuestCount, int newGuestCount) {

        Set<VisitorParticipation> visitors = participation.getVisitorParticipations();

        if (newGuestCount > oldGuestCount) {
            visitorParticipationFactory.insertVisitorParticipations(participation, oldGuestCount, newGuestCount);
        } else if (newGuestCount < oldGuestCount) {
            visitorParticipationFactory.deleteVisitorParticipations(visitors, oldGuestCount - newGuestCount);
        }
    }


}
