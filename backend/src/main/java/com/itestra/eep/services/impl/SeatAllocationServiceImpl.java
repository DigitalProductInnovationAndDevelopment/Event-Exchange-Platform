package com.itestra.eep.services.impl;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.SeatAllocationUpsertDTO;
import com.itestra.eep.dtos.constraintSolver.ConstraintSolverDTO;
import com.itestra.eep.dtos.constraintSolver.ConstraintSolverTableDTO;
import com.itestra.eep.dtos.constraintSolver.StageMapDTO;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.exceptions.InfeasibleSeatAllocationException;
import com.itestra.eep.exceptions.NotEnoughSeatForSeatAllocationException;
import com.itestra.eep.exceptions.ParticipantOfPastEventException;
import com.itestra.eep.mappers.EmployeeParticipationMapper;
import com.itestra.eep.models.Chair;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.VisitorParticipation;
import com.itestra.eep.repositories.ChairRepository;
import com.itestra.eep.repositories.EmployeeParticipationRepository;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.VisitorParticipationRepository;
import com.itestra.eep.services.EventService;
import com.itestra.eep.services.SeatAllocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class SeatAllocationServiceImpl implements SeatAllocationService {

    private final EventRepository eventRepository;
    private final ChairRepository chairRepository;
    private final ObjectMapper objectMapper;
    private final EventService eventService;
    private final EmployeeParticipationMapper employeeParticipationMapper;
    private final EmployeeParticipationRepository employeeParticipationRepository;
    private final VisitorParticipationRepository visitorParticipationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SeatAllocationDetailsDTO> getSeatAllocations(UUID eventId) {
        eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);
        return eventRepository.findCurrentSeatAllocationsByEventId(eventId);
    }


    @Override
    // TODO open for further optimization, maybe chair updates in the end can be batched.
    public void updateSeatAllocation(List<SeatAllocationUpsertDTO> dtos, UUID eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);

        if (event.getDate().isBefore(LocalDateTime.now())) {
            throw new ParticipantOfPastEventException();
        }

        List<UUID> allChairIds = new ArrayList<>();
        List<UUID> allParticipationIds = new ArrayList<>();

        for (SeatAllocationUpsertDTO dto : dtos) {
            allChairIds.add(dto.getChairId());
            allParticipationIds.add(dto.getParticipationId());
        }

        Set<UUID> existingChairIds = chairRepository.findAllByIdIn(allChairIds);
        Set<UUID> employeeParticipantIds = employeeParticipationRepository.findExistingEmployeeParticipationIdsIn(allParticipationIds);
        Set<UUID> visitorParticipantIds = visitorParticipationRepository.findExistingVisitorParticipationIdsIn(allParticipationIds);

        List<UUID> missingChairIds = allChairIds.stream()
                .filter(id -> Objects.nonNull(id) && !existingChairIds.contains(id))
                .toList();


        List<Chair> newChairs = missingChairIds.stream().map(chairId -> new Chair(chairId, event)).toList();

        if (!newChairs.isEmpty()) {
            chairRepository.saveAllAndFlush(newChairs);
        }

        for (SeatAllocationUpsertDTO dto : dtos) {
            if (employeeParticipantIds.contains(dto.getParticipationId())) {
                eventRepository.updateEmployeeParticipationChairId(dto.getParticipationId(), dto.getChairId());
            } else if (visitorParticipantIds.contains(dto.getParticipationId())) {
                eventRepository.updateVisitorParticipationChairId(dto.getParticipationId(), dto.getChairId());
            }
        }

    }

    // TODO refactor and think of optimization
    @Override
    public void performTableBasedSeatAllocation(UUID eventId, StageMapDTO stageMap) throws IOException, InterruptedException {
        Event event = eventService.findById(eventId);

        List<EmployeeParticipation> employeeParticipations = event.getEmployeeParticipations();
        List<ConstraintSolverDTO> formattedData = employeeParticipationMapper.toConstraintSolverDTO(employeeParticipations);


        Map<UUID, List<UUID>> tablesAndTheirSeats = stageMap.getSeatMap().entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> new ArrayList<>(entry.getValue().keySet())
                ));

        int totalAvailableSeat = tablesAndTheirSeats.values().stream()
                .mapToInt(List::size)
                .sum();

        if (event.getParticipantCount() > totalAvailableSeat) {
            throw new NotEnoughSeatForSeatAllocationException();
        }


        // we create input and output temp files
        Path tempInputFile = Files.createTempFile("input", ".json");
        Path tempTableFile = Files.createTempFile("table", ".json");
        Path tempConstraintsFile = Files.createTempFile("constraints", ".json");
        Path tempOutputFile = Files.createTempFile("output", ".json");

        // we serialize Java objects to JSON and write to input file so that our python script can read them.
        ObjectMapper mapper = new ObjectMapper();
        String jsonString = mapper.writeValueAsString(formattedData);
        Files.writeString(tempInputFile, jsonString);

        Set<ConstraintSolverTableDTO> tableDTOS = stageMap.getSeatMap().entrySet().stream()
                .map(entry -> new ConstraintSolverTableDTO(entry.getKey(), entry.getValue().size()))
                .collect(Collectors.toSet());

        Files.writeString(tempTableFile, mapper.writeValueAsString(tableDTOS));
        // Files.writeString(tempConstraintsFile, stageMap.getConstraints().toString());
        Files.writeString(tempConstraintsFile, mapper.writeValueAsString(stageMap.getConstraints()));


        ProcessBuilder pb;

        if (Files.notExists(Path.of("../venv/bin/python"))) {
            pb = new ProcessBuilder(
                    "python3",
                    "/algo(table).py", tempInputFile.toString(), tempTableFile.toString(), tempConstraintsFile.toString(), tempOutputFile.toString()
            );
        } else {
            pb = new ProcessBuilder(
                    "../venv/bin/python",
                    "algo(table).py", tempInputFile.toString(), tempTableFile.toString(), tempConstraintsFile.toString(), tempOutputFile.toString()
            );
        }

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
        if (exitCode == 255) throw new InfeasibleSeatAllocationException();

        BufferedReader fileReader = Files.newBufferedReader(tempOutputFile);
        List<ConstraintSolverDTO> solved = objectMapper.readValue(fileReader, new TypeReference<>() {
        });

        /*
            String line2;
            while ((line2 = fileReader.readLine()) != null) {
                log.info(line2);
            }
        */

        solved.forEach(solvedConstraint -> {
                    EmployeeParticipation employeeParticipation = employeeParticipationRepository.findByEmployee_IdAndEvent_Id(solvedConstraint.getProfileId(), eventId).get();
                    VisitorParticipation[] visitorParticipations = employeeParticipation.getVisitorParticipations().toArray(new VisitorParticipation[0]);
            for (int j = 0; j < (solvedConstraint.getTableIds()).length; j++) {
                UUID tableKey = UUID.fromString(Arrays.copyOf(solvedConstraint.getTableIds(), solvedConstraint.getTableIds().length, String[].class)[0]);

                        if (j == 0) {
                            updateSeatAllocation(Collections.singletonList(new SeatAllocationUpsertDTO(employeeParticipation.getId(), tablesAndTheirSeats.get(tableKey).get(0))), eventId);
                            tablesAndTheirSeats.get(tableKey).remove(0);
                        } else {
                            updateSeatAllocation(Collections.singletonList(new SeatAllocationUpsertDTO(visitorParticipations[j - 1].getId(), tablesAndTheirSeats.get(tableKey).get(0))), eventId);
                            tablesAndTheirSeats.get(tableKey).remove(0);
                        }
                    }
                }
        );


        // delete temp files
        Files.deleteIfExists(tempInputFile);
        Files.deleteIfExists(tempTableFile);
        Files.deleteIfExists(tempConstraintsFile);
        Files.deleteIfExists(tempOutputFile);
    }

}
