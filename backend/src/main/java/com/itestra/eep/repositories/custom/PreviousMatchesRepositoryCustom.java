package com.itestra.eep.repositories.custom;

import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.PreviousMatch;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Repository
public interface PreviousMatchesRepositoryCustom {

    Map<UUID, List<UUID>> findEmployeeIdsSittingWithAcquaintances(UUID eventId, int cutoffYear);

    void batchInsertPreviousMatches(List<PreviousMatch.PreviousMatchId> matches);

    Set<EmployeeParticipation> getEmployeeParticipationsWithFilteredPreviousMatches(UUID eventId, int cutoffYear);
}