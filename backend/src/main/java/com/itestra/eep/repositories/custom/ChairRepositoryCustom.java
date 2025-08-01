package com.itestra.eep.repositories.custom;

import com.itestra.eep.models.Chair;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public interface ChairRepositoryCustom {

    void batchInsertChair(List<Chair> chairs);

    void batchUpdateEmployeeParticipationsChairAssignments(Map<UUID, UUID> participationToChairMap);

    void batchUpdateVisitorParticipationsChairAssignments(Map<UUID, UUID> participationToChairMap);
}
