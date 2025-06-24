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
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.ParticipationRepository;
import com.itestra.eep.services.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;


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
    public List<Event> findAll() {
        return eventRepository.findAll();
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
        eventMapper.updateEventFromDto(dto, event);
        return eventRepository.save(event);
    }

    @Override
    public void delete(UUID id) {
        eventRepository.deleteById(id);
    }

    @Override
    public Participation addParticipant(ParticipationUpsertDTO dto) {

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(EmployeeNotFoundException::new);
        Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(EventNotFoundException::new);

        validateCapacity(event, dto.getGuestCount(), null);

        Participation participation = new Participation(null, dto.getGuestCount(), true, employee, event, null);

        return participationRepository.save(participation);
    }

    @Override
    public Participation updateParticipant(ParticipationUpsertDTO dto) {

        Participation participation = participationRepository
                .findByEmployee_IdAndEvent_Id(dto.getEmployeeId(), dto.getEventId())
                .orElseThrow(ParticipationNotFoundException::new);

        validateCapacity(participation.getEvent(), dto.getGuestCount(), participation);

        participation.setGuestCount(dto.getGuestCount());

        return participationRepository.save(participation);
    }

    @Override
    public void deleteParticipant(UUID participationId) {
        participationRepository.deleteById(participationId);
    }

    private void validateCapacity(Event event, int guestCount, Participation excludeParticipation) {

        int currentTotal = event.getParticipations().stream()
                .filter(p -> excludeParticipation == null || !p.getId().equals(excludeParticipation.getId()))
                .mapToInt(p -> p.getGuestCount() + 1)
                .sum();

        int newTotal = currentTotal + guestCount + 1;

        if (newTotal > event.getCapacity()) {
            int available = event.getCapacity() - currentTotal;
            int excludedCount = excludeParticipation != null ? excludeParticipation.getGuestCount() + 1 : 0;
            throw new EventCapacityExceededException(available - excludedCount);
        }
    }
}
