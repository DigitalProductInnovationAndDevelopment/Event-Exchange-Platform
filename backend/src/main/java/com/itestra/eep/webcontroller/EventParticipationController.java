package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.EmployeeParticipationDetailsDTO;
import com.itestra.eep.dtos.EmployeeParticipationUpsertDTO;
import com.itestra.eep.dtos.ParticipationBatchResultDTO;
import com.itestra.eep.mappers.EmployeeParticipationMapper;
import com.itestra.eep.models.EmployeeParticipation;
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


@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/events")
public class EventParticipationController {

    private final EventService eventService;
    private final EmployeeParticipationMapper employeeParticipationMapper;

    @GetMapping("/{eventId}/participants")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<EmployeeParticipationDetailsDTO>> getEventEmployeeParticipants(@PathVariable UUID eventId) {
        Event event = eventService.findById(eventId);
        return new ResponseEntity<>(employeeParticipationMapper.map(event.getEmployeeParticipations()), HttpStatus.OK);
    }

    @PostMapping("/{eventId}/participants")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EmployeeParticipationDetailsDTO> addEventParticipant(@PathVariable UUID eventId, @RequestBody @Valid EmployeeParticipationUpsertDTO dto) {
        EmployeeParticipation employeeParticipation = eventService.addParticipant(eventId, dto);
        return new ResponseEntity<>(employeeParticipationMapper.map(employeeParticipation), HttpStatus.OK);
    }

    @PostMapping("/{eventId}/participants/batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ParticipationBatchResultDTO> addEventParticipantsBatch(@PathVariable UUID eventId, @RequestBody @Valid List<EmployeeParticipationUpsertDTO> dtos) {
        var batchResult = eventService.addParticipantsBatch(eventId, dtos);
        return new ResponseEntity<>(batchResult, HttpStatus.OK);
    }

    @PutMapping("/{eventId}/participants")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EmployeeParticipationDetailsDTO> updateEventParticipant(@PathVariable UUID eventId, @RequestBody @Valid EmployeeParticipationUpsertDTO dto) {
        EmployeeParticipation employeeParticipation = eventService.updateParticipant(eventId, dto);
        return new ResponseEntity<>(employeeParticipationMapper.map(employeeParticipation), HttpStatus.OK);
    }

    @DeleteMapping("/participants/{participationId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> deleteEventParticipant(@PathVariable UUID participationId) {
        eventService.deleteParticipant(participationId);
        return ResponseEntity.ok(true);
    }

}
