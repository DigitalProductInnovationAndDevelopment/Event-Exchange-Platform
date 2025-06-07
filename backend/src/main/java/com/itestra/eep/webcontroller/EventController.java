package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.EventCreateDTO;
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
    @PreAuthorize("hasAnyAuthority('ADMIN', 'VISITOR')")
    public ResponseEntity<EventCreateDTO> getEvent(@PathVariable UUID id) {
        Event event = eventService.findById(id);
        return new ResponseEntity<>(eventMapper.toCreateDto(event), HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EventCreateDTO> createEvent(@RequestBody EventCreateDTO eventCreateDTO) {
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
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
