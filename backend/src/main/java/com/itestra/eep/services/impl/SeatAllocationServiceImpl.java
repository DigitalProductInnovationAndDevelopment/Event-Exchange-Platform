package com.itestra.eep.services.impl;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itestra.eep.dtos.ConstraintSolverDTO;
import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.StageMapDTO;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.mappers.EmployeeParticipationMapper;
import com.itestra.eep.models.Chair;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.VisitorParticipation;
import com.itestra.eep.repositories.ChairRepository;
import com.itestra.eep.repositories.EmployeeParticipationRepository;
import com.itestra.eep.repositories.EventRepository;
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

    @Override
    public List<SeatAllocationDetailsDTO> getSeatAllocations(UUID eventId) {
        eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);
        return eventRepository.findSeatAllocationsByEventId(eventId);
    }


    /**
     * @param chairId set UUID null for seat un-allocation
     */
    @Override
    public void updateSeatAllocation(UUID participationId, UUID chairId, UUID eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);
        if (chairId != null && !chairRepository.existsById(chairId)) {
            chairRepository.saveAndFlush(new Chair(chairId, event));
        }

        eventRepository.updateEmployeeParticipationChairId(participationId, chairId);
        eventRepository.updateVisitorParticipationChairId(participationId, chairId);
    }

    // TODO refactor and think of optimization
    @Override
    public void performTableBasedSeatAllocation(UUID eventId, StageMapDTO stageMap) throws IOException, InterruptedException {
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

        Set<UUID> tableKeys = stageMap.getSeatMap().keySet();
        Map<Integer, UUID> tableKeyTempMapper = new HashMap<>();

        StringBuilder jsonBuilder = new StringBuilder("[");
        boolean first = true;
        int i = 0;
        for (UUID tableKey : tableKeys) {
            tableKeyTempMapper.put(i, tableKey);
            if (!first) {
                jsonBuilder.append(",");
            }
            jsonBuilder.append("{\"table_id\": \"")
                    .append(i)
                    .append("\",\"Anzahl\": ")
                    .append(stageMap.getSeatMap().get(tableKey).size())
                    .append("}");
            first = false;
            i++;
        }
        jsonBuilder.append("]");
        Files.writeString(tempTableFile, jsonBuilder.toString());
        Files.writeString(tempConstraintsFile, "{\"Standort\": 1, \"Projekt\": 1, \"Anstellung\": 1, \"Geschlecht\": 0, \"last neighborhood\": 3}");


        /*TODO
        ProcessBuilder pb = new ProcessBuilder(
                "python3",
                "/algo(table).py", tempInputFile.toString(), tempTableFile.toString(), tempConstraintsFile.toString(), tempOutputFile.toString()
        );*/
        ProcessBuilder pb = new ProcessBuilder(
                "../venv/bin/python",
                "algo(table).py", tempInputFile.toString(), tempTableFile.toString(), tempConstraintsFile.toString(), tempOutputFile.toString()
        );

        // we set the working directory to where algo.py is located
        //TODO pb.directory(new File("/"));
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

        BufferedReader fileReader = Files.newBufferedReader(tempOutputFile);
        List<ConstraintSolverDTO> solved = objectMapper.readValue(fileReader, new TypeReference<>() {
        });

        /*
            String line2;
            while ((line2 = fileReader.readLine()) != null) {
                log.info(line2);
            }
        */

        Map<UUID, List<UUID>> tablesAndTheirSeats = stageMap.getSeatMap().entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> new ArrayList<>(entry.getValue().keySet())
                ));

        solved.forEach(solvedConstraint -> {
                    EmployeeParticipation employeeParticipation = employeeParticipationRepository.findByEmployee_IdAndEvent_Id(solvedConstraint.getProfileId(), eventId).get();
                    VisitorParticipation[] visitorParticipations = employeeParticipation.getVisitorParticipations().toArray(new VisitorParticipation[0]);
                    for (int j = 0; j < ((ArrayList<Integer>) solvedConstraint.getTableIds()[0]).size(); j++) {
                        int tableIndex = ((ArrayList<Integer>) solvedConstraint.getTableIds()[0]).get(0);
                        UUID tableKey = tableKeyTempMapper.get(tableIndex);
                        if (j == 0) {
                            updateSeatAllocation(employeeParticipation.getId(), tablesAndTheirSeats.get(tableKey).get(0), eventId);
                            tablesAndTheirSeats.get(tableKey).remove(0);
                        } else {
                            updateSeatAllocation(visitorParticipations[j - 1].getId(), tablesAndTheirSeats.get(tableKey).get(0), eventId);
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
