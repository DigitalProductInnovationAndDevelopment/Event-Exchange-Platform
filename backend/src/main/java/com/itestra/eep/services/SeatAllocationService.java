package com.itestra.eep.services;

import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.constraintSolver.StageMapDTO;
import com.itestra.eep.models.Participation;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface SeatAllocationService {

    List<SeatAllocationDetailsDTO> getSeatAllocations(UUID eventId);

    Map<UUID, List<UUID>> findEmployeeIdsSittingWithAcquaintances(UUID eventId);

    <T extends Participation> void assignOneParticipantToChairAndPersistNewNeighbors(UUID participationId, UUID chairId, UUID eventId,
                                                                                     Class<T> participationClass, UUID[] neighborProfileIds);

    void performTableBasedSeatAllocation(UUID eventId, StageMapDTO stageMap) throws IOException, InterruptedException;
}
