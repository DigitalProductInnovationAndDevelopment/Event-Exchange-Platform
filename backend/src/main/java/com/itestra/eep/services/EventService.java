package com.itestra.eep.services;

import com.itestra.eep.dtos.EmployeeParticipationUpsertDTO;
import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.EventUpdateDTO;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Profile;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EventService {

    Event findById(UUID id);

    List<Event> findAll(LocalDateTime from, Authentication authentication);

    Event create(EventCreateDTO dto);

    Event update(UUID id, EventUpdateDTO dto);

    void delete(UUID id);

    List<Profile> findAllParticipantDetails(UUID eventId);

    EmployeeParticipation addParticipant(UUID eventId, EmployeeParticipationUpsertDTO dto);

    EmployeeParticipation updateParticipant(UUID eventId, EmployeeParticipationUpsertDTO dto);

    void deleteParticipant(UUID participationId);

    List<EmployeeParticipation> addParticipantsBatch(UUID eventId, List<EmployeeParticipationUpsertDTO> dtos);

    boolean isParticipant(UUID eventId, UUID userId);

}
