package com.itestra.eep.services.impl;

import com.itestra.eep.dtos.*;
import com.itestra.eep.exceptions.*;
import com.itestra.eep.factories.VisitorParticipationFactory;
import com.itestra.eep.mappers.EmployeeParticipationMapper;
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

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public Event update(UUID id, EventUpdateDTO dto) {

        Event event = eventRepository.findByIdWithUpdateLock(id).orElseThrow(EventNotFoundException::new);

        if (event.getDate().isBefore(LocalDateTime.now())) {
            throw new PastEventUpdateException();
        }

        if (dto.getCapacity() != null && (event.getEmployeeParticipantCount() + event.getVisitorParticipantCount()) > dto.getCapacity()) {
            throw new EventCapacityExceededException();
        }
        eventMapper.updateEventFromDto(dto, event);

        return eventRepository.save(event);
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void delete(UUID id) {
        Event event = eventRepository.findByIdWithUpdateLock(id)
                .orElseThrow(EventNotFoundException::new);
        eventRepository.delete(event);
    }

    @Transactional(readOnly = true)
    @Override
    public List<Profile> findAllParticipantDetails(UUID eventId) {
        return eventRepository.findAllParticipantProfilesByEventId(eventId);
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public EmployeeParticipation addParticipant(UUID eventId, EmployeeParticipationUpsertDTO dto) {

        Event event = eventRepository.findByIdWithUpdateLock(eventId).orElseThrow(EventNotFoundException::new);

        if (event.getDate().isBefore(LocalDateTime.now())) throw new ParticipantOfPastEventException();

        Employee employee = employeeRepository.findById(dto.getEmployeeId()).orElseThrow(EmployeeNotFoundException::new);

        eventCapacityValidator.validateCapacity(event, dto.getGuestCount(), null);

        EmployeeParticipation employeeParticipation = new EmployeeParticipation(null, dto.getGuestCount(), true, employee, event, null);
        employeeParticipationRepository.saveAndFlush(employeeParticipation);

        handleVisitorProfilesForGuests(employeeParticipation, 0, dto.getGuestCount());

        return employeeParticipationRepository.save(employeeParticipation);

    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public EmployeeParticipation updateParticipant(UUID eventId, EmployeeParticipationUpsertDTO dto) {

        Event event = eventRepository.findByIdWithUpdateLock(eventId).orElseThrow(EventNotFoundException::new);

        if (event.getDate().isBefore(LocalDateTime.now())) {
            throw new ParticipantOfPastEventException();
        }

        EmployeeParticipation employeeParticipation = employeeParticipationRepository
                .findByEmployee_IdAndEvent_Id(dto.getEmployeeId(), eventId)
                .orElseThrow(ParticipationNotFoundException::new);

        eventCapacityValidator.validateCapacity(event, dto.getGuestCount(), employeeParticipation);

        int oldGuestCount = employeeParticipation.getGuestCount();
        employeeParticipation.setGuestCount(dto.getGuestCount());
        // important to set before another transaction tries to read the guest count.
        employeeParticipationRepository.saveAndFlush(employeeParticipation);

        handleVisitorProfilesForGuests(employeeParticipation, oldGuestCount, dto.getGuestCount());

        return employeeParticipationRepository.save(employeeParticipation);
    }

    @Override
    public ParticipationBatchResultDTO addParticipantsBatch(UUID eventId, List<EmployeeParticipationUpsertDTO> dtos) {
        List<EmployeeParticipation> participationsToCreate = new ArrayList<>();
        List<EmployeeParticipation> participationsToUpdate = new ArrayList<>();

        Event event = eventRepository.findByIdWithUpdateLock(eventId)
                .orElseThrow(EventNotFoundException::new);

        if (event.getDate().isBefore(LocalDateTime.now())) {
            throw new ParticipantOfPastEventException();
        }

        // we create a map for existing participations to avoid excessive lookups.
        Map<UUID, EmployeeParticipation> existingParticipationsMap = event.getEmployeeParticipations()
                .stream()
                .collect(Collectors.toMap(ep -> ep.getEmployee().getId(), Function.identity()));

        // we collect all employee IDs that need to be fetched, due to new participation insertions
        Set<UUID> employeeIdsToFetch = dtos.stream()
                .map(EmployeeParticipationUpsertDTO::getEmployeeId)
                .filter(id -> !existingParticipationsMap.containsKey(id))
                .collect(Collectors.toSet());

        // batch fetch employees
        Map<UUID, Employee> employeesMap = Collections.emptyMap();
        if (!employeeIdsToFetch.isEmpty()) {
            employeesMap = employeeRepository.findAllById(employeeIdsToFetch)
                    .stream()
                    .collect(Collectors.toMap(Employee::getId, Function.identity()));
        }

        int participantCountOffsetDueToUpdate = 0;

        for (EmployeeParticipationUpsertDTO dto : dtos) {
            EmployeeParticipation existingParticipation = existingParticipationsMap.get(dto.getEmployeeId());

            if (existingParticipation != null) {
                int oldGuestCount = existingParticipation.getGuestCount();
                existingParticipation.setGuestCount(dto.getGuestCount());
                participationsToUpdate.add(existingParticipation);
                handleVisitorProfilesForGuests(existingParticipation, oldGuestCount, dto.getGuestCount());
                participantCountOffsetDueToUpdate += oldGuestCount;
            } else {
                Employee employee = employeesMap.get(dto.getEmployeeId());
                if (employee == null) {
                    throw new EmployeeNotFoundException();
                }
                EmployeeParticipation employeeParticipation = new EmployeeParticipation(
                        null, dto.getGuestCount(), true, employee, event, null
                );
                participationsToCreate.add(employeeParticipation);
            }
        }

        // Validate capacity for both new and updated participations
        List<EmployeeParticipation> allParticipations = new ArrayList<>(participationsToCreate.size() + participationsToUpdate.size());
        allParticipations.addAll(participationsToCreate);
        allParticipations.addAll(participationsToUpdate);
        eventCapacityValidator.validateBatchCapacity(event, allParticipations, participantCountOffsetDueToUpdate);

        // Save new participations
        List<EmployeeParticipation> createdParticipations =
                employeeParticipationRepository.saveAllAndFlush(participationsToCreate);

        // Handle visitor profiles for created participations
        for (EmployeeParticipation employeeParticipation : createdParticipations) {
            // old guest count is 0 because these are just being created from scratch.
            handleVisitorProfilesForGuests(employeeParticipation, 0, employeeParticipation.getGuestCount());
        }

        // persist updated participations as well
        List<EmployeeParticipation> updatedParticipations =
                employeeParticipationRepository.saveAllAndFlush(participationsToUpdate);

        // Map entities to DTOs
        List<EmployeeParticipationDetailsDTO> createdDTOs = employeeParticipationMapper.toEmployeeParticipationDetailsDTO(createdParticipations);
        List<EmployeeParticipationDetailsDTO> updatedDTOs = employeeParticipationMapper.toEmployeeParticipationDetailsDTO(updatedParticipations);

        return new ParticipationBatchResultDTO(createdDTOs, updatedDTOs);
    }

    @Override
    public void deleteParticipant(UUID participationId) {

        EmployeeParticipation employeeParticipation =
                employeeParticipationRepository.findByIdWithReadLock(participationId)
                        .orElseThrow(ParticipationNotFoundException::new);

        if (employeeParticipation.getEvent().getDate().isBefore(LocalDateTime.now())) {
            throw new ParticipantOfPastEventException();
        }

        employeeParticipationRepository.delete(employeeParticipation);

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
