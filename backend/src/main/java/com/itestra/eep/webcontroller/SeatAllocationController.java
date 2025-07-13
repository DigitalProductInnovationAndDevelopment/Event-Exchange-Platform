package com.itestra.eep.webcontroller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itestra.eep.dtos.ConstraintSolverDTO;
import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.SeatAllocationUpsertDTO;
import com.itestra.eep.mappers.EmployeeParticipationMapper;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Event;
import com.itestra.eep.services.EventService;
import com.itestra.eep.services.SeatAllocationService;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@Slf4j
@RequestMapping("/seat-allocation")
public class SeatAllocationController {

    private final EventService eventService;
    private final SeatAllocationService seatAllocationService;
    private final EmployeeParticipationMapper employeeParticipationMapper;

    @GetMapping("/{eventId}/assign")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<SeatAllocationDetailsDTO>> assignTables(@PathVariable UUID eventId) throws IOException, InterruptedException {
        Event event = eventService.findById(eventId);
        List<EmployeeParticipation> employeeParticipations = event.getEmployeeParticipations();
        List<ConstraintSolverDTO> formattedData = employeeParticipationMapper.toConstraintSolverDTO(employeeParticipations);

        // we create input and output temp files
        Path tempInputFile = Files.createTempFile("input", ".json");
        Path tempTableFile = Files.createTempFile("table", ".json");
        Path tempConstraintsFile = Files.createTempFile("constraints", ".json");
        Path tempOutputFile = Files.createTempFile("output", ".json");

        // we serialize Java objects to JSON and write to input file so that our python script can read them.
        ObjectMapper mapper = new ObjectMapper();
        String jsonString = mapper.writeValueAsString(formattedData);
        Files.writeString(tempInputFile, jsonString);
        Files.writeString(tempTableFile, "[{\"table_id\": 1,\"Anzahl\": 6},{\"table_id\": 2,\"Anzahl\": 6},{\"table_id\": 3,\"Anzahl\": 6}]");
        Files.writeString(tempConstraintsFile, "{\"Standort\": 1, \"Projekt\": 1, \"Anstellung\": 1, \"Geschlecht\": 0, \"last neighborhood\": 3}");

        ProcessBuilder pb = new ProcessBuilder(
                "../venv/bin/python",
                "algo(table).py", tempInputFile.toString(), tempTableFile.toString(), tempConstraintsFile.toString(), tempOutputFile.toString()
        );

        // we set the working directory to where algo.py is located
        pb.directory(new File("."));
        pb.redirectErrorStream(true);

        Process process = pb.start();

        // Read script output
        /*BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
            log.info(line);
        }*/

        int exitCode = process.waitFor();
        log.info("Exited with code: {}", exitCode);

        BufferedReader fileReader = Files.newBufferedReader(tempOutputFile);
        String line;
        while ((line = fileReader.readLine()) != null) {
            log.info(line);
        }


        // delete temp files
        Files.deleteIfExists(tempInputFile);
        Files.deleteIfExists(tempTableFile);
        Files.deleteIfExists(tempConstraintsFile);
        Files.deleteIfExists(tempOutputFile);

        List<SeatAllocationDetailsDTO> seatAllocations = seatAllocationService.getSeatAllocations(eventId);
        return new ResponseEntity<>(seatAllocations, HttpStatus.OK);
    }

    @GetMapping("/{eventId}/allocations")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<SeatAllocationDetailsDTO>> getSeatAllocations(@PathVariable UUID eventId) {
        List<SeatAllocationDetailsDTO> seatAllocations = seatAllocationService.getSeatAllocations(eventId);
        return new ResponseEntity<>(seatAllocations, HttpStatus.OK);
    }

    @PutMapping("/allocations")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> setSeatAllocations(@RequestBody SeatAllocationUpsertDTO dto) {
        seatAllocationService.updateSeatAllocation(dto.getParticipationId(), dto.getChairId());
        return ResponseEntity.ok(true);
    }

}
