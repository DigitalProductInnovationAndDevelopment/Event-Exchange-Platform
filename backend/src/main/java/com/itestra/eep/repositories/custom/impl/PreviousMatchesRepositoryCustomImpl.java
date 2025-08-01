package com.itestra.eep.repositories.custom.impl;

import com.itestra.eep.models.PreviousMatch;
import com.itestra.eep.repositories.custom.PreviousMatchesRepositoryCustom;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class PreviousMatchesRepositoryCustomImpl implements PreviousMatchesRepositoryCustom {

    private final JdbcTemplate jdbcTemplate;

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

}