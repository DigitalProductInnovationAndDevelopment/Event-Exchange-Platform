package com.itestra.eep.services.impl;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.constraintSolver.ConstraintSolverDTO;
import com.itestra.eep.dtos.constraintSolver.ConstraintSolverTableDTO;
import com.itestra.eep.dtos.constraintSolver.StageMapDTO;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.exceptions.InfeasibleSeatAllocationException;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
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

    @Autowired
    @Lazy
    private SeatAllocationService seatAllocationServiceProxy;

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


    /**
     * @param chairId             set UUID null for seat un-allocation
     */
    @Override
    public <T extends Participation> void assignParticipantToChair(UUID participationId, UUID chairId, UUID eventId, Class<T> participationClass) {

        Event event = eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);

        // create chair if it doesn't exist
        if (chairId != null && !chairRepository.existsById(chairId)) {
            chairRepository.saveAndFlush(new Chair(chairId, event));
        }

        // update chair assignment based on participation type
        updateChairAssignmentByType(participationId, chairId, participationClass);
    }

    @Override
    public <T extends Participation> void assignParticipantToChairAndPersistNewNeighbors(UUID participationId, UUID chairId, UUID eventId,
                                                                                         Class<T> participationClass, UUID[] neighborProfileIds) {
        // first assign the chair
        seatAllocationServiceProxy.assignParticipantToChair(participationId, chairId, eventId, participationClass);

        if (chairId == null) {
            // if unassigning from chair, clean up previous matches
            employeeParticipationRepository.findById(participationId)
                    .ifPresent(participation ->
                            previousMatchesRepository.deleteByEventIdAndEmployeeId(eventId, participation.getEmployee().getId())
                    );
        } else if (neighborProfileIds != null && neighborProfileIds.length > 0) {
            // if assigning to chair with neighbors, record previous matches
            recordEmployeePreviousMatches(participationId, eventId, neighborProfileIds);
        }
    }

    private void updateChairAssignmentByType(UUID participationId, UUID chairId, Class<?> participationClass) {
        if (participationClass == null) {
            // Update both types if class is not specified
            eventRepository.updateEmployeeParticipationChairId(participationId, chairId);
            eventRepository.updateVisitorParticipationChairId(participationId, chairId);
        } else if (EmployeeParticipation.class.isAssignableFrom(participationClass)) {
            eventRepository.updateEmployeeParticipationChairId(participationId, chairId);
        } else if (VisitorParticipation.class.isAssignableFrom(participationClass)) {
            eventRepository.updateVisitorParticipationChairId(participationId, chairId);
        } else {
            throw new IllegalArgumentException("Unsupported participation class: " + participationClass.getSimpleName());
        }
    }

    private void recordEmployeePreviousMatches(UUID participationId, UUID eventId, UUID[] neighborProfileIds) {
        Optional<EmployeeParticipation> employeeParticipation = employeeParticipationRepository.findById(participationId);

        if (employeeParticipation.isEmpty()) {
            // not an employee participation then no need to record matches
            return;
        }

        UUID employeeId = employeeParticipation.get().getEmployee().getId();
        List<PreviousMatch> previousMatches = createBidirectionalMatches(employeeId, neighborProfileIds, eventId);

        if (!previousMatches.isEmpty()) {
            previousMatchesRepository.saveAllAndFlush(previousMatches);
        }
    }

    private List<PreviousMatch> createBidirectionalMatches(UUID employeeId, UUID[] neighborIds, UUID eventId) {
        List<PreviousMatch> matches = new ArrayList<>(neighborIds.length * 2);

        for (UUID neighborId : neighborIds) {
            // we create bidirectional matches here
            matches.add(new PreviousMatch(new PreviousMatch.PreviousMatchId(employeeId, neighborId, eventId)));
            matches.add(new PreviousMatch(new PreviousMatch.PreviousMatchId(neighborId, employeeId, eventId)));
        }

        return matches;
    }

    // TODO refactor and think of optimization
    @Override
    public void performTableBasedSeatAllocation(UUID eventId, StageMapDTO stageMap) throws IOException, InterruptedException {
        Event event = eventRepository.findByIdJoinedWithPreviousMatches(eventId).orElseThrow(EventNotFoundException::new);

        List<EmployeeParticipation> employeeParticipations = event.getEmployeeParticipations().stream().toList();
        List<ConstraintSolverDTO> formattedData = employeeParticipationMapper.toConstraintSolverDTO(employeeParticipations);

        Map<UUID, List<UUID>> tablesAndTheirSeats = stageMap.getSeatMap().entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> new ArrayList<>(entry.getValue().keySet())));

        int totalAvailableSeat = tablesAndTheirSeats.values().stream().mapToInt(List::size).sum();

        if (event.getParticipantCount() > totalAvailableSeat) {
            throw new NotEnoughSeatForSeatAllocationException(event.getParticipantCount(), totalAvailableSeat);
        }

        // we create input and output temp files
        try (TempFileManager tempFiles = new TempFileManager()) {
            writeInputFiles(tempFiles, formattedData, stageMap);

            ProcessBuilder pb;

            if (Files.notExists(Path.of("../venv/bin/python"))) {
                pb = new ProcessBuilder(
                        "python3",
                        "/algo(table).py", tempFiles.inputFile.toString(), tempFiles.tableFile.toString(), tempFiles.constraintsFile.toString(), tempFiles.outputFile.toString()
                );
            } else {
                pb = new ProcessBuilder(
                        "../venv/bin/python",
                        "algo(table).py", tempFiles.inputFile.toString(), tempFiles.tableFile.toString(), tempFiles.constraintsFile.toString(), tempFiles.outputFile.toString()
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

            BufferedReader fileReader = Files.newBufferedReader(tempFiles.outputFile);
            List<ConstraintSolverDTO> solved = objectMapper.readValue(fileReader, new TypeReference<>() {
            });


            // Map to track which table each employee is seated at
            Map<UUID, UUID> employeeToTableMap = new HashMap<>();
            Map<UUID, EmployeeParticipation> existingEmployeeParticipationsMap = event.getEmployeeParticipations()
                    .stream()
                    .collect(Collectors.toMap(ep -> ep.getEmployee().getId(), Function.identity()));


            // Set eventId to null for all chairs so that all of them unassigned
            eventRepository.unsetAllEmployeeParticipationChairsByEventId(eventId);
            eventRepository.unsetAllVisitorParticipationChairsByEventId(eventId);
            eventRepository.flush();

            solved.forEach(solvedConstraint -> {
                        EmployeeParticipation employeeParticipation = existingEmployeeParticipationsMap.get(solvedConstraint.getProfileId());
                        VisitorParticipation[] visitorParticipations = employeeParticipation.getVisitorParticipations().toArray(new VisitorParticipation[0]);
                        for (int j = 0; j < (solvedConstraint.getTableIds()).length; j++) {
                            UUID tableKey = UUID.fromString(Arrays.copyOf(solvedConstraint.getTableIds(), solvedConstraint.getTableIds().length, String[].class)[0]);
                            // first the employee is seated
                            if (j == 0) {
                                seatAllocationServiceProxy.assignParticipantToChair(employeeParticipation.getId(), tablesAndTheirSeats.get(tableKey).get(0), eventId, EmployeeParticipation.class);
                                tablesAndTheirSeats.get(tableKey).remove(0);
                                // we also track employee's table assignment so that we can reference them back whn we clculate new entites for PreviousMatches table
                                employeeToTableMap.put(employeeParticipation.getEmployee().getId(), tableKey);
                            } else {
                                seatAllocationServiceProxy.assignParticipantToChair(visitorParticipations[j - 1].getId(), tablesAndTheirSeats.get(tableKey).get(0), eventId, VisitorParticipation.class);
                                tablesAndTheirSeats.get(tableKey).remove(0);
                            }
                        }
                    }
            );

            // Delete all previous matches for this event
            previousMatchesRepository.deleteAllByEventId(eventId);

            // Create new previous matches for employees seated at the same table
            List<PreviousMatch> newPreviousMatches = new ArrayList<>();

            // Group employees by table
            Map<UUID, List<UUID>> tableToEmployeesMap = new HashMap<>();
            employeeToTableMap.forEach((employeeId, tableId) -> {
                tableToEmployeesMap.computeIfAbsent(tableId, k -> new ArrayList<>()).add(employeeId);
            });

            // Create pairs for each table
            tableToEmployeesMap.values().forEach(employeesAtTable -> {
                for (int i = 0; i < employeesAtTable.size(); i++) {
                    for (int j = i + 1; j < employeesAtTable.size(); j++) {
                        UUID employeeId1 = employeesAtTable.get(i);
                        UUID employeeId2 = employeesAtTable.get(j);
                        newPreviousMatches.add(new PreviousMatch(new PreviousMatch.PreviousMatchId(employeeId1, employeeId2, eventId)));
                        newPreviousMatches.add(new PreviousMatch(new PreviousMatch.PreviousMatchId(employeeId2, employeeId1, eventId)));
                    }
                }
            });

            // Batch insert new previous matches
            if (!newPreviousMatches.isEmpty()) {
                previousMatchesRepository.saveAll(newPreviousMatches);
            }
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
