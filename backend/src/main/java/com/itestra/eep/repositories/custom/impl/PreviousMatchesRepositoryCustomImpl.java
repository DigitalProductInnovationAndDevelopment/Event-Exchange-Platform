package com.itestra.eep.repositories.custom.impl;

import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.PreviousMatch;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.repositories.custom.PreviousMatchesRepositoryCustom;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PreviousMatchesRepositoryCustomImpl implements PreviousMatchesRepositoryCustom {

    private final JdbcTemplate jdbcTemplate;
    private final EventRepository eventRepository;
    private final EntityManager entityManager;

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
    public Set<EmployeeParticipation> getEmployeeParticipationsWithFilteredPreviousMatches(UUID eventId, int cutoffYear) {

        Session session = entityManager.unwrap(Session.class);
        session.setDefaultReadOnly(true);

        // we fetch all relevant data with entity graph to reduce DB round trips.
        Event event = eventRepository.findByIdJoinedWithPreviousMatches(eventId).orElseThrow(EventNotFoundException::new);

        LocalDateTime eventDate = event.getDate();
        LocalDateTime cutoffDate = eventDate.minusYears(cutoffYear);

        event.getEmployeeParticipations().forEach(ep -> {
            Employee emp = ep.getEmployee();
            UUID empId = emp.getId();


            Set<PreviousMatch> filteredMatches = emp.getPreviousMatches().stream()
                    .filter(pm -> {
                        LocalDateTime pmDate = pm.getId().getEvent().getDate();
                        return pmDate.isBefore(eventDate) &&
                                pmDate.isAfter(cutoffDate) &&
                                empId.equals(pm.getId().getFirstEmployeeId());
                    })
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            emp.getPreviousMatches().retainAll(filteredMatches);
        });

        return event.getEmployeeParticipations();
    }

}