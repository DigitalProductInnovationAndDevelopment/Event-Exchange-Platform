package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.*;
import com.itestra.eep.mappers.EmployeeParticipationMapper;
import com.itestra.eep.mappers.EventMapper;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Event;
import com.itestra.eep.services.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/events")
@Slf4j
public class EventController {

    private final EventService eventService;
    private final EventMapper eventMapper;
    private final EmployeeParticipationMapper employeeParticipationMapper;

    @GetMapping("/{eventId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE') or " +
            "(hasAuthority('VISITOR') and @eventServiceImpl.isParticipant(#eventId, authentication.principal.getId()))")
    public ResponseEntity<EventDetailsDTO> getEvent(@PathVariable UUID eventId) {
        Event event = eventService.findById(eventId);
        return new ResponseEntity<>(eventMapper.toDetailsDto(event), HttpStatus.OK);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE', 'VISITOR')")
    public ResponseEntity<List<EventDetailsDTO>> getAllEvents(Authentication authentication) {
        List<Event> events = eventService.findAll(authentication);
        return new ResponseEntity<>(eventMapper.toDetailsDto(events), HttpStatus.OK);
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

    @GetMapping("/{eventId}/participants")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<List<EmployeeParticipationDetailsDTO>> getEventParticipants(@PathVariable UUID eventId) {
        Event event = eventService.findById(eventId);
        return new ResponseEntity<>(employeeParticipationMapper.map(event.getEmployeeParticipations()), HttpStatus.OK);
    }

    @PostMapping("/{eventId}/participants")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<EmployeeParticipationDetailsDTO> addEventParticipant(@PathVariable UUID eventId, @RequestBody @Valid EmployeeParticipationUpsertDTO dto) {
        EmployeeParticipation employeeParticipation = eventService.addParticipant(eventId, dto);
        return new ResponseEntity<>(employeeParticipationMapper.map(employeeParticipation), HttpStatus.OK);
    }

    @PostMapping("/{eventId}/participants/batch")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<List<EmployeeParticipationDetailsDTO>> addEventParticipantsBatch(@PathVariable UUID eventId, @RequestBody @Valid List<EmployeeParticipationUpsertDTO> dtos) {
        List<EmployeeParticipation> employeeParticipations = eventService.addParticipantsBatch(eventId, dtos);
        return new ResponseEntity<>(employeeParticipationMapper.map(employeeParticipations), HttpStatus.OK);
    }

    @PutMapping("/{eventId}/participants")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<EmployeeParticipationDetailsDTO> updateEventParticipant(@PathVariable UUID eventId, @RequestBody @Valid EmployeeParticipationUpsertDTO dto) {
        EmployeeParticipation employeeParticipation = eventService.updateParticipant(eventId, dto);
        return new ResponseEntity<>(employeeParticipationMapper.map(employeeParticipation), HttpStatus.OK);
    }

    @DeleteMapping("/participants/{participationId}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Boolean> deleteEventParticipant(@PathVariable UUID participationId) {
        eventService.deleteParticipant(participationId);
        return ResponseEntity.ok(true);
    }

}
