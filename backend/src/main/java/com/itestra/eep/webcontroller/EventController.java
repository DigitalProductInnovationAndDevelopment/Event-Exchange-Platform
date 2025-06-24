package com.itestra.eep.webcontroller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itestra.eep.dtos.*;
import com.itestra.eep.mappers.EventMapper;
import com.itestra.eep.mappers.ParticipationMapper;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Participation;
import com.itestra.eep.services.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
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
    private final ParticipationMapper participationMapper;

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

    @GetMapping("/assign/{eventId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> assignTables(@PathVariable UUID eventId) throws IOException, InterruptedException {
        Event event = eventService.findById(eventId);
        List<Participation> participations = event.getParticipations();
        List<ConstraintSolverDTO> formattedData = participationMapper.toConstraintSolverDTO(participations);

        // we create input and output temp files
        Path tempInputFile = Files.createTempFile("input", ".json");
        Path tempOutputFile = Files.createTempFile("output", ".json");

        // we serialize Java objects to JSON and write to input file so that our python script can read them.
        ObjectMapper mapper = new ObjectMapper();
        String jsonString = mapper.writeValueAsString(formattedData);
        Files.write(tempInputFile, jsonString.getBytes(StandardCharsets.UTF_8));

        ProcessBuilder pb = new ProcessBuilder(
                "../venv/bin/python",
                "algo.py", tempInputFile.toString(), tempOutputFile.toString()
        );

        // we set the working directory to where algo.py is located
        pb.directory(new File("."));
        pb.redirectErrorStream(true);

        Process process = pb.start();

        // Read script output
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
            log.info(line);
        }

        int exitCode = process.waitFor();
        log.info("Exited with code: {}", exitCode);

        // delete temp files
        Files.deleteIfExists(tempInputFile);
        Files.deleteIfExists(tempOutputFile);

        return ResponseEntity.ok(true);
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
