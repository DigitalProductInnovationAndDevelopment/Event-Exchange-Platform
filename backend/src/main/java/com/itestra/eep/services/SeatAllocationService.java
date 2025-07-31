package com.itestra.eep.services;

import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.constraintSolver.StageMapDTO;
import com.itestra.eep.models.Participation;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface SeatAllocationService {

    List<SeatAllocationDetailsDTO> getSeatAllocations(UUID eventId);

    <T extends Participation> void assignParticipantToChair(UUID participationId, UUID chairId, UUID eventId, Class<T> participationClass);

    <T extends Participation> void assignParticipantToChairAndPersistNewNeighbors(UUID participationId, UUID chairId, UUID eventId,
                                                                                  Class<T> participationClass, UUID[] neighborProfileIds);

    void performTableBasedSeatAllocation(UUID eventId, StageMapDTO stageMap) throws IOException, InterruptedException;
}
