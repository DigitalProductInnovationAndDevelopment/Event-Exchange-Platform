package com.itestra.eep.services.impl;

import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.EventUpdateDTO;
import com.itestra.eep.dtos.ParticipationUpsertDTO;
import com.itestra.eep.exceptions.EmployeeNotFoundException;
import com.itestra.eep.exceptions.EventCapacityExceededException;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.exceptions.ParticipationNotFoundException;
import com.itestra.eep.mappers.EventMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Participation;
import com.itestra.eep.models.Profile;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.ParticipationRepository;
import com.itestra.eep.services.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static com.itestra.eep.enums.Role.VISITOR;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EmployeeRepository employeeRepository;
    private final ParticipationRepository participationRepository;
    private final EventMapper eventMapper;

    @Override
    public Event findById(UUID id) {
        return eventRepository.findById(id).orElseThrow(EventNotFoundException::new);
    }

    @Override
    public List<Event> findAll(Authentication authentication) {
        if (Objects.isNull(authentication)) {
            return new ArrayList<>();
        } else if (authentication.getAuthorities().contains(VISITOR)) {
            return eventRepository.findByParticipations_Employee_Id(((Profile) authentication.getPrincipal()).getId());
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
    public Participation addParticipant(UUID eventId, ParticipationUpsertDTO dto) {

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(EmployeeNotFoundException::new);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(EventNotFoundException::new);

        validateCapacity(event, dto.getGuestCount(), null);

        Participation participation = new Participation(null, dto.getGuestCount(), true, employee, event, null);

        return participationRepository.save(participation);
    }

    @Override
    public Participation updateParticipant(UUID eventId, ParticipationUpsertDTO dto) {

        Participation participation = participationRepository
                .findByEmployee_IdAndEvent_Id(dto.getEmployeeId(), eventId)
                .orElseThrow(ParticipationNotFoundException::new);

        validateCapacity(participation.getEvent(), dto.getGuestCount(), participation);

        participation.setGuestCount(dto.getGuestCount());

        return participationRepository.save(participation);
    }

    @Override
    public void deleteParticipant(UUID participationId) {
        participationRepository.deleteById(participationId);
    }

    @Override
    public List<Participation> addParticipantsBatch(UUID eventId, List<ParticipationUpsertDTO> dtos) {
        List<Participation> participationsToCreate = new java.util.ArrayList<>();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(EventNotFoundException::new);

        int initialParticipantCount = event.getParticipantCount(null);
        int finalParticipantCount = initialParticipantCount;

        for (ParticipationUpsertDTO dto : dtos) {
            Employee employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(EmployeeNotFoundException::new);
            Participation participation = new Participation(null, dto.getGuestCount(), true, employee, event, null);
            participationsToCreate.add(participation);
            finalParticipantCount += dto.getGuestCount() + 1;
        }

        if (event.getCapacity() < finalParticipantCount) {
            throw new EventCapacityExceededException(event.getCapacity() - initialParticipantCount);
        }

        return participationRepository.saveAll(participationsToCreate);
    }

    private void validateCapacity(Event event, int guestCount, Participation excludeParticipation) {

        int currentTotal = event.getParticipantCount(excludeParticipation);

        int newTotal = currentTotal + guestCount + 1;

        if (newTotal > event.getCapacity()) {
            int available = event.getCapacity() - currentTotal;
            int excludedCount = excludeParticipation != null ? excludeParticipation.getGuestCount() + 1 : 0;
            throw new EventCapacityExceededException(available - excludedCount);
        }
    }

    @Override
    public boolean isParticipant(UUID eventId, UUID userId) {
        return eventRepository.existsByIdAndParticipations_Employee_Id(eventId, userId);
    }
}
