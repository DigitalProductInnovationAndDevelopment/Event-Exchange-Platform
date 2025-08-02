package com.itestra.eep.services.impl;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.constraintSolver.ConstraintSolverDTO;
import com.itestra.eep.dtos.constraintSolver.ConstraintSolverTableDTO;
import com.itestra.eep.dtos.constraintSolver.StageMapDTO;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.exceptions.InfeasibleSeatAllocationException;
import com.itestra.eep.exceptions.NoBigEnoughTableException;
import com.itestra.eep.exceptions.NotEnoughSeatForSeatAllocationException;
import com.itestra.eep.mappers.EmployeeParticipationMapper;
import com.itestra.eep.models.*;
import com.itestra.eep.repositories.ChairRepository;
import com.itestra.eep.repositories.EmployeeParticipationRepository;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.PreviousMatchesRepository;
import com.itestra.eep.services.SeatAllocationService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class SeatAllocationServiceImpl implements SeatAllocationService {

    @Value("${constraint-solver.num-search-workers}")
    private String NUM_SEARCH_WORKERS;

    @Value("${constraint-solver.solver-time-limit}")
    private String SOLVER_TIME_LIMIT;

    private final EventRepository eventRepository;
    private final ChairRepository chairRepository;
    private final ObjectMapper objectMapper;
    private final PreviousMatchesRepository previousMatchesRepository;
    private final EmployeeParticipationMapper employeeParticipationMapper;
    private final EmployeeParticipationRepository employeeParticipationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SeatAllocationDetailsDTO> getSeatAllocations(UUID eventId) {
        eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);
        return eventRepository.findCurrentSeatAllocationsByEventId(eventId);
    }

    @Override
    public <T extends Participation> void assignOneParticipantToChairAndPersistNewNeighbors(UUID participationId, UUID chairId, UUID eventId,
                                                                                            Class<T> participationClass, UUID[] neighborProfileIds) {
        // first assign the chair
        Event event = eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);

        if (chairId != null) chairRepository.batchInsertChair(List.of(new Chair(chairId, event)));

        // update chair assignment based on participation type
        Optional<EmployeeParticipation> employeeParticipation = employeeParticipationRepository.findById(participationId);

        updateChairAssignmentByType(participationId, chairId, employeeParticipation.isPresent());

        if (chairId == null) {
            // if unassigning from chair, clean up previous matches
            employeeParticipationRepository.findById(participationId)
                    .ifPresent(participation ->
                            previousMatchesRepository.deleteByEventIdAndEmployeeId(eventId, participation.getEmployee().getId())
                    );
        } else if (neighborProfileIds != null && neighborProfileIds.length > 0) {
            // if assigning to chair with neighbors, record previous matches
            persistNewEmployeePreviousMatches(eventId, neighborProfileIds, employeeParticipation);
        }
    }

    private void updateChairAssignmentByType(UUID participationId, UUID chairId, boolean isEmployeeParticipation) {
        if (isEmployeeParticipation) {
            chairRepository.updateEmployeeParticipationChairId(participationId, chairId);
        } else {
            chairRepository.updateVisitorParticipationChairId(participationId, chairId);
        }
    }

    private void persistNewEmployeePreviousMatches(UUID eventId, UUID[] neighborProfileIds, Optional<EmployeeParticipation> employeeParticipation) {

        // if not an employee participation then no need to record matches
        if (employeeParticipation.isEmpty()) {
            return;
        }

        UUID employeeId = employeeParticipation.get().getEmployee().getId();
        List<PreviousMatch.PreviousMatchId> newPreviousMatches = calculateBidirectionalMatches(employeeId, neighborProfileIds, eventId);

        if (!newPreviousMatches.isEmpty()) {
            previousMatchesRepository.batchInsertPreviousMatches(newPreviousMatches);
        }
    }

    private List<PreviousMatch.PreviousMatchId> calculateBidirectionalMatches(UUID employeeId, UUID[] neighborIds, UUID eventId) {
        List<PreviousMatch.PreviousMatchId> matches = new ArrayList<>(neighborIds.length * 2);

        for (UUID neighborId : neighborIds) {
            // we create bidirectional matches here
            matches.add(new PreviousMatch.PreviousMatchId(employeeId, neighborId, eventId));
            matches.add(new PreviousMatch.PreviousMatchId(neighborId, employeeId, eventId));
        }

        return matches;
    }


    @Override
    public void performTableBasedSeatAllocation(UUID eventId, StageMapDTO stageMap) throws IOException, InterruptedException {

        // Delete all previous matches for this event before we start calculating for a clean state
        // in case of any exception, they will be rolled back of course.
        previousMatchesRepository.deleteAllByEventId(eventId);
        previousMatchesRepository.flush();

        Event event = eventRepository.findByIdJoinedWithPreviousMatches(eventId).orElseThrow(EventNotFoundException::new);

        List<EmployeeParticipation> employeeParticipations = event.getEmployeeParticipations().stream().toList();
        List<ConstraintSolverDTO> formattedData = employeeParticipationMapper.toConstraintSolverDTO(employeeParticipations);

        Map<UUID, List<UUID>> tablesAndTheirSeats = stageMap.getSeatMap().entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> new ArrayList<>(entry.getValue().keySet())));

        // we create input and output temp files
        try (TempFileManager tempFiles = new TempFileManager()) {
            writeInputFiles(tempFiles, formattedData, stageMap);

            runPythonScript(tempFiles);

            BufferedReader fileReader = Files.newBufferedReader(tempFiles.outputFile);
            List<ConstraintSolverDTO> solved = objectMapper.readValue(fileReader, new TypeReference<>() {
            });

            Map<UUID, EmployeeParticipation> existingEmployeeParticipationsMap = event.getEmployeeParticipations()
                    .stream()
                    .collect(Collectors.toMap(ep -> ep.getEmployee().getId(), Function.identity()));


            Map<UUID, List<UUID>> tableToEmployeesMap = new HashMap<>();
            List<Chair> chairsToPersist = new ArrayList<>();
            Map<UUID, UUID> employeeParticipationToChairMap = new HashMap<>();
            Map<UUID, UUID> visitorParticipationToChairMap = new HashMap<>();

            solved.forEach(solvedConstraint -> {
                        EmployeeParticipation employeeParticipation = existingEmployeeParticipationsMap.get(solvedConstraint.getProfileId());
                        VisitorParticipation[] visitorParticipations = employeeParticipation.getVisitorParticipations().toArray(new VisitorParticipation[0]);
                        for (int j = 0; j < (solvedConstraint.getTableIds()).length; j++) {
                            UUID tableKey = UUID.fromString(Arrays.copyOf(solvedConstraint.getTableIds(), solvedConstraint.getTableIds().length, String[].class)[0]);

                            UUID selectedChairId = tablesAndTheirSeats.get(tableKey).get(0);
                            chairsToPersist.add(new Chair(selectedChairId, event));

                            // first the employee is seated
                            if (j == 0) {
                                employeeParticipationToChairMap.put(employeeParticipation.getId(), selectedChairId);
                                tablesAndTheirSeats.get(tableKey).remove(0);
                                // we also track employee's table assignment so that we can reference them back whn we calculate new entities for PreviousMatches table
                                tableToEmployeesMap.computeIfAbsent(tableKey, k -> new ArrayList<>()).add(employeeParticipation.getEmployee().getId());
                            } else {
                                visitorParticipationToChairMap.put(visitorParticipations[j - 1].getId(), selectedChairId);
                                tablesAndTheirSeats.get(tableKey).remove(0);
                            }
                        }
                    }
            );

            persistNewChairAssignments(eventId, chairsToPersist, employeeParticipationToChairMap, visitorParticipationToChairMap);

            persistPreviousMatchesDueToNewMatchings(eventId, tableToEmployeesMap);
        }
    }

    private void runPythonScript(TempFileManager tempFiles) throws IOException, InterruptedException {
        ProcessBuilder pb;

        if (Files.notExists(Path.of("../venv/bin/python"))) {
            pb = new ProcessBuilder(
                    "python3",
                    "/algo(table).py", tempFiles.inputFile.toString(), tempFiles.tableFile.toString(), tempFiles.constraintsFile.toString(), tempFiles.outputFile.toString(),
                    NUM_SEARCH_WORKERS, SOLVER_TIME_LIMIT
            );
        } else {
            pb = new ProcessBuilder(
                    "../venv/bin/python",
                    "algo(table).py", tempFiles.inputFile.toString(), tempFiles.tableFile.toString(), tempFiles.constraintsFile.toString(),
                    tempFiles.outputFile.toString(), NUM_SEARCH_WORKERS, SOLVER_TIME_LIMIT
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
        else if (exitCode == 2) throw new NotEnoughSeatForSeatAllocationException();
        else if (exitCode == 3) throw new NoBigEnoughTableException();
    }

    private void persistNewChairAssignments(UUID eventId, List<Chair> chairsToPersist, Map<UUID, UUID> employeeParticipationToChairMap, Map<UUID, UUID> visitorParticipationToChairMap) {
        chairRepository.unsetAllEmployeeParticipationChairsByEventId(eventId);
        chairRepository.unsetAllVisitorParticipationChairsByEventId(eventId);
        chairRepository.flush();
        chairRepository.batchInsertChair(chairsToPersist);
        chairRepository.batchUpdateEmployeeParticipationsChairAssignments(employeeParticipationToChairMap);
        chairRepository.batchUpdateVisitorParticipationsChairAssignments(visitorParticipationToChairMap);
    }

    private void persistPreviousMatchesDueToNewMatchings(UUID eventId, Map<UUID, List<UUID>> tableToEmployeesMap) {

        // Create new previous matches for employees seated at the same table
        List<PreviousMatch.PreviousMatchId> newPreviousMatches = new ArrayList<>();

        // Create pairs for each table
        tableToEmployeesMap.values().forEach(employeesAtTable -> {
            for (int i = 0; i < employeesAtTable.size(); i++) {
                for (int j = i + 1; j < employeesAtTable.size(); j++) {
                    UUID employeeId1 = employeesAtTable.get(i);
                    UUID employeeId2 = employeesAtTable.get(j);
                    newPreviousMatches.add(new PreviousMatch.PreviousMatchId(employeeId1, employeeId2, eventId));
                    newPreviousMatches.add(new PreviousMatch.PreviousMatchId(employeeId2, employeeId1, eventId));
                }
            }
        });

        // Batch insert new previous matches
        if (!newPreviousMatches.isEmpty()) {
            previousMatchesRepository.batchInsertPreviousMatches(newPreviousMatches);
        }
    }

    private void writeInputFiles(TempFileManager tempFiles,
                                 List<ConstraintSolverDTO> formattedData,
                                 StageMapDTO stageMap) throws IOException {
        // write employee data to file
        Files.writeString(tempFiles.getInputFile(), objectMapper.writeValueAsString(formattedData));

        // write table data to file
        Set<ConstraintSolverTableDTO> tableDTOs = stageMap.getSeatMap().entrySet().stream()
                .map(entry -> new ConstraintSolverTableDTO(entry.getKey(), entry.getValue().size()))
                .collect(Collectors.toSet());

        Files.writeString(tempFiles.getTableFile(), objectMapper.writeValueAsString(tableDTOs));

        // write constraints to file
        Files.writeString(tempFiles.getConstraintsFile(), objectMapper.writeValueAsString(stageMap.getConstraints()));
    }

    @Getter
    private static class TempFileManager implements AutoCloseable {
        private final Path inputFile;
        private final Path tableFile;
        private final Path constraintsFile;
        private final Path outputFile;

        public TempFileManager() throws IOException {
            this.inputFile = Files.createTempFile("seat_allocation_input", ".json");
            this.tableFile = Files.createTempFile("seat_allocation_table", ".json");
            this.constraintsFile = Files.createTempFile("seat_allocation_constraints", ".json");
            this.outputFile = Files.createTempFile("seat_allocation_output", ".json");
        }

        @Override
        public void close() {
            deleteFileIfExists(inputFile);
            deleteFileIfExists(tableFile);
            deleteFileIfExists(constraintsFile);
            deleteFileIfExists(outputFile);
        }

        private void deleteFileIfExists(Path file) {
            try {
                Files.deleteIfExists(file);
            } catch (IOException e) {
                log.warn("Failed to delete temporary file: {}", file, e);
            }
        }
    }

}
