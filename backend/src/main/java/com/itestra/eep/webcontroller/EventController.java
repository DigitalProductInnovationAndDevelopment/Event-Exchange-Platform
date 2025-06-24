package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.EventDetailsDTO;
import com.itestra.eep.dtos.EventUpdateDTO;
import com.itestra.eep.mappers.EventMapper;
import com.itestra.eep.models.Event;
import com.itestra.eep.services.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final EventMapper eventMapper;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE', 'VISITOR')")
    public ResponseEntity<EventDetailsDTO> getEvent(@PathVariable UUID id) {
        Event event = eventService.findById(id);
        return new ResponseEntity<>(eventMapper.toDetailsDto(event), HttpStatus.OK);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE', 'VISITOR')")
    public ResponseEntity<List<EventDetailsDTO>> getAllEvents() {
        List<Event> events = eventService.findAll();
        return new ResponseEntity<>(eventMapper.toDetailsDto(events), HttpStatus.OK);
    }

    @GetMapping("/{eventId}/participants")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<List<ParticipationDetailsDTO>> getEventParticipants(@PathVariable UUID eventId) {
        Event event = eventService.findById(eventId);
        return new ResponseEntity<>(participationMapper.map(event.getParticipations()), HttpStatus.OK);
    }

    @PostMapping("/{eventId}/participants")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ParticipationDetailsDTO> addEventParticipant(@RequestBody @Valid ParticipationUpsertDTO dto) {
        Participation participation = eventService.addParticipant(dto);
        return new ResponseEntity<>(participationMapper.map(List.of(participation)).get(0), HttpStatus.OK);
    }

    @PutMapping("/{eventId}/participants")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ParticipationDetailsDTO> updateEventParticipant(@RequestBody @Valid ParticipationUpsertDTO dto) {
        Participation participation = eventService.updateParticipant(dto);
        return new ResponseEntity<>(participationMapper.map(List.of(participation)).get(0), HttpStatus.OK);
    }

    @DeleteMapping("/participants/{participationId}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Boolean> deleteEventParticipant(@PathVariable UUID participationId) {
        eventService.deleteParticipant(participationId);
        return ResponseEntity.ok(true);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EventCreateDTO> createEvent(@RequestBody @Valid EventCreateDTO eventCreateDTO) {
        Event event = eventService.create(eventCreateDTO);
        return new ResponseEntity<>(eventMapper.toCreateDto(event), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EventUpdateDTO> updateEvent(@PathVariable UUID id, @RequestBody @Valid EventUpdateDTO eventUpdateDTO) {
        Event updatedEvent = eventService.update(id, eventUpdateDTO);
        return new ResponseEntity<>(eventMapper.toUpdateDto(updatedEvent), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> deleteEvent(@PathVariable UUID id) {
        eventService.delete(id);
        return ResponseEntity.ok(true);
    }


}
