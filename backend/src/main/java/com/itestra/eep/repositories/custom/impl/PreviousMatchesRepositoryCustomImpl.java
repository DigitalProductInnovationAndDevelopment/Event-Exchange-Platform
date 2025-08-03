package com.itestra.eep.repositories.custom.impl;

import com.itestra.eep.dtos.constraintSolver.EmployeeParticipationDTO;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.PreviousMatch;
import com.itestra.eep.repositories.EmployeeParticipationRepository;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.custom.PreviousMatchesRepositoryCustom;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PreviousMatchesRepositoryCustomImpl implements PreviousMatchesRepositoryCustom {

    private final JdbcTemplate jdbcTemplate;
    private final EventRepository eventRepository;
    private final EmployeeParticipationRepository employeeParticipationRepository;


    @Override
    public Map<UUID, List<UUID>> findEmployeeIdsSittingWithAcquaintances(UUID eventId, int cutoffYear) {
        Event event = eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);

        LocalDateTime cutoffDate = event.getDate().minusYears(cutoffYear);
        Set<UUID> eventsToConsider = eventRepository.findEventsByDateBetween(cutoffDate, event.getDate().minusMinutes(1));

        List<Object[]> previousMatchesPairs = employeeParticipationRepository
                .findEmployeePairsOfCurrentEventThatAreAcquaintedFromPreviousEvents(eventsToConsider, eventId);

        return getAcquaintedEmployeesMap(previousMatchesPairs);

    }

    @Override
    public void batchInsertPreviousMatches(List<PreviousMatch.PreviousMatchId> matches) {
        if (matches.isEmpty()) {
            return;
        }

        String sql = """
                INSERT INTO organization.previous_matches
                (first_employee_id, second_employee_id, event_id)
                VALUES (?, ?, ?)
                ON CONFLICT DO NOTHING
                """;

        jdbcTemplate.batchUpdate(sql, matches, matches.size(),
                (PreparedStatement ps, PreviousMatch.PreviousMatchId match) -> {
                    ps.setObject(1, match.getFirstEmployeeId());
                    ps.setObject(2, match.getSecondEmployeeId());
                    ps.setObject(3, match.getEventId());
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Set<EmployeeParticipationDTO> getEmployeeParticipationsWithFilteredPreviousMatches(UUID eventId, LocalDateTime eventDate, int cutoffYear) {

        // we fetch all relevant data with entity graph to reduce DB round trips.
        Event event = eventRepository.findByIdJoinedWithPreviousMatches(eventId).orElseThrow(EventNotFoundException::new);

        LocalDateTime cutoffDate = eventDate.minusYears(cutoffYear);

        Set<UUID> eventsToConsider = eventRepository.findEventsByDateBetween(cutoffDate, eventDate);

        Set<EmployeeParticipationDTO> employeeParticipationDTOs = new HashSet<>();

        event.getEmployeeParticipations().forEach(ep -> {
            Employee emp = ep.getEmployee();
            UUID empId = emp.getId();

            Set<PreviousMatch.PreviousMatchId> filteredMatches = emp.getPreviousMatches().stream()
                    .filter(pm ->
                            eventsToConsider.contains(pm.getId().getEventId()) &&
                                    empId.equals(pm.getId().getFirstEmployeeId()))
                    .map(PreviousMatch::getId)
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            employeeParticipationDTOs.add(new EmployeeParticipationDTO(ep, filteredMatches));
        });

        return employeeParticipationDTOs;
    }

    private Map<UUID, List<UUID>> getAcquaintedEmployeesMap(List<Object[]> pairs) {
        Map<UUID, List<UUID>> result = new HashMap<>();
        for (Object[] pair : pairs) {
            UUID emp1 = (UUID) pair[0];
            UUID emp2 = (UUID) pair[1];

            result.computeIfAbsent(emp1, k -> new ArrayList<>()).add(emp2);
            result.computeIfAbsent(emp2, k -> new ArrayList<>()).add(emp1);
        }
        return result;
    }
}