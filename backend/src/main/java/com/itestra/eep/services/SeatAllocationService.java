package com.itestra.eep.services;

import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.StageMapDTO;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface SeatAllocationService {

    List<SeatAllocationDetailsDTO> getSeatAllocations(UUID eventId);

    void updateSeatAllocation(UUID participationId, UUID chairId, UUID eventId);

    void performTableBasedSeatAllocation(UUID eventId, StageMapDTO stageMap) throws IOException, InterruptedException;
}
