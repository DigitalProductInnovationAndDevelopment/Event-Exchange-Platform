package com.itestra.eep.services;

import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.SeatAllocationUpsertDTO;
import com.itestra.eep.dtos.constraintSolver.StageMapDTO;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface SeatAllocationService {

    List<SeatAllocationDetailsDTO> getSeatAllocations(UUID eventId);

    void updateSeatAllocation(List<SeatAllocationUpsertDTO> dtos, UUID eventId);

    void performTableBasedSeatAllocation(UUID eventId, StageMapDTO stageMap) throws IOException, InterruptedException;
}
