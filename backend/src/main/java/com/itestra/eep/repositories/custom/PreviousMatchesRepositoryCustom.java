package com.itestra.eep.repositories.custom;

import com.itestra.eep.dtos.constraintSolver.EmployeeParticipationDTO;
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

    Set<EmployeeParticipationDTO> getEmployeeParticipationsWithFilteredPreviousMatches(UUID event, LocalDateTime eventDate, int cutoffYear);
}