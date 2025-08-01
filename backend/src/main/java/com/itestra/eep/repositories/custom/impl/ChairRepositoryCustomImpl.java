package com.itestra.eep.repositories.custom.impl;

import com.itestra.eep.models.Chair;
import com.itestra.eep.repositories.custom.ChairRepositoryCustom;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ChairRepositoryCustomImpl implements ChairRepositoryCustom {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void batchInsertChair(List<Chair> chairs) {
        if (chairs.isEmpty()) {
            return;
        }

        String sql = """
                INSERT INTO organization.chair
                (id, event_id)
                VALUES (?, ?)
                ON CONFLICT DO NOTHING
                """;

        jdbcTemplate.batchUpdate(sql, chairs, chairs.size(),
                (PreparedStatement ps, Chair chair) -> {
                    ps.setObject(1, chair.getId());
                    ps.setObject(2, chair.getEvent().getId());
                });
    }

    @Override
    public void batchUpdateEmployeeParticipationsChairAssignments(Map<UUID, UUID> participationToChairMap) {
        if (participationToChairMap.isEmpty()) {
            return;
        }

        String sql = """
                UPDATE organization.employee_participation
                SET chair_id = ?
                WHERE id = ?
                """;

        handleInsert(participationToChairMap, sql);
    }

    @Override
    public void batchUpdateVisitorParticipationsChairAssignments(Map<UUID, UUID> participationToChairMap) {
        if (participationToChairMap.isEmpty()) {
            return;
        }

        String sql = """
                UPDATE organization.visitor_participation
                SET chair_id = ?
                WHERE id = ?
                """;

        handleInsert(participationToChairMap, sql);
    }

    private void handleInsert(Map<UUID, UUID> participationToChairMap, String sql) {
        List<Map.Entry<UUID, UUID>> entries = new ArrayList<>(participationToChairMap.entrySet());

        jdbcTemplate.batchUpdate(sql, entries, entries.size(),
                (PreparedStatement ps, Map.Entry<UUID, UUID> entry) -> {
                    ps.setObject(1, entry.getValue()); // chairId
                    ps.setObject(2, entry.getKey());   // participationId
                });
    }
}