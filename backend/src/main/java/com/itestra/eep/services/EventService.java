package com.itestra.eep.services;

import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.EventUpdateDTO;
import com.itestra.eep.dtos.ParticipationUpsertDTO;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Participation;

import java.util.List;
import java.util.UUID;

public interface EventService {

    Event findById(UUID id);

    List<Event> findAll();

    Event create(EventCreateDTO dto);

    Event update(UUID id, EventUpdateDTO dto);

    void delete(UUID id);

    Participation addParticipant(ParticipationUpsertDTO dto);

    Participation updateParticipant(ParticipationUpsertDTO dto);

    void deleteParticipant(UUID participationId);

    List<Participation> addParticipantsBatch(List<ParticipationUpsertDTO> dtos);
}
