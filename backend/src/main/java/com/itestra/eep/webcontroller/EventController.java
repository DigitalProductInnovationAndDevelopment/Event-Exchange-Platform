package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.EventDetailsDTO;
import com.itestra.eep.dtos.EventUpdateDTO;
import com.itestra.eep.mappers.EventMapper;
import com.itestra.eep.models.Event;
import com.itestra.eep.services.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;


@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final EventMapper eventMapper;

    @GetMapping("/{eventId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE', 'PARTNER') or " +
            "(hasAuthority('VISITOR') and @eventServiceImpl.isParticipant(#eventId, authentication.principal.getId()))")
    public ResponseEntity<EventDetailsDTO> getEvent(@PathVariable UUID eventId, Authentication authentication) {
        Event event = eventService.findById(eventId);
        return new ResponseEntity<>(eventMapper.toDetailsDto(event, authentication), HttpStatus.OK);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE', 'PARTNER', 'VISITOR')")
    public ResponseEntity<List<?>> getAllEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            Authentication authentication) {
        List<Event> events = eventService.findAll(from, authentication);
        if (Objects.isNull(from)) {
            // we assume we are in the All Events List page, and we don't need all the unnecessary event related data like
            // the profile related data (dietary preferences, etc.) of participants.
            // we will just return a minimal dto instead and reduce database operations significantly.
            return new ResponseEntity<>(eventMapper.toMinimalDetailsDto(events), HttpStatus.OK);
        } else {
            // this branch is called from dashboard most likely, and we need event and its participant profile details. So we return this more detailed dto.
            return new ResponseEntity<>(eventMapper.toDetailsDto(events, authentication), HttpStatus.OK);
        }
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
